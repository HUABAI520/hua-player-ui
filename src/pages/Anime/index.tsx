import { getYearAndSeasonByDate } from '@/common/utils/DateUtils';
import {
  getHotRecommendation,
  getRealTimeRecommendation,
  getRecommendation,
} from '@/services/api/recommendationController'; // 引入CSS文件
import {
  ClockCircleOutlined,
  EyeOutlined,
  LoadingOutlined,
  SmileOutlined,
  StarFilled,
  TagsOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { history } from '@umijs/max';
import { Card, Col, Row, Spin, theme, Typography } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import './AnimeHomePage.less';

import _ from 'lodash';
const { Title } = Typography;
// 模拟数据
const topCards = [
  { title: '番剧索引', icon: <UnorderedListOutlined />, content: '全站番剧快速检索' },
  { title: '类型风格', icon: <TagsOutlined />, content: '20+ 分类标签' },
  {
    title: '首播时间',
    icon: <ClockCircleOutlined />,
    content: getYearAndSeasonByDate(new Date()) + '新番',
  },
];
const { useToken } = theme;
// 热播榜组件优化版
const HotRankingList = () => {
  const { token } = useToken();
  const [hotList, setHotList] = useState<API.AnimeIndexResp[]>();
  useEffect(() => {
    getHotRecommendation({
      pageNum: 1,
      pageSize: 50,
    }).then((res) => {
      // 重新排序 按照playCount 从高到低排序
      res.records?.sort((a, b) => Number(b.playCount || 0) - Number(a.playCount || 0));
      setHotList(res.records);
    });
  }, []);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [leftVisible, setLeftVisible] = useState(false);
  const [rightVisible, setRightVisible] = useState(true);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setLeftVisible(scrollLeft > 0);
    // setRightVisible(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 300 + 16; // 卡片宽度 + 间隔
    const newPos =
      scrollRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);

    scrollRef.current.scrollTo({
      left: newPos,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener('scroll', checkScroll);
    checkScroll();
    return () => container.removeEventListener('scroll', checkScroll);
  }, [checkScroll]);

  return (
    <div className="hot-ranking-container">
      <div ref={scrollRef} className="hot-ranking-scroll">
        {hotList?.map((item, index) => (
          <div
            style={{ cursor: 'pointer' }}
            key={item.id}
            className="hot-ranking-card"
            onClick={() => {
              window.open('/player?animeId=' + item.id);
            }}
          >
            <div className="card-image-area">
              {/* 修改图片展示部分 */}
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="card-image"
                  onError={(e) => {
                    // 可选的图片加载失败处理
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="rating-badge">
                <svg viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <span>{item.score}</span>
              </div>
            </div>

            <div className="card-info-area">
              <div className="rank-number" style={{ backgroundColor: token.colorPrimary }}>
                {index + 1}
              </div>
              <div className="text-info">
                <h4 className="anime-title">{item.name}</h4>
                <p className="anime-desc">{item.intro}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ScrollButton direction="left" visible={leftVisible} onClick={() => handleScroll('left')} />
      <ScrollButton
        direction="right"
        visible={rightVisible}
        onClick={() => handleScroll('right')}
      />
    </div>
  );
};

const ScrollButton = ({
  direction,
  visible,
  onClick,
}: {
  direction: 'left' | 'right';
  visible: boolean;
  onClick: () => void;
}) => (
  <div className={`scroll-button ${direction} ${visible ? 'visible' : ''}`}>
    <button onClick={onClick}>
      <svg viewBox="0 0 24 24">
        <path d="M9.29 6.71c-.39.39-.39 1.02 0 1.41L13.17 12l-3.88 3.88c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l4.59-4.59c.39-.39.39-1.02 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01z" />
      </svg>
    </button>
  </div>
);
// 每日推荐组件
const DailyRecommendation = () => {
  const [data, setData] = useState<API.AnimeIndexResp[]>([]);

  useEffect(() => {
    getRecommendation({ pageSize: 10 }) // 获取10条数据（2行展示）
      .then((res) => setData(res));
  }, []);

  return (
    <div className="daily-recommend-container">
      {data.map((item) => (
        <Card
          key={item.id}
          hoverable
          className="daily-card"
          onClick={() => {
            window.open('/player?animeId=' + item.id);
          }}
          cover={
            <div className="card-cover">
              <img
                alt={item.name}
                src={item.image}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="card-meta">
                <span className="score">
                  <StarFilled style={{ color: '#ffd666', marginRight: 4 }} />
                  {item.score || '无评分'}
                </span>
                {item.playCount && (
                  <span className="play-count">
                    <EyeOutlined style={{ marginRight: 4 }} />
                    {formatCount(item.playCount)}
                  </span>
                )}
              </div>
            </div>
          }
        >
          <div className="card-body">
            <Typography.Text ellipsis>{item.name}</Typography.Text>
            <Typography.Paragraph
              type="secondary"
              ellipsis={{ rows: 2 }}
              style={{ fontSize: 12, marginBottom: 0 }}
            >
              {item.intro}
            </Typography.Paragraph>
          </div>
        </Card>
      ))}
    </div>
  );
};

// 格式化播放量
const formatCount = (num: number) => {
  if (num >= 1e8) return `${(num / 1e8).toFixed(1)}亿`;
  if (num >= 1e4) return `${Math.round(num / 1e4)}万`;
  return num;
};
const GuessYouLike = () => {
  const [data, setData] = useState<API.AnimeIndexResp[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState({ pageNum: 1, pageSize: 10 }); // 修复参数名
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false); // 使用 ref 避免闭包问题
  const [isFirst, setIsFirst] = useState(true);
  // 使用 ref 跟踪最新状态 todo 新方法获取最新状态
  const stateRef = useRef({
    hasMore,
    loading,
    isFirst,
  });

  useEffect(() => {
    stateRef.current = { hasMore, loading, isFirst };
  }, [hasMore, loading, isFirst]);

  // 优化后的滚动处理
  const handleScroll = useCallback(
    _.throttle(() => {
      const { hasMore, loading } = stateRef.current;
      if (loading || !hasMore) return;

      // 精确计算滚动位置
      const scrollBottom = window.innerHeight + window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const threshold = 100; // 调整触发阈值为 100px

      if (scrollBottom >= documentHeight - threshold) {
        // setQuery((prev) => ({ ...prev, pageNum: prev.pageNum + 1 }));
        loadData();
      }
    }, 500), // 增加节流时间到 500ms
    [],
  );

  const loadData = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const result = await getRealTimeRecommendation();

      // 判断是否还有更多数据
      const noMoreData = !result?.length || result.length < query.pageSize;
      const { isFirst } = stateRef.current;
      setHasMore(isFirst ? true : !noMoreData);
      setIsFirst(false);
      // 数据去重处理
      setData((prev) => {
        const newItems =
          result?.filter((item) => !prev.some((existing) => existing.id === item.id)) || [];
        return [...prev, ...newItems];
      });
    } catch (error) {
      console.error('推荐加载失败:', error);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   loadData();
  // }, [query]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="recommendation-container">
      {/* 卡片渲染部分保持不变 */}
      {data.map((item) => (
        <Card
          key={item.id}
          hoverable
          onClick={() => {
            window.open('/player?animeId=' + item.id);
          }}
          className="daily-card"
          cover={
            <div className="card-cover">
              <img
                alt={item.name}
                src={item.image}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="card-meta">
                <span className="score">
                  <StarFilled style={{ color: '#ffd666', marginRight: 4 }} />
                  {item.score || '无评分'}
                </span>
                {item.playCount && (
                  <span className="play-count">
                    <EyeOutlined style={{ marginRight: 4 }} />
                    {formatCount(item.playCount)}
                  </span>
                )}
              </div>
            </div>
          }
        >
          <div className="card-body">
            <Typography.Text ellipsis>{item.name}</Typography.Text>
            <Typography.Paragraph
              type="secondary"
              ellipsis={{ rows: 2 }}
              style={{ fontSize: 12, marginBottom: 0 }}
            >
              {item.intro}
            </Typography.Paragraph>
          </div>
        </Card>
      ))}

      {loading && (
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px 0' }}>
          <Spin indicator={<LoadingOutlined spin style={{ fontSize: 24 }} />} />
        </div>
      )}

      {/* 无更多数据提示 */}
      {!hasMore && data.length > 0 && (
        <div
          style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '24px 0',
            color: '#999',
            borderTop: '1px dashed #eee',
          }}
        >
          <SmileOutlined style={{ marginRight: 8 }} />
          已经到底啦~
        </div>
      )}
    </div>
  );
};
const AnimeHomePage = () => {
  return (
    <div style={{ padding: '20px' }}>
      {/* 顶部三卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {topCards.map((card, index) => (
          <Col span={8} key={index}>
            <Card
              hoverable
              style={{
                borderRadius: 12,
                background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
              }}
              onClick={() => {
                history.push('/dongman');
              }}
            >
              <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                <div style={{ fontSize: 24 }}>{card.icon}</div>
                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    {card.title}
                  </Title>
                  <p style={{ color: '#666' }}>{card.content}</p>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 热播榜轮播 */}
      <SectionTitle title="热播榜" />
      <HotRankingList />

      {/* 每日推荐 */}
      <SectionTitle title="每日推荐" />
      {/*<AnimeGrid data={dailyRecommendations} />*/}
      <DailyRecommendation />

      {/* 猜你喜欢 */}
      <SectionTitle title="猜你喜欢" />
      <GuessYouLike />
    </div>
  );
};

// 分块标题组件
const SectionTitle = ({ title }: { title: string }) => (
  <Title level={3} style={{ margin: '24px 0 16px', color: '#444' }}>
    {title}
  </Title>
);

// 热播榜轮播项
const HotRankingSlide = ({ startIndex }: { startIndex: number }) => (
  <div style={{ background: '#fff', padding: 16 }}>
    <Row gutter={[16, 16]}>
      {Array.from({ length: 10 }).map((_, i) => (
        <Col span={12} key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 24,
                textAlign: 'center',
                color: i < 3 ? '#ff4d4f' : '#666',
              }}
            >
              {startIndex + i + 1}
            </span>
            <span style={{ flex: 1 }}>番剧标题 {startIndex + i + 1}</span>
            <span style={{ color: '#888' }}>🔥 1.2亿</span>
          </div>
        </Col>
      ))}
    </Row>
  </div>
);

// 番剧网格组件
const AnimeGrid = ({ data }: { data: any[] }) => (
  <Row gutter={[16, 16]}>
    {data.map((item, i) => (
      <Col xs={24} sm={12} md={8} lg={6} xl={4} key={i}>
        <Card
          hoverable
          cover={
            <img
              alt={item.title}
              src={`//picsum.photos/300/200?r=${i}`} // 使用随机图片
              style={{ height: 200, objectFit: 'cover' }}
            />
          }
          bodyStyle={{ padding: 12 }}
        >
          <Title level={5} ellipsis={{ rows: 1 }} style={{ margin: 0 }}>
            {item.title}
          </Title>
          <div style={{ color: '#666', marginTop: 8 }}>
            <div>⭐ {item.rating}</div>
            <div>🎯 {item.tags.join(' / ')}</div>
          </div>
        </Card>
      </Col>
    ))}
  </Row>
);

export default AnimeHomePage;
