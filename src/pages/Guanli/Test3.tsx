import { addVideo, getAnimeById } from '@/services/api/animeController';
import { Button, Transfer, TransferProps } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

interface RecordType {
  key: string;
  title: string;
}

interface SelectType {
  key: React.Key;
  title: string;
  // success表示已成功添加到队列
  status: 'default' | 'success';
}

interface Test3Props {
  animeId: number;
  animeMsg?: API.AnimeIndexResp;
  setAnimeMsg: (animeMsg: API.AnimeIndexResp) => void;
  fileVideos: API.AnimeVideosResp[] | undefined;
  setFileVideos: (
    fileVideos:
      | API.AnimeVideosResp[]
      | ((prev: API.AnimeVideosResp[] | undefined) => API.AnimeVideosResp[]),
  ) => void;
  onCancel: () => void;
}

const Test3: React.FC<Test3Props> = ({
  animeId,
  animeMsg,
  setAnimeMsg,
  fileVideos,
  setFileVideos,
  onCancel,
}) => {
  const [mockData, setMockData] = useState<RecordType[]>([]);
  const [targetKeys, setTargetKeys] = useState<SelectType[]>([]);

  const handleChange: TransferProps['onChange'] = (newTargetKeys, direction, moveKeys) => {
    const newTargets = newTargetKeys.map((key) => ({
      key,
      title: mockData.find((item) => item.key === key)?.title || '',
      status: 'default',
    })) as SelectType[];
    setTargetKeys(newTargets);
  };
  useEffect(() => {
    console.log('targetKeys', targetKeys);
  }, [targetKeys]);

  const renderItem = (item: RecordType) => {
    const customLabel = <span className="custom-item">{item.title}</span>;

    return {
      label: customLabel, // for displayed item
      value: item.title, // for title and filter matching
    };
  };

  const [directoryHandle, setDirectoryHandle] = useState<any>(null);
  const FileSplit = '/';
  const videoExtensions = [
    '.mp4',
    '.avi',
    '.mov',
    '.mkv',
    '.flv',
    '.wmv',
    '.mpeg',
    '.mpg',
    '.webm',
    '.m4v',
  ];
  // 选择文件函数
  const handlePickDirectory = async () => {
    try {
      //@ts-ignore
      const handle = await window.showDirectoryPicker();
      setDirectoryHandle(handle);
    } catch (err) {
      console.error('Error picking directory:', err);
    }
  };

  useEffect(() => {
    async function readDirectory() {
      if (directoryHandle) {
        const entriesArray = [];
        console.log('这个文件夹', directoryHandle);
        console.log('这个文件夹的名称', directoryHandle.name);
        const name = directoryHandle.name;
        // 通过 index 列表字段确定文件位置 ： [0,1] 表示第一层 的 第一个文件夹下面的 第二个文件/文件夹
        // isOpen 表示如果是文件夹是否展开
        let index = 0;
        for await (const entry of directoryHandle.values()) {
          console.log('查看打开文件夹下的所有文件entry：', entry);
          entry.path = name + FileSplit + entry.name;
          entry.index = [index];
          entry.isOpen = false;
          if (entry.kind === 'file' && videoExtensions.some((ext) => entry.name.endsWith(ext))) {
            entriesArray.push({
              key: entry.path,
              title: entry.name,
            });
          }
          console.log('查看打开文件夹下的所有文件entry：', entry);
          console.log('查看打开文件夹下的所有文件唯一标识：', entry.path);
          index++;
        }
        setMockData(entriesArray);
      }
    }

    readDirectory();
  }, [directoryHandle]);

  const animeMsgRef = useRef<API.AnimeIndexResp | undefined>(undefined);
  useEffect(() => {
    animeMsgRef.current = animeMsg;
  }, [animeMsg]);
  const handleAutoUpload = async () => {
    if (targetKeys.length === 0) {
      return;
    }
    console.log('1');
    const videos: API.AnimeVideosResp[] = []; // 全部添加好后同时更新 fileVideos 同时上传
    for (let i = 0; i < targetKeys.length; i++) {
      const item = targetKeys[i];
      console.log('进行的索引' + i);
      const animemsgCurrent = animeMsgRef.current;
      if (!animemsgCurrent) {
        break;
      }
      console.log('现在的动漫数据', animemsgCurrent);
      const path = item.key as string;
      const c = path.split(FileSplit);
      let handle = directoryHandle;
      for (let i = 1; i < c.length; i++) {
        if (i === c.length - 1) {
        } else {
          handle = await handle.getDirectoryHandle(c[i]);
        }
      }
      const fileHandle = await handle.getFileHandle(c[c.length - 1]);
      const fileData = await fileHandle.getFile();
      console.log('文件', fileData);
      let rank = 1;
      // 找到最后一个视频
      const video = animemsgCurrent.videos?.[animemsgCurrent.videos.length - 1];
      if (video) {
        rank = (video.rank || 0) + 1;
      }

      console.log('rank:', rank);
      // 去除前两个字符和去除后缀
      const tempTitle = item.title.slice(2);
      const lastTitle =
        tempTitle.lastIndexOf('.') !== -1
          ? tempTitle.slice(0, tempTitle.lastIndexOf('.'))
          : tempTitle; // 如果没有后缀则保持原样
      const isAdd = await addVideo({
        animeId: animeId,
        rank: rank,
        title: lastTitle,
      });
      if (!isAdd) break;
      console.log('添加成功');
      const res = await getAnimeById({ id: animeId });
      if (!res) break;
      setAnimeMsg(res);
      animeMsgRef.current = res;
      console.log('重新获取动漫信息执行成功');

      console.log('重新获取动漫信息', res);
      if (!res) break;
      const video2 = res.videos?.[res.videos.length - 1];
      console.log('重新获取视频信息', res);
      if (!video2) break;
      if (
        Number(video2?.animeId) === Number(animeId) &&
        Number(video2.rank) === Number(rank) &&
        video2.title === lastTitle
      ) {
        console.log('出现为相同');
        // 添加到fileVideo最后面
        // 方法一 这个添加好直接开始上传 但可能导致后续的添加缓慢
        // setFileVideos((prev) => {
        //   return [
        //     ...(prev || []),
        //     {
        //       ...video2,
        //       file: fileData,
        //     },
        //   ];
        // });
        // 方法二 先添加到 videos 数组中 最后统一上传
        videos.push({
          ...video2,
          fileData: fileData,
        });
      }
    }
    // 统一执行上传功能
    if (videos.length > 0) {
      setFileVideos((prev) => {
        return [...(prev || []), ...videos];
      });
    }
    console.log('3');
    onCancel();
    setTargetKeys([]);
  };
  return (
    <>
      <Button onClick={handlePickDirectory}>选择文件夹</Button>
      <Button onClick={handleAutoUpload}>确认选中文件及顺序自动上传</Button>
      <Transfer
        dataSource={mockData}
        listStyle={{
          width: 300,
          height: 300,
        }}
        targetKeys={targetKeys.map((item) => item.key)}
        onChange={handleChange}
        render={renderItem}
      />
    </>
  );
};

export default Test3;
