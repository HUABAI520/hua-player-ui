import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Flex,
  Typography,
  message,
  Progress,
  Upload,
  UploadFile,
  Tag,
  Rate,
  Image,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  SelectProps,
  Spin,
} from 'antd';
import {
  CheckOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  InboxOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  addVideo,
  get,
  getAnimeById,
  list,
  uploadVideo,
  uploadVideoPicture,
} from '@/services/api/animeController';
import Sider from 'antd/es/layout/Sider';
import { useLocation, useNavigate } from '@@/exports';
import { LanguageIcon } from '@/common/DefinedIcon';
import InfoDisplay from '@/pages/Manage/components/InfoDisplay';
import TextArea from 'antd/es/input/TextArea';
import { AnimeAdOrUp } from '@/common/Edit/AnimeAdOrUp';
import { AvatarView } from '@/pages/User/Settings/components/base';
import { fetch } from '@/common/utils/DelayUtil';
import UploadArea from '@/pages/Manage/components/UploadArea';

const { Dragger } = Upload;
const MAX_CHUNK_SIZE = 6 * 1024 * 1024; // 6MB
const MIN_CHUNK_SIZE = 6 * 1024 * 1024; // 6MB

const UploadVideo: React.FC = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const [imgOpen, setImgOpen] = useState(false);
  const navigate = useNavigate();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [blobList, setBlobList] = useState<Blob[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0); // 当前分片索引
  const [isPaused, setIsPaused] = useState(false); // 是否暂停上传
  const [isUploading, setIsUploading] = useState(false); // 是否运行上传
  const [fileVideo, setFileVideo] = useState<API.AnimeVideosResp>();
  const [isVideoShow, setIsVideoShow] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const animeIdP = queryParams.get('animeId');
  const [animeId, setAnimeId] = useState(Number(animeIdP));
  const [videoForm, setVideoForm] = useState<API.AnimeVideosReq>();
  const [animeMsg, setAnimeMsg] = useState<API.AnimeIndexResp>();
  const [data, setData] = useState<SelectProps['options']>([]);
  const [value, setValue] = useState<string | undefined>();
  const [fetching, setFetching] = useState(false);
  const [select, setSelect] = useState(false);
  const getAnimeData = async () => {
    if (animeId === 0) {
      return;
    }
    const res = await getAnimeById({ id: animeId });
    if (res) {
      // 将状态和 id 设置到浏览器的url 后面
      const currentUrl = new URL(window.location.href, window.location.origin);
      // 获取当前查询参数的迭代器
      const searchParams = new URLSearchParams(currentUrl.search);
      searchParams.set('animeId', String(res.id));
      currentUrl.search = searchParams.toString();
      history.pushState({}, '', currentUrl.toString());
      setAnimeMsg(res);
      setValue(res.name);
    }
  };
  useEffect(() => {
    if (animeId != null && animeId !== 0) {
      getAnimeData();
    } else if (animeId === 0) {
      navigate('/404');
      return;
    }
  }, [animeId]);
  // 文件分片函数
  const splitFile = (file: File): Blob[] => {
    const chunks: Blob[] = [];
    const fileSize = file.size;
    for (let i = 0; i < fileSize; i += MAX_CHUNK_SIZE) {
      if (i + MIN_CHUNK_SIZE + MAX_CHUNK_SIZE > fileSize) {
        chunks.push(file.slice(i, fileSize));
        return chunks;
      } else chunks.push(file.slice(i, i + MAX_CHUNK_SIZE));
    }
    return chunks;
  };

  // 上传分片函数
  const uploadChunk = async (chunk: Blob, chunkIndex: number): Promise<void> => {
    const formData = new FormData();
    const file = fileList[0].name.split('.', 2);
    const fileName = file[0];
    const fileSuffix = '.' + file[1];
    formData.append('file', chunk, fileName);
    // 如果 chunk 不是 Blob，手动转换为 Blob
    const blobChunk = chunk instanceof Blob ? chunk : new Blob([chunk]);
    // console.log('blobChunk的类型:', typeof blobChunk);
    formData.append('file', blobChunk, fileName);
    console.log('animeId', fileVideo?.animeId);
    console.log('videoId', fileVideo?.id);
    const res = await uploadVideo(
      {
        animeId: fileVideo?.animeId!,
        videoId: fileVideo?.id!,
        fileName: fileName,
        fileSuffix: fileSuffix,
        partNumber: chunkIndex + 1,
        total: blobList.length,
      },
      formData.get('file') as File,
    );
    if (!res || res < 0) {
      if (res === -1) {
        message.destroy();
        message.error('上传出错~ 请点击全部重新上传~');
        setIsPaused(true);
        setUploadProgress(0);
        setCurrentIndex(0);
      } else {
        message.error('上传失败');
      }
    } else {
      const progress = (((chunkIndex + 1) * 100) / blobList.length).toFixed(0);
      // const progressAsNumber = parseFloat(progress); // 将字符串转换回数字
      setUploadProgress(parseFloat(progress));
    }
  };

  const handQie = async (videoId: number | undefined) => {
    if (!videoId || videoId === 0) {
      return;
    }
    const res = await get({ videoId });
    setFileVideo(res);
  };
  // 上传下一个分片
  const processNextChunk = async () => {
    if (isPaused || !isUploading) {
      return;
    }
    let i = currentIndex;
    let s: boolean = isPaused;
    while (i < blobList.length && !s) {
      await uploadChunk(blobList[i], i);
      setIsPaused((prevState) => {
        s = prevState;
        return prevState;
      });
      i++;
      setCurrentIndex(i); // 更新当前分片索引
    }

    if (i === blobList.length) {
      message.success('上传完成');
      setIsUploading(false); // 上传完成后停止
      // 清空缓存
      // setUploadProgress(0)
      setCurrentIndex(0);
      setIsPaused(true);
      setBlobList([]);
      setFileList([]);
      setUploadProgress(0);
      setTimeout(() => {
        handQie(fileVideo?.id || 0);
        getAnimeData();
      }, 100);
    }
  };

  // 提取视频分片的第一帧图片的函数
  const extractFramesFromVideo = async (file: Blob, times: number[]): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const videoElement = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const url = URL.createObjectURL(file); // 创建视频的临时 URL
      videoElement.src = url;

      videoElement.addEventListener('loadedmetadata', () => {
        // 计算视频时长并开始处理
        const videoDuration = videoElement.duration;
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

  const extractFrameAtTime = (
    videoElement: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D | null,
    time: number,
    videoDuration: number,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (time > videoDuration) {
        reject(new Error('指定时间超过视频时长'));
        return;
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

  const [frames, setFrames] = useState<string[]>();

  const base64ToFile = (base64Data: string, filename: string) => {
    const [metadata, data] = base64Data.split(',');
    const mimeString = metadata.split(':')[1].split(';')[0];
    const binaryString = window.atob(data);
    const arrayBuffer = new ArrayBuffer(binaryString.length);
    const uintArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < binaryString.length; i++) {
      uintArray[i] = binaryString.charCodeAt(i);
    }

    return new File([arrayBuffer], filename, { type: mimeString });
  };
  const uploadImage = async (file: File) => {
    const res = await uploadVideoPicture(
      { animeId: fileVideo?.animeId!, videoId: fileVideo?.id! },
      file,
    );
    if (res) {
      message.success('上传视频图片成功');
    } else {
      message.error('上传失败');
    }
  };
  useEffect(() => {
    if (frames && frames.length > 0) {
      // 从 base64 数据中提取并转换为 JPEG 格式的 File 对象
      const base64Data = frames[0].split(',')[1];
      const jpegFile = base64ToFile(`data:image/jpeg;base64,${base64Data}`, 'frame.jpg');

      // 上传图像
      uploadImage(jpegFile);
    }
  }, [frames]);
  // 处理文件上传
  const handleFileUpload = async (file: any) => {
    // if (!isUploading) {
    //   message.error('该集已经有视频无法上传了~');
    //   return Upload.LIST_IGNORE;
    // }
    if (fileList.length !== 0) {
      message.error('同时只能上传一个视频~');
      return Upload.LIST_IGNORE;
    }

    setFileList([...fileList, file]);
    const chunks = splitFile(file);
    setBlobList(chunks);
    setCurrentIndex(0); // 重置索引
    setIsPaused(false); // 确保上传状态为非暂停
    setIsUploading(true); // 设置正在上传状态

    const times = [900]; // 要提取的时间点（秒）
    // 从每个分片中提取第一帧
    const firstFrameImage = await extractFramesFromVideo(file, times);
    setFrames(firstFrameImage);

    processNextChunk(); // 开始上传
  };

  // 切换暂停状态
  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  useEffect(() => {
    if (!isPaused && isUploading) {
      processNextChunk();
    }
  }, [isPaused, isUploading]);
  const cardStyle: React.CSSProperties = {
    width: 'auto',
  };

  const imgStyle: React.CSSProperties = {
    display: 'block',
    width: 273,
  };
  const tiaojian = (video: API.AnimeVideosResp) => {
    return fileVideo?.id && Number(video.id) === Number(fileVideo?.id);
  };

  const [form] = Form.useForm();

  useEffect(() => {
    // 每次 videoForm 发生变化时，重置表单字段值
    form.setFieldsValue(videoForm);
  }, [videoForm]);
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      let p = true;
      animeMsg?.videos?.forEach((video) => {
        if (video.rank === values.rank) {
          p = false;
        }
      });
      if (!p) {
        message.error('该集已经存在~');
        return;
      }
      if (animeMsg?.videos) await addVideo(values);
      message.success('添加成功~');
      getAnimeData();
      setVideoForm(undefined);
      setIsVideoShow(false);
      form.setFieldsValue({});
      // onSubmit(values);
    } catch (errorInfo) {
      console.error('Validation Failed:', errorInfo);
    }
  };

  const handleSearch = (newValue: string) => {
    setFetching(true);
    fetch(newValue, setData, list);
    setFetching(false);
  };

  const handleChange = (newValue: string) => {
    // setValue(newValue);
    setAnimeId(Number(newValue));
  };

  return (
    <>
      <Flex vertical={false} style={{ minWidth: '976px' }}>
        <Sider
          width="50%"
          style={{
            textAlign: 'center',
            lineHeight: '120px',
            color: '#fff',
            backgroundColor: '#f5f5f5',
            marginRight: '10px',
            flex: 1,
            maxHeight: '85vh',
            overflowY: 'auto',
          }}
        >
          <Card hoverable style={cardStyle} styles={{ body: { padding: 0, overflow: 'hidden' } }}>
            <Flex vertical justify={'start'} align={'start'}>
              <Flex gap={'12px'} style={{ width: '100%' }}>
                <Flex
                  onClick={() => {
                    setImgOpen(true);
                  }}
                >
                  <Image
                    alt="avatar"
                    preview={false}
                    src={animeMsg?.image}
                    style={{
                      display: 'block',
                      width: 273,
                      borderRadius: '8px',
                    }}
                  />
                </Flex>
                <Flex
                  gap={'12px'}
                  vertical
                  align="flex-start"
                  flex={1}
                  justify="space-between"
                  style={{ padding: 16, width: '100%' }}
                >
                  {!select ? (
                    <Typography.Title level={3} onDoubleClick={() => setSelect(true)}>
                      {animeMsg?.name}
                    </Typography.Title>
                  ) : (
                    <Select
                      showSearch
                      value={value}
                      size={'large'}
                      style={{
                        width: 'auto',
                        fontWeight: 'bold',
                        fontSize: 24,
                        padding: '0 5px 0 0',
                      }}
                      defaultActiveFirstOption={false}
                      suffixIcon={
                        <Button
                          size={'small'}
                          type={'text'}
                          style={{
                            cursor: 'pointer',
                          }}
                          icon={<CloseCircleOutlined />}
                          onClick={() => {
                            setSelect(false);
                          }}
                        />
                      }
                      filterOption={false}
                      onSearch={handleSearch}
                      onChange={handleChange}
                      notFoundContent={fetching ? <Spin size="small" /> : null}
                      options={(data || []).map((d) => ({
                        value: d.value,
                        label: d.text,
                      }))}
                    />
                  )}

                  <Flex>
                    <Tag color={'default'} bordered={false} icon={<ClockCircleOutlined />}>
                      {animeMsg?.issueTime?.split('-')[0]}
                    </Tag>
                    {animeMsg?.month && (
                      <Tag color={'default'} bordered={false} icon={<ClockCircleOutlined />}>
                        {animeMsg?.month + '月'}
                      </Tag>
                    )}
                    <Tag color={'default'} bordered={false} icon={<LanguageIcon />}>
                      {animeMsg?.language}
                    </Tag>
                  </Flex>
                  <Flex gap={'small'} align="center" justify="space-between">
                    {animeMsg?.score && <Rate disabled defaultValue={animeMsg?.score} />}
                    <div style={{ color: '#f9ad31', fontWeight: 'bold', fontSize: '20px' }}>
                      {animeMsg?.score?.toFixed(1)}{' '}
                    </div>
                  </Flex>
                  <InfoDisplay label={'导演：'} value={animeMsg?.director} />
                  <InfoDisplay
                    label={'演员：'}
                    value={animeMsg?.actRole?.join('、')}
                    useTooltip={true}
                  />
                  <InfoDisplay label={'类型：'} value={animeMsg?.kind?.join(' ')} />
                  <Flex flex={1} align={'end'} style={{ width: '100%' }}>
                    <Flex justify={'space-between'} align={'center'} style={{ width: '100%' }}>
                      <Button
                        type="primary"
                        onClick={() => {
                          navigate(
                            '/player/?animeId=' + animeMsg?.id + '&videoId=' + fileVideo?.id ??
                              animeMsg?.videos?.[0]?.id,
                          );
                        }}
                        size={'large'}
                        icon={<PlayCircleOutlined />}
                        style={{ padding: '24px' }}
                      >
                        播放
                      </Button>
                      <Button
                        type="default"
                        onClick={async () => {
                          await getAnimeData();
                          setOpen(true);
                        }}
                        style={{ borderRadius: '20px', padding: '20px' }} // 自定义圆角半径
                      >
                        修改
                      </Button>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
              <Button
                type="text"
                size={'large'}
                style={{
                  padding: '12px',
                  marginTop: '24px',
                  fontWeight: 'bold',
                  color: '#3b8dfe',
                }}
              >
                简介
              </Button>
              <TextArea
                value={animeMsg?.intro}
                style={{ padding: '0px 12px 6px ', marginBottom: '16px', color: 'black' }}
                autoSize
                disabled
                variant="borderless"
              />
            </Flex>
          </Card>
        </Sider>
        <Sider
          style={{
            textAlign: 'center',
            lineHeight: '120px',
            color: '#fff',
            // backgroundColor: '#e4c3de',
            backgroundColor: '#f5f5f5',
            flex: 1,
            maxHeight: '85vh',
            overflowY: 'auto',
          }}
        >
          {animeMsg?.videos?.map((video, index) => (
            <Card
              hoverable
              styles={{
                body: {
                  padding: '5px',
                  overflow: 'hidden',

                  width: '100%',
                },
              }}
              style={{
                backgroundColor: tiaojian(video) ? '#9bd8f8' : 'white',
                border: tiaojian(video) ? '2px solid #3b8dfe' : 'none',
                marginBottom: '6px',
              }}
              key={video.id}
              onClick={() => {
                if (isUploading) {
                  return message.error('正在上传中，请稍后再试');
                }
                handQie(video.id || 0);
              }}
            >
              <Flex vertical align="start" justify="center">
                <Typography.Text
                  style={{
                    fontSize: '14px',
                    color: '#999',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                  }}
                >
                  第 {video.rank} 集
                </Typography.Text>
                {/*循环 animeMsg.videos*/}
                <Flex align="start" justify="space-between" style={{ width: '100%' }}>
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    {video.title}
                  </Typography.Title>

                  <Typography.Title level={5} style={{ margin: 0 }}>
                    {video.file ? (
                      <span style={{ color: '#3b8dfe' }}>有视频文件</span>
                    ) : (
                      <span style={{ color: 'red' }}>无视频文件</span>
                    )}
                  </Typography.Title>
                </Flex>
              </Flex>
            </Card>
          ))}
          <Card
            hoverable
            styles={{
              body: {
                padding: '5px',
                overflow: 'hidden',
                width: '100%',
              },
            }}
            style={{
              marginBottom: '6px',
            }}
            onClick={() => {
              setVideoForm({
                animeId: animeId,
                rank: animeMsg?.videos?.length! + 1,
                title: '第' + (animeMsg?.videos?.length! + 1) + '集',
              });
              setIsVideoShow(true);
            }}
          >
            <Flex vertical align="start" justify="center">
              <Typography.Text
                style={{
                  fontSize: '14px',
                  color: '#999',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                }}
              >
                {'第' + ((animeMsg?.videos?.length || 0) + 1) + '集视频？'}
              </Typography.Text>
              {/*循环 animeMsg.videos*/}
              <Flex align="end" justify="center" style={{ width: '100%' }}>
                <Typography.Title level={5} style={{ margin: 0 }}>
                  <PlusOutlined size={50} />
                </Typography.Title>
              </Flex>
            </Flex>
          </Card>
        </Sider>

        <UploadArea fileVideo={fileVideo} setFileVideo={setFileVideo} getAnimeData={getAnimeData} />
      </Flex>

      <Modal
        title={'添加第' + videoForm?.rank + '集'}
        open={isVideoShow}
        onOk={handleOk}
        width={300}
        onCancel={() => setIsVideoShow(false)}
        okText="提交"
      >
        <Form form={form} layout="vertical" initialValues={videoForm} onFinish={handleOk}>
          <Form.Item
            label="Anime ID"
            name="animeId"
            hidden={true}
            rules={[{ required: true, message: 'Anime ID is required' }]}
          >
            <Input disabled variant="borderless" style={{ color: 'black' }} />
          </Form.Item>

          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: 'Title is required' }]}
          >
            <Input autoFocus allowClear onPressEnter={handleOk} />
          </Form.Item>

          <Form.Item
            label="排序"
            name="rank"
            rules={[{ required: true, message: 'Rank is required' }]}
          >
            <InputNumber
              onChange={(value) => {
                setVideoForm({
                  ...videoForm,
                  // @ts-ignore
                  rank: value,
                });
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={'修改动漫'}
        width={600}
        onCancel={() => setOpen(false)}
        open={open}
        style={{ padding: '16px' }}
        footer={null}
        destroyOnClose
      >
        <AnimeAdOrUp
          open={open}
          cancelDo={() => setOpen(false)}
          reload={getAnimeData}
          animeMsg={animeMsg}
        />
      </Modal>
      <Modal
        title={'更新图片'}
        width={600}
        onCancel={() => setImgOpen(false)}
        cancelText={'完成'}
        open={imgOpen}
        style={{ padding: '16px' }}
        footer={null}
        destroyOnClose
      >
        <AvatarView
          avatar={animeMsg?.image}
          animeId={animeMsg?.id}
          reload={getAnimeData}
          onCancel={() => setImgOpen(false)}
        />
      </Modal>
    </>
  );
};

export default UploadVideo;
