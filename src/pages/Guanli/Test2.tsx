import { FileOutlined, FolderOutlined } from '@ant-design/icons';
import { Button, Flex, List } from 'antd';
import { useEffect, useState } from 'react';

const FolderItem = ({
  folder,
  level = 0,
  onClick,
}: {
  folder: any;
  level: number;
  onClick: (entry: any) => void;
}) => {
  // 用于缩进，表示层级
  // const indent = level * 12;

  return (
    <div style={{ paddingLeft: 14 }}>
      <List.Item
        style={{ padding: '0', cursor: 'pointer', margin: '5px' }}
        className={'list-item'}
        onClick={() => {
          onClick(folder);
        }}
      >
        {folder.kind === 'file' ? <FileOutlined /> : <FolderOutlined />} {folder.name}
      </List.Item>
      {folder.isOpen && folder.children && folder.children.length > 0 && (
        <List
          dataSource={folder.children}
          renderItem={(subFolder, index) => (
            <FolderItem
              folder={subFolder}
              level={level + 1}
              onClick={(entry) => {
                onClick(entry);
              }}
            />
          )}
        />
      )}
      {/*{folder.kind === 'directory' && folder.values() && folder.values().length > 0 && (*/}
      {/*  <List*/}
      {/*    dataSource={folder.values()}*/}
      {/*    renderItem={(subFolder, index) => (*/}
      {/*      <FolderItem folder={subFolder} level={level + 1} onClick={() => onClick(folder)} />*/}
      {/*    )}*/}
      {/*  />*/}
      {/*)}*/}
    </div>
  );
};
const FileSplit = '/';
const oneMb = 1024 * 1024;
const MIN_CHUNK_SIZE = 6 * 1024 * 1024; // 6MB
const MAX_CHUNK_SIZE = 100 * 1024 * 1024; // 6MB
const getMaxChunkSize = (fileSize: number): number => {
  return Math.min((Math.floor(fileSize / (200 * oneMb)) + 1) * 5 * oneMb + oneMb, MAX_CHUNK_SIZE);
};
const Test2 = () => {
  const [directoryHandle, setDirectoryHandle] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [files, setFiles] = useState<
    {
      data: any;
      id: string;
    }[]
  >([]);
  const [selectedFile, setSelectedFile] = useState<string>();

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
          entry.path = name + FileSplit + entry.name;
          entry.index = [index];
          entry.isOpen = false;
          entriesArray.push(entry);
          console.log('查看打开文件夹下的所有文件entry：', entry);
          console.log('查看打开文件夹下的所有文件唯一标识：', entry.path);
          index++;
        }
        setEntries(entriesArray);
      }
    }

    readDirectory();
  }, [directoryHandle]);

  const handlePickDirectory = async () => {
    try {
      //@ts-ignore
      const handle = await window.showDirectoryPicker();
      setDirectoryHandle(handle);
      setFiles([]);
      setSelectedFile(undefined);
    } catch (err) {
      console.error('Error picking directory:', err);
    }
  };

  // const renderEntries = () => {
  //   return entries.map((entry, index) => (
  //     <i key={index}>
  //       {entry.name} ({entry.kind === 'file' ? 'file' : 'directory'})
  //     </i>
  //   ));
  // };
  // @ts-ignore
  /*  const children = [];
    if (folder.kind === 'directory') {
      for await (const entry of folder.values()) {
        if (entry.kind === 'directory') {
          // 递归获取子文件夹的内容
          // @ts-ignore
          const subFolderContents = await getFChildren(entry);
          children.push({ name: entry.name, kind: 'directory', children: subFolderContents });
        } else {
          children.push({ name: entry.name, kind: 'file' });
        }
      }
    }
    return children;*/
  const getFChildren = async (folder: any) => {
    const entriesArray = [];
    let index2 = 0;
    for await (const entry of folder.values()) {
      entry.path = folder.path + FileSplit + entry.name;
      entry.index = [...folder.index, index2];
      entry.isOpen = false;
      entriesArray.push(entry);
      index2++;
    }
    return entriesArray;
  };
  const handleFolderClick = async (folder: any) => {
    // 找到对应folder在entries 通过遍历index
    const index = folder.index;
    let c = entries[index[0]];
    for (let i = 1; i < index.length; i++) {
      c = c.children[index[i]];
    }
    if (!folder.children) {
      c.children = await getFChildren(folder);
      c.isOpen = true;
      setEntries([...entries]);
    } else {
      c.isOpen = !c.isOpen;
      setEntries([...entries]);
    }
  };
  const splitFile = (file: File, maxChunkSize: number): Blob[] => {
    const chunks: Blob[] = [];
    const fileSize = file.size;
    if (fileSize <= 5 * 1024 * 1024) {
      chunks.push(file);
      return chunks;
    }
    for (let i = 0; i < fileSize; i += maxChunkSize) {
      if (i + MIN_CHUNK_SIZE + maxChunkSize > fileSize) {
        chunks.push(file.slice(i, fileSize));
        return chunks;
      } else chunks.push(file.slice(i, i + maxChunkSize));
    }
    return chunks;
  };
  const extractFrameAtTime = (
    videoElement: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D | null,
    time: number,
    videoDuration: number,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      // 超过就除以2 直到不超过
      while (time > videoDuration) {
        time = time / 2;
      }
      videoElement.currentTime = time; // 跳转到指定时间

      videoElement.addEventListener(
        'seeked',
        () => {
          // 设置画布的尺寸为视频的尺寸
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;

          // 将帧绘制到画布上
          ctx?.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

          // 获取图片的 data URL
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL); // 返回图片数据
        },
        { once: true },
      );

      videoElement.addEventListener('error', (error) => {
        reject(error); // 处理错误
      });
    });
  };
  const extractFramesFromVideo = async (file: Blob, times: number[]): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const videoElement = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const url = URL.createObjectURL(file); // 创建视频的临时 URL
      videoElement.src = url;

      videoElement.addEventListener('loadedmetadata', () => {
        // 计算视频时长并开始处理
        const videoDuration = videoElement.duration; // 视频总时长
        const imagePromises = times.map((time) =>
          extractFrameAtTime(videoElement, canvas, ctx, time, videoDuration),
        );

        Promise.all(imagePromises)
          .then((images) => {
            URL.revokeObjectURL(url); // 清理临时 URL
            resolve(images); // 返回所有图像数据
          })
          .catch((error) => {
            URL.revokeObjectURL(url);
            reject(error); // 处理错误
          });
      });

      videoElement.addEventListener('error', (error) => {
        URL.revokeObjectURL(url);
        reject(error); // 处理错误
      });
    });
  };
  const [frames, setFrames] = useState<string[]>();
  // 手动选择文件列表上传按照这个顺序
  const [vfiles, setVFiles] = useState<any[]>([]);
  const handleVideoFile = async (file: any) => {
    console.log('点击视频', file);
    // 添加到vfiles最后
    setVFiles([...vfiles, file]);
    // const chunks = splitFile(file, getMaxChunkSize(file.size));
    // // 遍历打印
    // chunks.forEach((item, index) => {
    //   console.log('打印', item, index);
    // });
    // const times = [900]; // 要提取的时间点（秒）
    // // 从每个分片中提取第一帧
    // const firstFrameImage = await extractFramesFromVideo(file, times);
    // setFrames(firstFrameImage);
  };

  const handleGetFile = async (file: any) => {
    const path = file.path;
    console.log('点击文件', path);
    const c = path.split(FileSplit);
    const f = files.filter((item) => item.id !== path);
    let handle = directoryHandle;
    for (let i = 1; i < c.length; i++) {
      if (i === c.length - 1) {
      } else {
        handle = await handle.getDirectoryHandle(c[i]);
      }
    }
    const fileHandle = await handle.getFileHandle(c[c.length - 1]);
    const fileData = await fileHandle.getFile();
    if (fileData.type.startsWith('video/')) {
      handleVideoFile(fileData);
    } else {
      const text = await fileData.text();
      setSelectedFile(path);
      setFiles([...f, { data: text, id: path }]);
    }
  };

  return (
    <div>
      <Button onClick={handlePickDirectory}>选择文件夹</Button>
      {/*frames 是 base64 数据 展示图片 */}
      {frames?.map((item, index) => (
        <img key={index} src={item} alt={`frame ${index}`} />
      ))}
      {directoryHandle && (
        <Flex style={{ width: '100 %' }}>
          <Flex vertical style={{ width: '20%' }}>
            {/*<h2>Directory Contents:</h2>*/}
            {/*<ul>{renderEntries()}</ul>*/}
            <List
              itemLayout="horizontal"
              dataSource={entries}
              renderItem={(entry, index) => (
                // <List.Item style={{ padding: '0' }}>{entry.name}</List.Item>
                <FolderItem
                  folder={entry}
                  key={index}
                  level={0}
                  onClick={(e) => {
                    if (e.kind === 'file') {
                      handleGetFile(e);
                    } else {
                      handleFolderClick(e);
                    }
                  }}
                />
              )}
            />
          </Flex>
          <Flex vertical style={{ width: '80%', marginLeft: '5%' }}>
            {files.map((file, index) => {
              return selectedFile === file.id && <div>{file.data}</div>;
            })}
          </Flex>
        </Flex>
      )}
    </div>
  );
};
export default Test2;
