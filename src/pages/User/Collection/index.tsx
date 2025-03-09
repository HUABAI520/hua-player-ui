import { calculateTimeDifference } from '@/common/utils/DateUtils';
import {
  collections,
  collectionsAdd,
  collectionsAnime,
  collectionsAnimeRemove,
  collectionsSort,
  collectionsUpdate,
} from '@/services/api/collectionController';
import {
  DeleteOutlined,
  DragOutlined,
  EditOutlined,
  MoreOutlined,
  StarFilled,
  SyncOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Dropdown,
  Flex,
  Input,
  Layout,
  List,
  Menu,
  message,
  Modal,
  Pagination,
  theme,
  Typography,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const { useToken } = theme;
const { Content } = Layout;
const { Search } = Input;
const { Meta } = Card;
const { Text } = Typography;

// 新增防抖钩子
const useDebouncedCallback = (callback: any, delay: number) => {
  const timeout = React.useRef<NodeJS.Timeout>();
  return React.useCallback(
    (...args: any) => {
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay],
  );
};
// 拖拽排序项组件
const DraggableItem: React.FC<{
  item: API.Collections;
  index: number;
  moveItem: (fromIndex: number, toIndex: number) => void;
  isDefault: boolean;
  onClick: () => void;
  onDragEnd: () => void; // 新增拖拽结束回调
  selected: boolean;
}> = ({ item, index, moveItem, isDefault, onClick, onDragEnd, selected }) => {
  const { token } = useToken();
  const [isHovering, setIsHovering] = useState(false);
  const [{ isDragging }, drag] = useDrag({
    type: 'COLLECTION_ITEM',
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
    accept: 'COLLECTION_ITEM',
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'pointer',
        padding: '8px 16px', // 增加水平padding
        margin: '4px 0',
        borderRadius: 8,
        border: selected ? '1px solid ' + token.colorPrimary : '1px solid transparent', // 选中状态边框
        transition: 'all 0.3s',
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={onClick}
    >
      <Flex align="center" gap={8}>
        {!isDefault && isHovering && (
          <DragOutlined style={{ color: token.colorPrimary, cursor: 'grab' }} />
        )}
        <Avatar src={item.image} shape="square" />
        <Text strong style={{ color: selected ? token.colorPrimaryText : token.colorText }}>
          {item.title}
        </Text>
        <StarFilled style={{ color: '#ffc107', marginLeft: 'auto' }} />
      </Flex>
    </div>
  );
};

// 新增收藏夹按钮
const AddCollectionButton = ({ onAdd }: { onAdd: () => void }) => {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState('');

  const handleAdd = async () => {
    if (!name.trim()) {
      message.warning('请输入收藏夹名称');
      return;
    }
    await collectionsAdd({ title: name });
    message.success('收藏夹创建成功');
    setVisible(false);
    setName('');
    onAdd();
  };

  return (
    <>
      <Button
        type="primary"
        style={{ width: '100%', marginBottom: 16 }}
        onClick={() => setVisible(true)}
      >
        新增收藏夹
      </Button>
      <Modal title="新建收藏夹" open={visible} onCancel={() => setVisible(false)} onOk={handleAdd}>
        <Input
          placeholder="请输入收藏夹名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Modal>
    </>
  );
};

// 编辑收藏夹弹窗
const EditCollectionModal = ({
  collection,
  onEdit,
}: {
  collection: API.Collections;
  onEdit: () => void;
}) => {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState(collection?.title);
  const handleEdit = async () => {
    if (!name?.trim()) {
      message.warning('请输入收藏夹名称');
      return;
    }
    await collectionsUpdate({ id: collection.id!, title: name });
    message.success('收藏夹更新成功');
    setVisible(false);
    onEdit();
  };

  return (
    <>
      <Button
        type="primary"
        shape="round"
        icon={<EditOutlined />}
        onClick={() => {
          setName(collection?.title);
          setVisible(true);
        }}
      >
        编辑收藏夹
      </Button>
      <Modal title="编辑收藏夹" open={visible} onCancel={() => setVisible(false)} onOk={handleEdit}>
        <Input
          placeholder="请输入收藏夹名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginBottom: 16 }}
        />
      </Modal>
    </>
  );
};

// 收藏详情页组件
const CollectionDetail: React.FC = () => {
  const { token } = useToken();
  const [collectionsData, setCollectionsData] = useState<API.Collections[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<API.Collections>();
  const [searchKey, setSearchKey] = useState('');
  const [debouncedSearchKey, setDebouncedSearchKey] = useState('');
  const [animeList, setAnimeList] = useState<API.CollectionInResp[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 40,
    total: 0,
  });
  const [isSorting, setIsSorting] = useState(false);
  const originalOrder = useRef<number[]>([]);

  // 防抖处理排序请求
  const debouncedSortRequest = useDebouncedCallback(async (newOrder: number[]) => {
    try {
      const res = await collectionsSort(newOrder);
      if (res) {
        message.success('排序成功');
      } else {
        message.error('排序失败');
      }
    } catch (error) {
      message.error('排序失败，正在恢复...');
      // 恢复原始顺序
      const originalItems = originalOrder.current.map(
        (id) => collectionsData.find((item) => item.id === id)!,
      );
      setCollectionsData(originalItems);
    } finally {
      setIsSorting(false);
    }
  }, 500);
  // 防抖逻辑
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchKey(searchKey);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchKey]);

  // 获取收藏夹列表
  const loadCollections = async () => {
    const res = await collections({ current: 1, pageSize: 100 });
    if (res?.records) {
      setCollectionsData(res.records);
      if (res.records.length > 0) {
        setSelectedCollection(res.records[0]);
      }
    }
  };

  // 获取收藏夹内容
  const loadCollectionContent = async (cid: number) => {
    const res = await collectionsAnime({
      cid,
      current: pagination.current,
      pageSize: pagination.pageSize,
      key: debouncedSearchKey,
    });
    setAnimeList(res?.records || []);
    setPagination((prev) => ({
      ...prev,
      total: res?.totalRow || 0,
    }));
  };

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection?.id) {
      loadCollectionContent(selectedCollection.id);
    }
  }, [selectedCollection, debouncedSearchKey, pagination.current]);

  // 处理拖拽排序
  const moveItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex === 0 || toIndex === 0) return;

    setCollectionsData((prev) => {
      const items = [...prev];
      const [movedItem] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, movedItem);
      return items;
    });
  };
  // 处理拖拽结束
  const handleDragEnd = () => {
    if (isSorting) return;

    setIsSorting(true);
    originalOrder.current = collectionsData.map((item) => item.id!);
    debouncedSortRequest(collectionsData.map((item) => item.id!));
  };

  // 移除动漫
  const handleRemoveAnime = async (aid: number) => {
    await collectionsAnimeRemove({
      aId: aid,
      cId: selectedCollection?.id!,
    });
    message.success('已移除');
    loadCollectionContent(selectedCollection?.id!);
  };

  return (
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
      <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
        <Content style={{ padding: '24px', maxWidth: '100vw' }}>
          <Flex gap={24} style={{ width: '100%' }}>
            {/* 左侧收藏夹列表 */}
            <div style={{ width: 280, background: 'transparent', padding: 16, borderRadius: 8 }}>
              <Text strong style={{ fontSize: 16, marginBottom: 16, display: 'block' }}>
                我的收藏夹
              </Text>
              <AddCollectionButton onAdd={loadCollections} />
              <List
                dataSource={collectionsData}
                renderItem={(item, index) => (
                  <DraggableItem
                    item={item}
                    index={index}
                    moveItem={moveItem}
                    isDefault={index === 0}
                    onClick={() => setSelectedCollection(item)}
                    onDragEnd={handleDragEnd}
                    // 添加selected属性
                    selected={item.id === selectedCollection?.id} // 根据当前选中状态判断
                  />
                )}
              />
            </div>

            {/* 右侧内容区域 */}
            <div
              style={{
                flex: 1,
                background: 'transparent',
                borderRadius: 8,
                padding: 24,
              }}
            >
              {/* 收藏夹信息 */}
              <Flex gap={24} style={{ marginBottom: 24 }}>
                <Avatar
                  src={selectedCollection?.image}
                  shape="square"
                  size={120}
                  style={{ borderRadius: 8 }}
                />
                <Flex vertical justify="space-between">
                  <div>
                    <Text strong style={{ fontSize: 24 }}>
                      {selectedCollection?.title}
                    </Text>
                    <div style={{ color: '#666', marginTop: 8 }}>
                      <Text>{selectedCollection?.count} 个内容</Text>
                    </div>
                  </div>
                  <Flex gap={8}>
                    <EditCollectionModal
                      collection={selectedCollection!}
                      onEdit={loadCollections}
                    />
                  </Flex>
                </Flex>
              </Flex>

              {/* 搜索栏 */}
              <div style={{ marginBottom: 24, textAlign: 'right' }}>
                <Search
                  placeholder="搜索收藏内容"
                  allowClear
                  onChange={(e) => setSearchKey(e.target.value)}
                  onSearch={(value) => setDebouncedSearchKey(value)}
                  style={{ width: 240 }}
                />
              </div>

              {/* 动漫列表 */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 24,
                  maxHeight: 'calc(100vh - 400px)',
                  overflowY: 'auto',
                }}
                className={'custom-scrollbar2'}
              >
                {animeList.map((anime) => (
                  <Card
                    key={anime.id}
                    hoverable
                    cover={<img alt={anime.name} src={anime.image} />}
                    onClick={() => window.open(`/player?animeId=${anime.id}`)}
                    style={{ position: 'relative' }}
                  >
                    <Meta
                      title={anime.name}
                      description={`收藏于 ${calculateTimeDifference(anime?.createTime)}`}
                    />

                    {/* 操作菜单 */}
                    <Dropdown
                      overlay={
                        <Menu>
                          <Menu.Item
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                              e.domEvent.stopPropagation();
                              handleRemoveAnime(anime.id!);
                            }}
                          >
                            移除收藏
                          </Menu.Item>
                        </Menu>
                      }
                      trigger={['click']}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          padding: 4,
                          borderRadius: 4,
                          // background: 'rgba(255,255,255,0.9)',
                          background: token.colorBgLayout,
                          cursor: 'pointer',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreOutlined
                          style={{
                            color: token.colorText,
                          }}
                        />
                      </div>
                    </Dropdown>
                  </Card>
                ))}
              </div>
              {/* 分页器 */}
              <Pagination
                showTotal={(total, range) => `${range[0]}-${range[1]} 共 ${total} 条`}
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={(page) => setPagination((prev) => ({ ...prev, current: page }))}
                style={{ marginTop: 24, textAlign: 'center' }}
              />
            </div>
          </Flex>
        </Content>
      </Layout>
    </DndProvider>
  );
};

export default CollectionDetail;
