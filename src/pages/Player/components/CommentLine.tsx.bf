import React, { useState } from 'react';
import { Dropdown, Flex, MenuProps, message, theme } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { LikeOutlined, MessageOutlined, MoreOutlined } from '@ant-design/icons';
import { like, unlike } from '@/services/api/likesController';

const { useToken } = theme;

interface CommentLineProps {
  item: API.CommentInfo;
  parentId: number;
  setReplayId: (value: React.SetStateAction<{ id: number; parentId: number } | undefined>) => void;
  setLiking: (liking: boolean) => void;
  handleLike: (item: API.CommentInfo) => void;
  liking: boolean;
  handleDelete: (id: number) => void;
}

import './HoverComponent.less';
import { calculateTimeDifference } from '@/common/utils/DateUtils';
import { useModel } from '@umijs/max'; // 导入CSS文件
export const CommentLine: React.FC<CommentLineProps> = React.memo(
  ({
    // 每一条评论
    item,
    // 最父级id
    parentId,
    setLiking,
    setReplayId,
    handleLike,
    liking,
    handleDelete,
  }) => {
    const { token } = useToken();

    const [showComponent, setShowComponent] = useState(false);
    // 鼠标移入时的处理函数
    const handleMouseEnter = () => {
      setShowComponent(true);
    };

    // 鼠标移出时的处理函数
    const handleMouseLeave = () => {
      setShowComponent(false);
    };
    const { initialState } = useModel('@@initialState');
    const { currentUser } = initialState || {};
    const { settings } = initialState || {};

    const items: MenuProps['items'] =
      currentUser?.id && item.user?.userId && currentUser?.id === item.user?.userId
        ? [
            {
              key: '1',
              label: <span style={{ color: 'var(--color-gray)' }}>删除评论</span>,
              onClick: () => {
                // setReplayId({ id: item.id!, parentId: parentId! });
                // 父组件传递删除评论id函数
                handleDelete(item.id!);
              },
            },
          ]
        : [
            {
              key: '1',
              label: <span style={{ color: 'var(--color-gray)' }}>举报评论</span>,
              onClick: () => {
                message.success('举报已提交~');
                // setReplayId({ id: item.id!, parentId: parentId! });
              },
            },
          ];

    return (
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <Flex style={{ margin: '6.6px 0' }}>
          <span style={{ color: token.colorPrimaryText, fontSize: '13px' }}>
            {item.user?.username}
          </span>
        </Flex>
        {/*{item.content}/{JSON.stringify(item)}*/}
        <Flex style={{ width: '100%' }}>
          <TextArea
            style={{
              padding: '0',
              backgroundColor: 'transparent',
              color: settings && settings.navTheme === 'light' ? 'black' : 'var(--text--white)',
              // fontSize: '15px',
              borderRadius: '0',
            }}
            variant="borderless"
            disabled
            value={item.content}
            autoSize={{ minRows: 1 }}
          />
        </Flex>
        <Flex
          style={{ margin: '3px  0', fontSize: '13px', color: 'var(--color-gray)' }}
          gap={'middle'}
          className={'like-active'}
        >
          <span style={{ color: 'var(--color-gray)' }}>
            {calculateTimeDifference(item.createTime)}
          </span>
          <span>
            <LikeOutlined
              style={{
                color: Number(item.isLike) === 1 ? token.colorPrimaryText : 'var(--color-gray)',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (liking || !item.id) {
                  return;
                }
                setLiking(true);
                if (Number(item.isLike) === 1) {
                  unlike({ thirdId: item.id, type: 1 })
                    .then((r) => {
                      if (r) {
                        handleLike(item);
                      }
                    })
                    .finally(() => {
                      setTimeout(() => {
                        setLiking(false);
                      }, 500);
                    });
                } else {
                  like({ thirdId: item.id, type: 1 })
                    .then((r) => {
                      if (r) {
                        handleLike(item);
                      }
                    })
                    .finally(() => {
                      setTimeout(() => {
                        setLiking(false);
                      }, 500);
                    });
                }
              }}
            />
            <span
              style={{
                fontSize: '13px',
                color: 'var(--color-gray)',
                margin: '0 6px 0 6px',
              }}
            >
              {item.likeCount}
            </span>
          </span>
          <span>
            <MessageOutlined
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (!item) {
                  return;
                }
                setReplayId((prev) => {
                  if (prev && prev.id === item.id) {
                    return undefined;
                  } else
                    return {
                      id: item.id!,
                      parentId: parentId!,
                    };
                });
              }}
            />
          </span>
          {showComponent && (
            <Dropdown menu={{ items }} trigger={['click']} placement={'topLeft'}>
              <MoreOutlined style={{ cursor: 'pointer' }} />
            </Dropdown>
          )}
        </Flex>
      </div>
    );
  },
);
