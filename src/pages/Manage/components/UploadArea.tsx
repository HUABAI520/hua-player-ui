import { formatFileSize } from '@/common/utils/FileSizeUtils';
import { formatSeekTimeToCHEN } from '@/common/utils/timeUtil';
import ImageUploader from '@/pages/Manage/components/imageUpload';
import { deleteVideo, get, uploadVideo, uploadVideoPicture } from '@/services/api/animeController';
import { getFileById } from '@/services/api/fileController';
import {
  CheckCircleOutlined,
  CheckOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileOutlined,
  InboxOutlined,
  PauseOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Image,
  message,
  Modal,
  Progress,
  Skeleton,
  Space,
  Tag,
  theme,
  Typography,
  Upload,
  UploadFile,
} from 'antd';
import Dragger from 'antd/es/upload/Dragger';
import React, { useEffect, useRef, useState } from 'react';

interface UploadAreaProps {
  fileVideo: API.AnimeVideosResp | undefined;
  setFileVideo: (fileVideo: API.AnimeVideosResp) => void;
  getAnimeData: () => void;
  isVisible: boolean;
}

const oneMb = 1024 * 1024;
const MIN_CHUNK_SIZE = 6 * 1024 * 1024; // 6MB
const MAX_CHUNK_SIZE = 100 * 1024 * 1024; // 6MB
const getMaxChunkSize = (fileSize: number): number => {
  return Math.min((Math.floor(fileSize / (200 * oneMb)) + 1) * 5 * oneMb + oneMb, MAX_CHUNK_SIZE);
};
const { useToken } = theme;
const UploadArea: React.FC<UploadAreaProps> = React.memo(
  ({ fileVideo, setFileVideo, getAnimeData, isVisible }) => {
    const { token } = useToken();
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [blobList, setBlobList] = useState<Blob[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0); // 当前分片索引
    const [isPaused, setIsPaused] = useState(false); // 是否暂停上传
    const [isUploading, setIsUploading] = useState(false); // 是否运行上传
    const [frames, setFrames] = useState<string[]>();
    const [duration, setDuration] = useState<number>(fileVideo?.duration || 0);
    const durationRef = useRef<number | null>(null);
    durationRef.current = duration;
    // 删除相关状态
    // 在组件顶部添加状态
    const [hoverCardId, setHoverCardId] = useState<number | null>(null);
    const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
    // 在组件顶部 添加 下载状态
    const [downloading, setDownloading] = useState(false);

    // 下载视频处理函数
    const handleDownload = async (url: string, fileName: string) => {
      try {
        setDownloading(true);

        // 创建隐藏的a标签进行下载
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'video.mp4';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 如果直接下载有问题，可以使用fetch方式（处理鉴权等）
        /*
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(downloadUrl);
        */

        message.success('开始下载视频文件');
      } catch (error) {
        message.error('下载失败: ' + (error as Error).message);
      } finally {
        setDownloading(false);
      }
    };
    const confirmDownload = (url: string, fileName: string) => {
      Modal.confirm({
        title: '确认下载',
        content: (
          <div>
            <p>即将下载 {fileVideo?.tuozhan?.fileType} 文件</p>
            <p>文件大小: {formatFileSize(fileVideo?.tuozhan?.size || 0)}</p>
          </div>
        ),
        okText: '确认下载',
        cancelText: '取消',
        onOk: () => handleDownload(url, fileName),
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
      // 空值快速处理
      if (!file || !times || times.length === 0) return [];
      return new Promise((resolve) => {
        const videoElement = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 关键修改：强制类型转换为Blob并使用try-catch包裹
        let url: string;
        try {
          // 双重确保：先转换为Blob，再通过slice创建兼容实例
          const blob = file as Blob;
          const compatibleBlob = blob.slice(0, blob.size, blob.type);
          url = URL.createObjectURL(compatibleBlob);
        } catch (e) {
          // 即使出错也返回空数组，避免未处理的rejection
          return resolve([]);
        }

        videoElement.src = url;

        videoElement.addEventListener('loadedmetadata', () => {
          // 计算视频时长并开始处理
          const videoDuration = videoElement.duration; // 视频总时长
          setDuration(videoDuration);
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
              resolve([]); // 捕获内部错误，避免未处理rejection
            });
        });

        videoElement.addEventListener('error', () => {
          URL.revokeObjectURL(url);
          resolve([]); // 视频错误时返回空数组
        });
      });
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
          duration:
            chunkIndex + 1 === blobList.length ? Math.floor(durationRef.current || 0) : undefined, // 当前分片索引是最后一个时，设置时长
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
    const togglePause = () => {
      setIsPaused((prev) => !prev);
    };
    const handQie = async (videoId: number | undefined) => {
      if (!videoId || videoId === 0) {
        return;
      }
      const res = await get({ videoId });
      if (res.file) {
        const file = await getFileById({
          fileId: res.file,
        });
        setFileVideo({
          ...res,
          tuozhan: file,
        });
      } else setFileVideo(res);
    };
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
        console.log('processNextChunk:currentIndex:', i);
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
    const handleFileUpload = async (file: any) => {
      // if (!isUploading) {
      //   message.error('该集已经有视频无法上传了~');
      //   return Upload.LIST_IGNORE;
      // }
      if (file.size > oneMb * 1024 * 10) {
        message.error('视频大小不能超过10GB');
        return Upload.LIST_IGNORE;
      }
      if (fileList.length !== 0) {
        message.error('同时只能上传一个视频~');
        return Upload.LIST_IGNORE;
      }

      setFileList([...fileList, file]);
      const maxChunkSize = getMaxChunkSize(file.size);
      const chunks = splitFile(file, maxChunkSize);
      setBlobList(chunks);
      setCurrentIndex(0); // 重置索引
      setIsPaused(false); // 确保上传状态为非暂停
      setIsUploading(true);

      const times = [900]; // 要提取的时间点（秒）
      // 从每个分片中提取第一帧
      const firstFrameImage = await extractFramesFromVideo(file, times);
      setFrames(firstFrameImage);
      // processNextChunk(); // 开始上传
    };
    useEffect(() => {
      if (fileVideo?.fileData) {
        handleFileUpload(fileVideo?.fileData);
      }
    }, [fileVideo?.file]);
    useEffect(() => {
      if (!isPaused && isUploading) {
        processNextChunk();
      }
    }, [isPaused, isUploading]);
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
    // useEffect(() => {
    //   if (frames && frames.length > 0) {
    //     // 从 base64 数据中提取并转换为 JPEG 格式的 File 对象
    //     const base64Data = frames[0].split(',')[1];
    //     const jpegFile = base64ToFile(`data:image/jpeg;base64,${base64Data}`, 'frame.jpg');
    //     // 上传图像
    //     uploadImage(jpegFile);
    //   }
    // }, [frames]);
    return (
      <div
        style={{
          width: 600,
          height: 300,
          marginBottom: 30,
          padding: 20,
          flex: 1,
          display: isVisible ? 'block' : 'none',
        }}
      >
        {!fileVideo ? (
          <div></div>
        ) : !fileVideo.file ? (
          <Dragger
            beforeUpload={handleFileUpload} // 阻止自动上传
            fileList={fileList}
            style={{ width: '100%', height: '100%' }}
            onRemove={(file) => {
              setFileList((prevFileList) => prevFileList.filter((f) => f.uid !== file.uid));
              setBlobList([]);
              setIsPaused(true);
              setCurrentIndex(0);
              setUploadProgress(0);
              setIsUploading(false); // 停止上传
              console.log('remove file', file);
            }}
            itemRender={(originNode, file) => (
              <div
                style={{
                  display: 'flex',
                  marginTop: 8,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  border: '1px solid #ccc',
                  borderRadius: '10px',
                }}
              >
                <div style={{ flex: 1 }}>
                  {React.cloneElement(originNode, {
                    style: {
                      ...originNode.props.style,
                      border: 'none',
                      boxShadow: 'none',
                      margin: 0,
                      padding: 5,
                    },
                  })}
                </div>
                {isUploading ? (
                  <Button
                    type="text"
                    size="small"
                    icon={!isPaused ? <PauseOutlined /> : <PlayCircleOutlined />}
                    onClick={togglePause}
                    style={{ marginLeft: 0, marginRight: 5, color: '#848484' }}
                  />
                ) : (
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckOutlined />}
                    style={{ marginLeft: 0, marginRight: 5, color: 'green' }}
                  />
                )}
              </div>
            )}
            listType="picture"
            showUploadList={{
              extra: ({ size = 0 }) => (
                <span style={{ color: '#cccccc' }}>({(size / 1024 / 1024).toFixed(2)}MB)</span>
              ),
              showRemoveIcon: !isPaused ? false : isUploading,
              showPreviewIcon: true,
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域进行上传</p>
            <p className="ant-upload-hint">支持单个文件上传</p>
          </Dragger>
        ) : (
          // <Image
          //   src={fileVideo?.image}
          //   style={{
          //     display: 'block',
          //     width: 325,
          //     borderRadius: '8px',
          //   }}
          // />
          <Skeleton active loading={!fileVideo.file}>
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => setHoverCardId(fileVideo.id!)}
              onMouseLeave={() => setHoverCardId(null)}
            >
              <Card
                style={{ width: '33vw', minWidth: 300, maxWidth: 400 }}
                cover={
                  fileVideo?.image ? (
                    <div style={{ position: 'relative' }}>
                      <Image
                        src={fileVideo?.image}
                        alt="视频封面"
                        style={{ borderRadius: '8px' }}
                      />
                    </div>
                  ) : (
                    <FileOutlined style={{ fontSize: 40 }} />
                  )
                }
              >
                <Button
                  type="primary"
                  shape="circle"
                  icon={<DownloadOutlined />}
                  loading={downloading}
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    zIndex: 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (fileVideo?.tuozhan?.fullPath) {
                      const url = fileVideo.fileUrl;
                      const fileName = fileVideo.title || 'video';
                      if (!url) {
                        message.error('文件跑不见了~');
                        return;
                      }
                      if (fileVideo?.tuozhan?.size! > 1024 * 1024 * 100) {
                        // 超过100MB提示
                        confirmDownload(url, fileName);
                      } else {
                        handleDownload(url, fileName);
                      }
                    }
                  }}
                />
                {/* 删除按钮 */}
                {hoverCardId === fileVideo.id && (
                  <DeleteOutlined
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      fontSize: 20,
                      color: token.colorError,
                      cursor: 'pointer',
                      zIndex: 1,
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      padding: 8,
                      borderRadius: '50%',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmVisible(true);
                    }}
                  />
                )}
                <Card.Meta
                  title={fileVideo?.title}
                  description={
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Typography.Text>
                        <strong>时长:</strong>{' '}
                        {fileVideo?.duration
                          ? `${formatSeekTimeToCHEN(fileVideo?.duration)}`
                          : '未知'}
                      </Typography.Text>
                      <Typography.Text>
                        <strong>创建时间:</strong> {fileVideo?.crateTime}
                      </Typography.Text>
                      <Typography.Text>
                        <strong>文件状态:</strong>{' '}
                        {fileVideo?.file ? (
                          <Tag icon={<CheckCircleOutlined />} color="success">
                            已上传
                          </Tag>
                        ) : (
                          '未上传'
                        )}
                      </Typography.Text>
                      <Typography.Text>
                        <strong>文件大小:</strong> {formatFileSize(fileVideo?.tuozhan?.size || 0)}
                      </Typography.Text>
                      <Typography.Text>
                        <strong>文件路径:</strong>{' '}
                        {fileVideo?.tuozhan?.fullPath ? (
                          <Tag color={token.colorPrimaryHover}>{fileVideo?.tuozhan?.fullPath}</Tag>
                        ) : (
                          '未知'
                        )}
                      </Typography.Text>
                      <Typography.Text>
                        <strong>文件类型:</strong>{' '}
                        {fileVideo?.tuozhan?.fileType ? (
                          <Tag color={token.colorPrimaryHover}>{fileVideo?.tuozhan?.fileType}</Tag>
                        ) : (
                          '未知'
                        )}
                      </Typography.Text>
                    </Space>
                  }
                />
              </Card>
            </div>
          </Skeleton>
        )}

        {uploadProgress > 0 && (
          <Progress percent={uploadProgress} status="active" style={{ marginTop: 6 }} />
        )}
        {/* 添加确认弹窗 */}
        <Modal
          title="确认删除"
          open={deleteConfirmVisible}
          onOk={async () => {
            // 这里调用删除接口
            const res = await deleteVideo({
              videoId: fileVideo?.id!,
            });
            if (res) {
              message.success('删除成功!');
              await handQie(fileVideo?.id || 0);
              getAnimeData();
              setDeleteConfirmVisible(false);
            } else {
              message.error('删除失败!');
            }
          }}
          onCancel={() => setDeleteConfirmVisible(false)}
          okText="确认删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <p>确定要永久删除该视频文件吗？</p>
          <p style={{ color: token.colorTextSecondary }}>删除后将无法恢复！</p>
        </Modal>
        <ImageUploader uploadImage={uploadImage} frames={frames} />
      </div>
    );
  },
);

export default React.memo(UploadArea);
