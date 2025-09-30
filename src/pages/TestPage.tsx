import { DetailEditIcon, LanguageIcon } from '@/common/DefinedIcon';
import InfoDisplay from '@/common/display/InfoDisplay';
import { AnimeAdOrUp } from '@/common/Edit/AnimeAdOrUp';
import { VideoEdit } from '@/common/Edit/VideoEdit';
import { pictureFallback } from '@/common/error';
import { fetch } from '@/common/utils/DelayUtil';
import Test2 from '@/pages/Guanli/Test2';
import UploadArea from '@/pages/Manage/components/UploadArea';
import { useDebouncedCallback } from '@/pages/User/Collection';
import { AvatarView } from '@/pages/User/Settings/components/base';
import {
  addVideo,
  deleteVideoMsg,
  get,
  getAnimeById,
  list,
  updateVideoSort,
} from '@/services/api/animeController';
import { getFileById } from '@/services/api/fileController';
import { useLocation, useNavigate } from '@@/exports';
import {
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  LoadingOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useModel } from '@umijs/max';
import {
  Button,
  Card,
  Dropdown,
  Flex,
  FloatButton,
  Form,
  Image,
  Input,
  InputNumber,
  MenuProps,
  message,
  Modal,
  Rate,
  Select,
  SelectProps,
  Space,
  Spin,
  Tag,
  theme,
  Typography,
  Upload,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import Sider from 'antd/es/layout/Sider';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const { Dragger } = Upload;
const MAX_CHUNK_SIZE = 6 * 1024 * 1024; // 6MB
const MIN_CHUNK_SIZE = 6 * 1024 * 1024; // 6MB

const TestPage: React.FC = () => {
  const { token } = theme.useToken();
  const { initialState } = useModel('@@initialState');
  const settings = initialState?.settings || {};
  const [open, setOpen] = useState(false);
  const [imgOpen, setImgOpen] = useState(false);
  const [videoEditOpen, setVideoEditOpen] = useState(false);
  const navigate = useNavigate();
  const [fileVideo, setFileVideo] = useState<API.AnimeVideosResp>();
  const [fileVideos, setFileVideos] = useState<API.AnimeVideosResp[]>();
  const [isVideoShow, setIsVideoShow] = useState(false);
  const [isVideoFanShow, setIsVideoFanShow] = useState(false);
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
  const [type, setType] = useState<1 | 2>(1);
  const [episode, setEpisode] = useState<number | undefined>(undefined);
  const [isSorting, setIsSorting] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<any>();
  const [selectedVideoIds, setSelectedVideoIds] = useState<number[]>([]);
  // 新增模式状态：选择模式、修改模式、删除模式
  const [mode, setMode] = useState<'select' | 'edit' | 'delete'>('select');
  const modeMap: Record<'select' | 'edit' | 'delete', string> = {
    select: '选择模式',
    edit: '编辑模式',
    delete: '删除模式',
  };
  const modeName = modeMap[mode]; //
  const originalOrder = useRef<number[] | undefined>([]);
  const videosRef = useRef<API.AnimeVideosResp[]>();

  // 模式切换处理
  const handleModeChange = (newMode: 'select' | 'edit' | 'delete') => {
    setMode(newMode);
    setSelectedVideoIds([]); // 切换模式时清空选择
  };

  // 批量删除处理
  const handleBatchDelete = () => {
    if (selectedVideoIds.length === 0) {
      return message.warning('请先选择要删除的剧集');
    }

    Modal.confirm({
      title: '确认批量删除',
      okText: '确认',
      cancelText: '取消',
      content: (
        <Space direction="vertical" style={{ width: '100%' }}>
          即将删除 {selectedVideoIds.length} 个剧集，删除后无法恢复哦~
        </Space>
      ),
      onOk: async () => {
        try {
          for (const id of selectedVideoIds) {
            await deleteVideoMsg({ videoId: id });
          }

          message.success('批量删除成功');
          setAnimeMsg((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              videos: prev.videos?.filter((item) => !selectedVideoIds.includes(item.id!)),
            };
          });

          setSelectedVideoIds([]);
          setMode('select'); // 回到选择模式
        } catch (error) {
          message.error('删除失败，请重试');
        }
      },
    });
  };

  // 选择状态切换
  const toggleVideoSelection = (videoId: number, e?: React.MouseEvent) => {
    // 在删除模式下才处理选择状态
    if (mode === 'delete') {
      e?.stopPropagation();
      setSelectedVideoIds((prev) =>
        prev.includes(videoId) ? prev.filter((id) => id !== videoId) : [...prev, videoId],
      );
    }
  };

  useEffect(() => {
    videosRef.current = animeMsg?.videos;
  }, [animeMsg?.videos]);

  const getAnimeData = async () => {
    if (animeId === 0) return;

    const res = await getAnimeById({ id: animeId });
    if (res) {
      const currentUrl = new URL(window.location.href, window.location.origin);
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
    }
  }, [animeId]);

  const updateFileVideos = (res: API.AnimeVideosResp) => {
    const index = fileVideos?.findIndex((item) => item.id === res.id);
    if (index !== undefined && index >= 0) {
      setFileVideos((prevState) => prevState?.map((item, i) => (i === index ? res : item)));
    } else {
      setFileVideos((prevArray) => {
        const p = prevArray || [];
        return p.concat(res);
      });
    }
  };

  const handQie = async (videoId: number | undefined) => {
    if (!videoId || videoId === 0) return;

    const res = await get({ videoId });
    if (res?.file) {
      const file = await getFileById({ fileId: res.file });
      setFileVideo({ ...res, tuozhan: file });
      updateFileVideos({ ...res, tuozhan: file });
    } else {
      setFileVideo(res);
      updateFileVideos(res);
    }
  };

  const tiaojian = (video: API.AnimeVideosResp) => {
    return fileVideo?.id && Number(video.id) === Number(fileVideo?.id);
  };

  const [form] = Form.useForm();
  const [formFan] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(videoForm);
  }, [videoForm]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      let p = true;

      animeMsg?.videos?.forEach((video) => {
        if (video.rank === values.rank) p = false;
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
    } catch (errorInfo) {
      console.error('Validation Failed:', errorInfo);
    }
  };

  const addFan = async (start: number, end: number) => {
    for (let i = start; i <= end; i++) {
      setEpisode(i);
      const values: API.AnimeVideosReq = {
        animeId: animeId!,
        title: `第${i}集`,
        rank: i,
      };
      await addVideo(values);
    }
    message.success('全部添加成功~');
  };

  const handleOkFan = async () => {
    const values = await formFan.validateFields();
    const start = Number(values.rankStart);
    const end = Number(values.rankEnd);

    try {
      await addFan(start, end);
      setIsVideoFanShow(false);
    } finally {
      await getAnimeData();
      formFan.setFieldValue(
        'rankStart',
        Number(animeMsg?.videos?.[animeMsg?.videos.length - 1].rank || 0) + 1,
      );
      formFan.setFieldValue(
        'rankEnd',
        Number(animeMsg?.videos?.[animeMsg?.videos.length - 1].rank || 0) + 1,
      );
      setEpisode(undefined);
    }
  };

  const handleSearch = (newValue: string) => {
    setFetching(true);
    fetch(newValue, setData, list);
    setFetching(false);
  };

  const handleChange = (newValue: string) => {
    setAnimeId(Number(newValue));
  };

  // 视频卡片组件，根据不同模式展示不同效果
  const VideoCard = (video: API.AnimeVideosResp) => {
    const isSelected = mode === 'delete' && selectedVideoIds.includes(video.id!);
    const isActive = fileVideo?.id === video.id;

    const handleCardClick = () => {
      if (mode === 'edit') {
        // 编辑模式：打开编辑弹窗
        setSelectedVideoId(video.id!);
        setVideoEditOpen(true);
      } else if (mode === 'delete') {
        // 删除模式：切换选择状态
        toggleVideoSelection(video.id!);
      } else {
        // 选择模式：查看详情
        if (video.id !== fileVideo?.id) {
          handQie(video.id || 0);
        }
      }
    };

    return (
      <Card
        hoverable
        styles={{
          body: {
            padding: '5px',
            overflow: 'hidden',
            transition: 'all 0.2s ease-in-out',
            width: '100%',
          },
        }}
        style={{
          backgroundColor: isActive ? token.colorPrimaryBg : isSelected ? '#fff4f4' : '',
          border: isActive
            ? `2px solid ${token.colorPrimary}`
            : isSelected
            ? `2px solid ${token.colorError}`
            : '0px',
          marginBottom: '6px',
          transition: 'all 0.2s ease-in-out',
        }}
        key={video.id}
        onClick={handleCardClick}
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
            第 {video?.rank} 集
          </Typography.Text>

          <Flex align="start" justify="space-between" style={{ width: '100%' }}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              {video?.title}
            </Typography.Title>

            <Typography.Title level={5} style={{ margin: 0 }}>
              {video?.file ? (
                <span style={{ color: token.colorPrimaryText }}>有视频文件</span>
              ) : (
                <span style={{ color: 'red' }}>无视频文件</span>
              )}
            </Typography.Title>
          </Flex>

          {/* 模式指示器 */}
          {mode === 'delete' && isSelected && (
            <div style={{ position: 'absolute', top: 5, right: 5 }}>
              <DeleteOutlined style={{ color: token.colorError }} />
            </div>
          )}
          {mode === 'edit' && (
            <div style={{ position: 'absolute', top: 5, right: 5 }}>
              <EditOutlined style={{ color: token.colorPrimary }} />
            </div>
          )}
        </Flex>
      </Card>
    );
  };

  const DraggableVideoCard = ({
    video,
    index,
    moveCard,
    onDragEnd,
  }: {
    video: API.AnimeVideosResp;
    index: number;
    moveCard: (dragIndex: number, hoverIndex: number) => void;
    onDragEnd: () => void;
  }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [{ isDragging }, drag] = useDrag({
      type: 'VIDEO_CARD',
      item: { index },
      end: (_, monitor) => {
        if (monitor.didDrop()) {
          onDragEnd();
        }
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [, drop] = useDrop({
      accept: 'VIDEO_CARD',
      hover(item: { index: number }, monitor) {
        if (!ref.current) return;
        const dragIndex = item.index;
        const hoverIndex = index;

        if (dragIndex === hoverIndex) return;

        const hoverBoundingRect = ref.current?.getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset()!;
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

        moveCard(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    });

    drag(drop(ref));

    return (
      <div
        ref={ref}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setSelectedVideoId(video.id);
        }}
        style={{
          width: '100%',
          opacity: isDragging ? 0.5 : 1,
          cursor: mode === 'select' ? 'move' : 'pointer',
          transform: isDragging ? 'scale(1.02)' : 'none',
          boxShadow: isDragging ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
          transition: 'all 0.3s ease',
          marginBottom: 6,
        }}
      >
        <Dropdown
          menu={{ items }}
          trigger={['contextMenu']}
          disabled={mode !== 'select'} // 只有选择模式启用右键菜单
        >
          {VideoCard(video)}
        </Dropdown>
      </div>
    );
  };

  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    setAnimeMsg((prev) => {
      if (!prev) return prev;
      const newVideos = [...prev.videos!];
      const [removed] = newVideos.splice(dragIndex, 1);
      newVideos.splice(hoverIndex, 0, removed);
      return { ...prev, videos: newVideos };
    });
  }, []);

  const handleResetSort = () => {
    message.error('排序失败，正在恢复...');
    const originalItems = originalOrder?.current?.map(
      (id) => animeMsg?.videos?.find((item) => item.id === id)!,
    );
    setAnimeMsg((prev) => {
      if (!prev) return prev;
      return { ...prev, videos: originalItems };
    });
  };

  const debouncedSortRequest = useDebouncedCallback(async () => {
    try {
      const currentVideos = videosRef.current || [];
      const newOrder = currentVideos.map((item) => item.id!);

      if (JSON.stringify(newOrder) === JSON.stringify(originalOrder.current)) return;

      const res = await updateVideoSort({ animeId: animeMsg?.id! }, newOrder);

      setAnimeMsg((prev) => {
        if (!prev) return prev;
        const videos = [...prev.videos!];
        videos.forEach((item, index) => {
          item.rank = newOrder.indexOf(item.id!) + 1;
        });
        return { ...prev, videos };
      });

      if (res) {
        message.success('排序成功');
      } else {
        handleResetSort();
      }
    } catch (error) {
      handleResetSort();
    } finally {
      setIsSorting(false);
    }
  }, 500);

  const handleSortConfirm = async () => {
    if (isSorting) return;
    setIsSorting(true);
    originalOrder.current = animeMsg?.videos?.map((item) => item.id!);
    debouncedSortRequest();
  };

  const addCard = () => {
    return (
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
          setTimeout(() => {
            setVideoForm({
              animeId: animeId,
              rank: animeMsg?.videos?.length! + 1,
              title: '第' + (animeMsg?.videos?.length! + 1) + '集',
            });
            setIsVideoShow(true);
          }, 50);
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
          <Flex align="end" justify="center" style={{ width: '100%' }}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              <PlusOutlined size={50} />
            </Typography.Title>
          </Flex>
        </Flex>
      </Card>
    );
  };

  const items: MenuProps['items'] =
    selectedVideoId === -1
      ? [
          {
            label: '范围新增集',
            key: '2',
            onClick: () => setIsVideoFanShow(true),
            icon: <DetailEditIcon />,
          },
        ]
      : [
          {
            label: '删除该集',
            key: '1',
            onClick: () => {
              const fileVideo = animeMsg?.videos?.find((item) => item.id === selectedVideoId);
              Modal.confirm({
                title: '确认删除该集？',
                okText: '确认',
                cancelText: '取消',
                content: (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    删除后无法恢复哦~
                    <Typography.Text>
                      <strong>视频标题:</strong> {fileVideo?.title}
                    </Typography.Text>
                    <Typography.Text>
                      <strong>视频集数:</strong> {fileVideo?.rank}
                    </Typography.Text>
                  </Space>
                ),
                onOk: async () => {
                  const res = await deleteVideoMsg({ videoId: selectedVideoId });
                  if (res) {
                    message.success('删除成功');
                    setAnimeMsg((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        videos: prev.videos?.filter((item) => item.id !== selectedVideoId),
                      };
                    });
                  }
                },
              });
            },
            icon: <DeleteOutlined />,
          },
          {
            label: '修改信息',
            key: '2',
            onClick: () => setVideoEditOpen(true),
            icon: <DetailEditIcon />,
          },
        ];

  // 模式切换工具栏组件
  const ModeToolbar = () => (
    <Card
      style={{ marginBottom: 16, background: token.colorBgContainer }}
      bodyStyle={{ padding: '8px 16px' }}
    >
      <Flex justify="space-between" align="center">
        <Typography.Title level={5} style={{ margin: 0 }}>
          剧集管理
        </Typography.Title>
        <Space>
          <Button
            type={mode === 'select' ? 'primary' : 'default'}
            onClick={() => handleModeChange('select')}
            icon={<PlayCircleOutlined />}
          >
            选择模式
          </Button>
          <Button
            type={mode === 'edit' ? 'primary' : 'default'}
            onClick={() => handleModeChange('edit')}
            icon={<EditOutlined />}
          >
            修改模式
          </Button>
          <Button
            type={mode === 'delete' ? 'primary' : 'default'}
            danger={mode === 'delete'}
            onClick={() => handleModeChange('delete')}
            icon={<DeleteOutlined />}
          >
            删除模式
            {mode === 'delete' && selectedVideoIds.length > 0 && (
              <span
                style={{
                  marginLeft: 8,
                  background: '#fff',
                  color: '#f5222d',
                  padding: '0 6px',
                  borderRadius: 12,
                }}
              >
                {selectedVideoIds.length}
              </span>
            )}
          </Button>
          {mode === 'delete' && selectedVideoIds.length > 0 && (
            <Button danger onClick={handleBatchDelete} icon={<DeleteOutlined />}>
              批量删除
            </Button>
          )}
        </Space>
      </Flex>
    </Card>
  );

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        {isSorting && (
          <div
            style={{
              position: 'fixed',
              top: 16,
              right: 16,
              padding: '8px 16px',
              background: token.colorBgLayout,
              borderRadius: 4,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              color: token.colorText,
              zIndex: 1000,
            }}
          >
            <SyncOutlined spin /> 正在保存排序...
          </div>
        )}

        <Flex vertical={false} style={{ minWidth: '976px' }} className={'shang-anime'}>
          <Sider
            width="50%"
            className="custom-scrollbar2"
            style={{
              textAlign: 'center',
              color: '#fff',
              backgroundColor: 'transparent',
              marginRight: '10px',
              flex: 1,
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <Card styles={{ body: { padding: 0, overflow: 'hidden' } }}>
              <Flex
                vertical
                justify={'start'}
                align={'start'}
                style={{
                  height: type === 1 ? '100%' : '0',
                  transform: `translateX(${type === 1 ? 0 : -100}%)`,
                  opacity: type === 1 ? 1 : 0,
                  transition: 'all 0.8s ease-in-out',
                }}
              >
                <Flex gap={'12px'} style={{ width: '100%' }}>
                  <Flex onClick={() => setImgOpen(true)}>
                    <Image
                      alt={animeMsg?.name}
                      preview={false}
                      src={animeMsg?.image}
                      fallback={pictureFallback}
                      style={{
                        cursor: 'pointer',
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
                            icon={<CloseCircleOutlined />}
                            onClick={() => setSelect(false)}
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
                          onClick={() => navigate('/player/?animeId=' + animeMsg?.id)}
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
                          style={{ borderRadius: '20px', padding: '20px' }}
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
                    color: token.colorPrimaryText,
                  }}
                >
                  简介
                </Button>
                <TextArea
                  value={animeMsg?.intro}
                  style={{
                    padding: '0px 12px 6px ',
                    marginBottom: '16px',
                    color:
                      settings && settings.navTheme === 'light' ? 'black' : 'var(--text--white)',
                  }}
                  autoSize
                  disabled
                  variant="borderless"
                />
              </Flex>

              <Flex
                vertical
                justify={'start'}
                align={'start'}
                style={{
                  height: type === 1 ? '0' : '100%',
                  transform: `translateX(${type === 1 ? 100 : 0}%)`,
                  opacity: type === 1 ? 0 : 1,
                  transition: 'all 0.8s ease-in-out',
                }}
              >
                <Test2 />
              </Flex>
            </Card>
          </Sider>

          <Spin indicator={<LoadingOutlined spin />} spinning={isSorting} tip={'正在保存排序~'}>
            <Sider
              style={{
                textAlign: 'center',
                color: '#fff',
                backgroundColor: token.colorBgLayout,
                flex: 1,
                maxHeight: '85vh',
                overflowY: 'auto',
                padding: '16px',
              }}
              className="custom-scrollbar"
            >
              {/* 新增模式切换工具栏 */}
              <ModeToolbar />

              {animeMsg?.videos?.map((video, index) => (
                <DraggableVideoCard
                  key={video.id}
                  video={video}
                  index={index}
                  moveCard={moveCard}
                  onDragEnd={handleSortConfirm}
                />
              ))}

              <div onContextMenu={() => setSelectedVideoId(-1)}>
                <Dropdown menu={{ items }} trigger={['contextMenu']}>
                  {addCard()}
                </Dropdown>
              </div>
            </Sider>
          </Spin>

          {fileVideos?.map((item) => (
            <UploadArea
              key={item.id}
              fileVideo={item}
              setFileVideo={(value) => updateFileVideos(value)}
              isVisible={fileVideo?.id === item.id}
              getAnimeData={getAnimeData}
            />
          ))}
        </Flex>
      </DndProvider>

      <Modal
        title={'范围添加集数'}
        open={isVideoFanShow}
        onOk={handleOkFan}
        width={300}
        onCancel={() => {
          if (episode) {
            message.error('正在添加，请勿关闭');
            return;
          }
          setIsVideoFanShow(false);
        }}
        okText="提交"
      >
        {episode && (
          <span style={{ fontSize: '16px' }}>
            正在添加第 <i style={{ color: 'red', fontWeight: 'bold' }}>{episode}集</i>，请勿关闭
          </span>
        )}
        <Form
          form={formFan}
          layout="vertical"
          initialValues={{
            rankStart: Number(animeMsg?.videos?.[animeMsg?.videos.length - 1]?.rank || 0) + 1,
            rankEnd: Number(animeMsg?.videos?.[animeMsg?.videos.length - 1]?.rank || 0) + 1,
          }}
        >
          <Flex>
            <Form.Item
              style={{ width: '100%' }}
              label="开始"
              name="rankStart"
              rules={[
                { required: true, message: 'Rank is required' },
                {
                  validator: (_, value) => {
                    if (
                      value <
                      Number(animeMsg?.videos?.[animeMsg?.videos.length - 1]?.rank || 0) + 1
                    ) {
                      return Promise.reject(
                        'Rank must be greater than ' +
                          Number((animeMsg?.videos?.[animeMsg?.videos.length - 1]?.rank || 0) + 1),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber size={'large'} />
            </Form.Item>
            <Form.Item
              label="结束"
              name="rankEnd"
              rules={[
                { required: true, message: 'Rank is required' },
                {
                  validator: (_, value) => {
                    if (value < formFan.getFieldValue('rankStart')) {
                      return Promise.reject('End must be greater than Start');
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber size={'large'} />
            </Form.Item>
          </Flex>
        </Form>
      </Modal>

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
            hidden
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
                setVideoForm({ ...videoForm, rank: value });
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

      <Modal
        title={'修改该集信息'}
        width={600}
        onCancel={() => setVideoEditOpen(false)}
        cancelText={'完成'}
        open={videoEditOpen}
        style={{ padding: '16px' }}
        footer={null}
        destroyOnClose
      >
        <Form>
          <VideoEdit
            video={animeMsg?.videos?.find((item) => item.id === selectedVideoId)}
            reload={getAnimeData}
            onCancel={() => setVideoEditOpen(false)}
          />
        </Form>
      </Modal>

      <FloatButton
        shape="circle"
        style={{ insetInlineEnd: 108 }}
        icon={<QuestionCircleOutlined style={{ color: token.colorPrimary }} />}
        tooltip={
          <div style={{ maxWidth: 200 }}>
            <p>选择模式：点击卡片查看详情</p>
            <p>修改模式：点击卡片修改信息</p>
            <p>删除模式：选择多个卡片批量删除</p>
          </div>
        }
      />
    </>
  );
};

export default TestPage;
