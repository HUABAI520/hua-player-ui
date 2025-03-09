import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Button, Flex, InputRef, message, Spin, theme, Timeline, Typography } from 'antd';
import { addComment, deleteComment, queryComment } from '@/services/api/commentController';
import { useModel } from '@umijs/max';
import { formatDate } from '@/common/utils/DateUtils';
import TextArea from 'antd/es/input/TextArea';
import _ from 'lodash';
// import { CommentLine } from '@/pages/Player/components/CommentLine';
const CommentLine = React.lazy(() =>
  import('@/pages/Player/components/CommentLine').then((module) => ({
    default: module.CommentLine,
  })),
);

const { useToken } = theme;

interface CommentProps {
  videoId: number;
  animeId: number;
}

export const Comment: React.FC<CommentProps> = React.memo(({ videoId, animeId }) => {
  const inputRef = useRef<InputRef>(null);
  const [inputValue, setInputValue] = useState('');
  const [replayValue, setReplayValue] = useState('');
  // 被回复的评论id 和 他的最高父级评论id
  const [replayId, setReplayId] = useState<
    | {
        id: number;
        parentId: number;
      }
    | undefined
  >(undefined);
  const [commentList, setCommentList] = React.useState<API.CommentInfo[] | undefined>([]);
  const [total, setTotal] = React.useState<number>(0);
  const totalPage = React.useRef<number>();
  const [loading, setLoading] = React.useState(false);
  const [params, setParams] = React.useState<API.queryCommentParams>({
    videoId: 0,
    pageNumber: 1,
    pageSize: 10,
    // sortField: 'create_time',
    sortField: 'count',
    sortOrder: 'DESC',
  });
  const getChildParams = React.useRef<API.queryCommentParams>({
    videoId: videoId,
    pageNumber: 1,
    pageSize: 10,
    sortField: 'create_time',
    sortOrder: 'ASC',
  });
  const [liking, setLiking] = useState(false); //限制用户频繁点赞
  const [isFocused, setIsFocused] = useState(false);
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  // 在组件顶部新增状态
  const [sentimentVisible, setSentimentVisible] = useState(false);
  const [sentimentData, setSentimentData] = useState<{
    score: number;
    percent: number;
    color: string;
    message: string;
  } | null>(null);
  const getChild = (params: API.queryCommentParams) => {
    if (!params.oid || loading) return;
    setLoading(true);
    queryComment(params)
      .then((r) => {
        // 找到父级评论的回复列表
        const parentComment = commentList?.find((comment) => comment.id === params.oid);
        if (parentComment) {
          parentComment.children
            ? (parentComment.children = [...parentComment.children, ...(r.records || [])])
            : (parentComment.children = r.records);
          setCommentList(commentList);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const getAdd = async (params: API.queryCommentParams) => {
    const r = await queryComment(params);
    const newComment = [...(commentList || []), ...(r.records || [])];
    setCommentList(newComment);
  };
  const getNew = async (params: API.queryCommentParams) => {
    const r = await queryComment(params);
    setCommentList(r.records || []);
    setTotal(r.totalRow || 0);
    totalPage.current = r.totalPage;
  };
  // 修改数据获取逻辑
  useEffect(() => {
    if (videoId === 0) {
      return;
    }

    const newParams = {
      ...params,
      pageNumber: 1,
      videoId: videoId,
    };
    getNew(newParams).then((r) => {
      setParams(newParams);
    });
  }, [videoId]);
  const handleButton = useCallback(
    (type: 'count' | 'create_time') => {
      if (type === params.sortField || loading) return;
      const newParams = { ...params, sortField: type, pageNumber: 1 };
      setLoading(true);
      getNew(newParams)
        .then(() => setParams(newParams))
        .finally(() => setLoading(false));
    },
    [params, loading, getNew],
  );

  const handleScroll = useCallback(
    _.throttle(() => {
      if (loading || (totalPage.current && totalPage.current <= (params?.pageNumber || 1))) return;

      // 检测是否滚动到底部
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 5) {
        // setQuery((prevQuery) => ({
        //   ...prevQuery,
        //   current: (prevQuery.current || 1) + 1,
        // }));
        const newParams = { ...params, pageNumber: (params.pageNumber || 1) + 1 };
        setLoading(true);
        getAdd(newParams)
          .then(() => setParams(newParams))
          .finally(() => setLoading(false));
      }
    }, 300),
    [loading, totalPage, params],
  );
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const handleFocus = () => {
    setIsFocused(true);
  };
  const getSentimentFeedback = (score: number) => {
    const levels = [
      {
        range: [0, 0.3999999],
        icon: '🔴',
        message: () => `检测到强烈情绪表达，建议调整措辞`,
        color: '#ff6b6b', // 柔和红色
      },
      {
        range: [0.4, 0.5999999],
        icon: '🟡',
        message: (s: any) => `情绪状态平稳`,
      },
      {
        range: [0.6, 0.7999999],
        icon: '🟢',
        message: () => `检测到积极情绪`,
        color: '#4cd137', // 柔和绿色
      },
      {
        range: [0.8, 1],
        icon: '🌈',
        message: (s: any) => `超强积极情绪，您的乐观感染了系统🤖`,
      },
    ];
    return levels.find((l) => score >= l.range[0] && score <= l.range[1]);
  };
  // 新增动画定义
  const feedbackStyle = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }

  .feedback-card {
    position: fixed;
    bottom: 50px;
    right: 20px;
    width: 300px;
    padding: 16px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    transition: all 0.3s;
  }

  .feedback-enter {
    animation: slideIn 0.5s ease-out forwards;
  }

  .feedback-exit {
    animation: slideOut 0.5s ease-out forwards;
  }

  .progress-bar {
    height: 4px;
    background: #eee;
    margin-top: 12px;
    border-radius: 2px;
    position: relative;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
`;
  const SentimentFeedback = () => {
    const [isVisible, setIsVisible] = useState(true);
    const progressRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
      // 添加全局样式
      const styleTag = document.createElement('style');
      styleTag.innerHTML = feedbackStyle;
      document.head.appendChild(styleTag);

      // 启动自动关闭计时器
      timerRef.current = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => {
        clearTimeout(timerRef.current);
        document.head.removeChild(styleTag);
      };
    }, []);

    const handleClose = () => {
      setIsVisible(false);
      setTimeout(() => setSentimentVisible(false), 500);
    };

    if (!sentimentVisible || !sentimentData) return null;

    return (
      <div
        className={`feedback-card ${isVisible ? 'feedback-enter' : 'feedback-exit'}`}
        onMouseEnter={() => clearTimeout(timerRef.current)}
        onMouseLeave={() => {
          timerRef.current = setTimeout(handleClose, 2000);
        }}
      >
        <Flex align="center" gap={12}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: `conic-gradient(
            ${sentimentData.color} ${sentimentData.percent}%,
            #eee ${sentimentData.percent}% 100%
          )`,
              position: 'relative',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 18,
              }}
            >
              {sentimentData.percent}%
            </span>
          </div>
          <Typography.Text strong>{sentimentData.message}</Typography.Text>
        </Flex>

        <div className="progress-bar">
          <div
            ref={progressRef}
            className="progress-fill"
            style={{
              width: `${sentimentData.percent}%`,
              backgroundColor: sentimentData.color,
            }}
          />
        </div>

        <Button
          type="text"
          size="small"
          style={{ position: 'absolute', top: 8, right: 8 }}
          onClick={handleClose}
        >
          ×
        </Button>
      </div>
    );
  };
  const handleBlur = (e: any) => {
    // 防止按钮点击时触发的失焦
    if (!e.relatedTarget || e.relatedTarget.tagName !== 'BUTTON') {
      setIsFocused(false);
    }
  };

  const pinlun = async (
    pid:
      | {
          id: number;
          parentId: number;
        }
      | undefined = undefined,
    content: string = inputValue,
  ) => {
    const res = await addComment({
      animeId: animeId,
      content: content,
      videoId: videoId,
      parentId: pid?.id,
      originId: pid?.parentId,
    });
    if (res === null) return false;
    const feedback = getSentimentFeedback(res.sentimentScore);
    const percent = Math.round(res.sentimentScore * 100);
    // 设置情感数据
    setSentimentData({
      score: res.sentimentScore,
      percent,
      color: getColorByScore(res.sentimentScore),
      message: feedback?.message(res.sentimentScore) || '',
    });
    setSentimentVisible(true);

    // 5秒后自动隐藏
    setTimeout(() => setSentimentVisible(false), 5000);
    return res.id;
  };
  // 样式补充
  const globalStyles = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;

  // 颜色映射函数
  const getColorByScore = (score: number) => {
    if (score < 0.4) return '#ff4d4f'; // 红色
    if (score < 0.6) return '#faad14'; // 橙色
    if (score < 0.8) return '#73d13d'; // 绿色
    return '#13c2c2'; // 青蓝
  };

  // 根据id查找评论
  const findCommentById = (
    id: number,
    list: API.CommentInfo[] | undefined,
  ): API.CommentInfo | undefined => {
    if (!list) return undefined;
    for (const comment of list || []) {
      if (comment.id === id) {
        return comment;
      }
      // 如果有children，递归查找
      if (comment.children) {
        const foundInChildren = findCommentById(id, comment.children);
        if (foundInChildren) {
          return foundInChildren;
        }
      }
    }
    return undefined;
  };
  const deleteCommentById = (id: number) => {
    setCommentList((prevComments) => {
      // 使用filter方法来创建一个新的列表，其中不包含id匹配的元素
      return prevComments?.filter((comment) => {
        // 如果当前元素的id匹配，或者它有子元素并且子元素中包含匹配的id，则返回false
        if (comment.id === id) {
          return false;
        }
        // 如果当前元素有子元素，递归地过滤子元素
        if (comment.children) {
          let count = 0;
          comment.children = comment.children.filter((child) => {
            if (child.id !== id && child.parentId !== id) {
              return true;
            } else {
              count++;
              return false;
            }
          });
          if (comment.replyCount) comment.replyCount -= count;
        }
        return true;
      });
    });
  };
  const handleLike = useCallback(
    (item: API.CommentInfo) => {
      const comment = findCommentById(item.id!, commentList);
      if (comment) {
        if (Number(comment.isLike) === 1) {
          comment.isLike = 0;
          comment.likeCount = comment.likeCount ? comment.likeCount - 1 : 0;
        } else {
          comment.isLike = 1;
          comment.likeCount = comment.likeCount ? comment.likeCount + 1 : 1;
        }
        setCommentList([...(commentList || [])]); // 使用新的数组触发更新
      }
    },
    [commentList],
  );
  // const handleLike = (item: API.CommentInfo) => {
  //   // commentList 遍历全部找到对应的id  包括子评论
  //   const comment = findCommentById(item.id!, commentList);
  //   if (comment) {
  //     if (Number(comment.isLike) === 1) {
  //       comment.isLike = 0;
  //       comment.likeCount = comment.likeCount ? comment.likeCount - 1 : 0;
  //     } else {
  //       comment.isLike = 1;
  //       comment.likeCount = comment.likeCount ? comment.likeCount + 1 : 1;
  //     }
  //     setCommentList(commentList);
  //   }
  //   // setCommentList((prev) => {
  //   //   return prev?.map((comment) => {
  //   //     if (comment.id === item.id) {
  //   //       if (Number(comment.isLike) === 1) {
  //   //         comment.isLike = 0;
  //   //         comment.likeCount = comment.likeCount ? comment.likeCount - 1 : 0;
  //   //       } else {
  //   //         comment.isLike = 1;
  //   //         comment.likeCount = comment.likeCount ? comment.likeCount + 1 : 1;
  //   //       }
  //   //     }
  //   //     return comment;
  //   //   });
  //   // });
  // };
  const handleDelete = (id: number, isFather = true) => {
    // id 是评论的id
    deleteComment({ cid: id }).then((r) => {
      if (r) {
        message.success('评论删除成功~');
        deleteCommentById(id);
        if (isFather) setTotal(total - 1);
        return;
      }
    });
  };
  const replayComment = (item: API.CommentInfo) => (
    <>
      <Flex style={{ margin: '20px 0 0 0' }} gap={'16px'}>
        <Avatar size={40} src={currentUser?.userAvatar}></Avatar>
        <Flex flex={1}>
          <TextArea
            placeholder={'回复 @' + item.user?.username + ' ：'}
            variant="filled"
            autoSize={{ minRows: 2, maxRows: 4 }}
            onChange={(e) => {
              setReplayValue(e.target.value);
            }}
            value={replayValue}
            maxLength={200}
          />
        </Flex>
      </Flex>
      <Flex justify={'end'} style={{ marginTop: '12px' }}>
        <Button
          type={'primary'}
          size={'large'}
          onClick={() => {
            if (replayValue === '' || !replayId) {
              message.error('回复内容不能为空');
              return;
            }
            // 回复
            pinlun(replayId, replayValue).then((r) => {
              if (!r) return;
              if (Number(r) <= 0) return;
              // 在最上面添加评论
              // 创建新评论对象
              const newComment = {
                id: r,
                user: {
                  userAvatar: currentUser?.userAvatar,
                  username: currentUser?.username,
                  userId: currentUser?.id,
                },
                createTime: formatDate(new Date()),
                parentId: replayId.id,
                originId: replayId.parentId,
                likeCount: 0,
                replyCount: 0,
                content: replayValue,
              };
              // todo 设置到对应的评论回复列表中
              const parentComment = commentList?.find(
                (comment) => comment.id === replayId.parentId,
              );
              if (parentComment) {
                parentComment.replyCount = Number(parentComment.replyCount) + Number(1);
                parentComment.children
                  ? parentComment.children?.unshift(newComment)
                  : (parentComment.children = [newComment]);
                setCommentList(commentList);
              }
              // setTotal((prevTotal) => Number(prevTotal) + Number(1)); // 使用函数形式确保正确的类型
              setReplayValue('');
              setReplayId(undefined);
            });
          }}
        >
          回复
        </Button>
      </Flex>
    </>
  );
  // 获取当前主题的 token
  const { token } = useToken();
  return (
    <>
      <Flex vertical>
        {/*<Flex>评论</Flex>*/}
        <Flex align={'center'} style={{ marginTop: '12px', marginBottom: '22px' }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            评论
          </Typography.Title>
          <span style={{ fontSize: '13px', color: 'var(--color-gray)', margin: '0 30px 0 6px' }}>
            {total}
          </span>
          <Button
            size={'small'}
            type={'text'}
            style={{
              padding: '3px 5px',
              color: params.sortField === 'create_time' ? 'var(--color-gray)' : token.colorText,
            }}
            onClick={() => handleButton('count')}
          >
            最热
          </Button>
          <div style={{ margin: '0 3px', color: 'var(--color-gray)' }}>|</div>
          <Button
            size={'small'}
            type={'text'}
            style={{
              padding: '3px 5px',
              color: params.sortField !== 'create_time' ? 'var(--color-gray)' : token.colorText,
            }}
            onClick={() => handleButton('create_time')}
          >
            最新
          </Button>
        </Flex>
        <Flex>
          <Avatar size={48} src={currentUser?.userAvatar} style={{ margin: '0 16px' }}></Avatar>
          <Flex flex={1}>
            <TextArea
              ref={inputRef}
              placeholder={'来一发评论吧~'}
              variant="filled"
              autoSize={{ minRows: 2, maxRows: 4 }}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
              value={inputValue}
              onFocus={handleFocus}
              onBlur={handleBlur}
              maxLength={200}
            />
          </Flex>
        </Flex>
        <Flex justify={'end'} style={{ marginTop: '12px' }}>
          {isFocused && (
            <Button
              type={'primary'}
              size={'large'}
              onClick={() => {
                if (inputValue === '') {
                  message.error('评论内容不能为空');
                  inputRef.current?.focus();
                  return;
                }
                pinlun().then((r) => {
                  if (!r) return;
                  if (Number(r) <= 0) return;
                  // 在最上面添加评论
                  // 创建新评论对象
                  const newComment = {
                    id: r,
                    user: {
                      userAvatar: currentUser?.userAvatar,
                      username: currentUser?.username,
                      userId: currentUser?.id,
                    },
                    createTime: formatDate(new Date()),
                    parentId: undefined,
                    likeCount: 0,
                    replyCount: 0,
                    content: inputValue,
                  };

                  // 使用展开操作符来复制旧列表，并添加新元素
                  const updatedCommentList = [newComment, ...(commentList || [])];
                  // 更新状态
                  setCommentList(updatedCommentList);
                  setTotal((prevTotal) => Number(prevTotal) + Number(1)); // 使用函数形式确保正确的类型
                  setInputValue('');
                });
              }}
            >
              评论
            </Button>
          )}
        </Flex>
      </Flex>
      <Flex vertical>
        {commentList?.map((item) => {
          return (
            <Flex key={item.id} style={{ marginTop: '22px' }}>
              <Avatar
                size={40}
                src={item.user?.userAvatar}
                style={{ margin: '0 16px 0 24px' }}
              ></Avatar>
              <Flex flex={1} style={{ width: '100%', padding: '0 0 2px 0' }} align={'start'}>
                <Flex vertical style={{ width: '100%' }}>
                  <CommentLine
                    item={item}
                    liking={liking}
                    parentId={item.id!}
                    setLiking={setLiking}
                    setReplayId={setReplayId}
                    handleLike={handleLike}
                    handleDelete={handleDelete}
                  />
                  <>
                    {item.children?.length && (
                      <Flex vertical>
                        {item.children?.map((child) => {
                          if (child.originId !== child.parentId && !child.content?.includes('@')) {
                            const huifang = item.children?.find((c) => c.id === child.parentId);
                            if (huifang)
                              child.content =
                                '回复 @' + huifang.user?.username + ' ' + child.content;
                          }
                          return (
                            <Flex key={child.id}>
                              <Avatar
                                size={24}
                                src={child.user?.userAvatar}
                                style={{ margin: '0 8px 0 0' }}
                              ></Avatar>
                              <Flex
                                flex={1}
                                style={{ width: '100%', padding: '0 0 2px 0' }}
                                align={'start'}
                              >
                                <Flex vertical style={{ width: '100%' }}>
                                  <CommentLine
                                    item={child}
                                    liking={liking}
                                    parentId={child.originId!}
                                    setLiking={setLiking}
                                    setReplayId={setReplayId}
                                    handleLike={handleLike}
                                    handleDelete={handleDelete}
                                    isFather={false}
                                  />
                                </Flex>
                              </Flex>
                            </Flex>
                          );
                        })}
                      </Flex>
                    )}
                  </>
                  {item.replyCount && Number(item.replyCount) > 0 ? (
                    <Flex
                      className="like-active"
                      style={{ color: 'var(--color-gray)', fontSize: '13px' }}
                    >
                      {Number(item.children?.length || 0) === 0 && (
                        <>
                          共{item.replyCount}
                          条回复，
                        </>
                      )}
                      <div
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          // 查看孩子是否满了
                          const childrenLength = Number(item.children?.length) || 0;
                          if (childrenLength >= Number(item.replyCount)) return;
                          // 获取该查询第几页 向上取整
                          getChildParams.current.pageNumber = Math.ceil(
                            (Number(childrenLength) + 1) / Number(getChildParams.current.pageSize),
                          );
                          getChildParams.current.videoId = videoId;
                          getChildParams.current.oid = item.id;
                          getChild(getChildParams.current);
                        }}
                      >
                        {Number(item.children?.length || 0) === 0
                          ? '点击查看'
                          : Number(item.children?.length || 0) < Number(item.replyCount)
                          ? '继续展开'
                          : ''}
                      </div>
                      {Number(item.children?.length || 0) > 0 && (
                        <div
                          style={{ cursor: 'pointer', marginLeft: '8px' }}
                          onClick={() => {
                            // const comment = commentList?.find((c) => c.id === item.id);
                            const newCommentList = commentList?.map((c) => {
                              // 如果找到匹配的评论
                              if (c.id === item.id) {
                                // 创建一个新的comment对象，其中children属性被设置为undefined
                                return { ...c, children: undefined };
                              }
                              return c;
                            });
                            if (newCommentList) setCommentList(newCommentList);
                          }}
                        >
                          收起
                        </div>
                      )}
                    </Flex>
                  ) : (
                    ''
                  )}
                  {/*replayId.id 是被回复评论的id  replayId.parentId是被回复评论的最父级id*/}
                  {replayId &&
                    replayId.parentId === item.id &&
                    replayComment(
                      item.id === replayId.id
                        ? item
                        : item.children?.find((child) => child.id === replayId.id) || item,
                    )}
                  <div
                    style={{
                      width: '100%',
                      padding: '0 0 14px',
                      borderBottom: '1px solid #e3e5e7',
                    }}
                  />
                </Flex>
              </Flex>
            </Flex>
          );
        })}
        {(Number(params.pageNumber) === Number(totalPage.current) || Number(total) === 0) && (
          <Flex justify={'center'} style={{ marginTop: '20px' }}>
            <span style={{ color: 'var(--color-gray)' }}>没有更多评论了...</span>
          </Flex>
        )}
        {loading && <Spin style={{ display: 'block', marginTop: '16px', textAlign: 'center' }} />}
      </Flex>
      <SentimentFeedback />
    </>
  );
});
