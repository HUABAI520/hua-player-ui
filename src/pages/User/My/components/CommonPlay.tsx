import { formatSeekTimeToCHEN2 } from '@/common/utils/timeUtil';
import { ClockCircleOutlined, FrownOutlined, MehOutlined, SmileOutlined } from '@ant-design/icons';
import { Card, Col, Divider, Flex, Row, Statistic, Tag, theme } from 'antd';
import ReactECharts from 'echarts-for-react';
import React from 'react';
import CountUp from 'react-countup';
import { TransitionGroup } from 'react-transition-group';

export type CommonFeature = {
  activeDays?: number;
  avgDailyActivities?: number;
  totalWatchDuration?: number;
  commentCount?: number;
  commentsPerHour?: number;
  collectionCount?: number;
  likeCount?: number;
  effectivePlayCount?: number;
  topType?: string;
  top_10_types?: string[];
  activePeriod?: string;
  avgSentiment?: number;
  sentimentLabel?: '积极' | '中性' | '消极';
  current?: { date: string; activities: number }[];
};

interface CommonPlayProps {
  generateData: CommonFeature | undefined;
  title: string;
  allDay: number;
  type: 'week' | 'month' | 'all' | 'day';
  // 传递一个reactNode
  selectTime?: React.ReactNode;
}

export const selable = [
  {
    label: '积极',
    color: '#52c41a',
    icon: <SmileOutlined />,
  },
  {
    label: '中性',
    color: '#1890ff',
    icon: <MehOutlined />,
  },
  {
    label: '消极',
    color: '#f5222d',
    icon: <FrownOutlined />,
  },
];
const { useToken } = theme;
export const CommonPlay: React.FC<CommonPlayProps> = ({
  generateData,
  title,
  type,
  allDay,
  selectTime,
}) => {
  const { token } = useToken();
  const TypeTags = ({ types }: { types: string[] | undefined }) => (
    <TransitionGroup component="div" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {types?.map((type, i) => (
        <Tag
          key={type}
          color={i < 3 ? ['#108ee9', '#87d068', '#f50'][i] : '#d9d9d9'}
          style={{
            borderRadius: 20,
            marginBottom: 4,
            fontSize: 14,
            padding: '4px 12px',
          }}
        >
          {i + 1}. {type}
        </Tag>
      ))}
    </TransitionGroup>
  );
  const renderOverviewMetrics = () => (
    <Row gutter={16}>
      {[
        { title: '总活跃天数', value: generateData?.activeDays, suffix: '天 / ' + allDay + ' 天' },
        {
          title: '总观看时长',
          value: formatSeekTimeToCHEN2(generateData?.totalWatchDuration)?.value || 0,
          suffix: formatSeekTimeToCHEN2(generateData?.totalWatchDuration)?.unit,
        },
        { title: '每日平均活动数', value: generateData?.avgDailyActivities?.toFixed(1) },
        {
          title: '总体情感',
          value: generateData?.sentimentLabel,
          icon: selable.find((s) => s.label === generateData?.sentimentLabel)?.icon,
          color: selable.find((s) => s.label === generateData?.sentimentLabel)?.color,
        },
      ].map((item, i) => (
        <Col span={6} key={i}>
          <Card bordered={false} style={{ minHeight: 120 }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Statistic
                title={item.title}
                valueRender={() => {
                  return !item.icon ? (
                    <CountUp
                      end={Number(item.value || 0)}
                      duration={1.5}
                      decimals={item.suffix === '小时' ? 1 : 0}
                      separator=","
                      useEasing
                      delay={0.1}
                    >
                      {({ countUpRef }) => <span ref={countUpRef} />}
                    </CountUp>
                  ) : (
                    item.value
                  );
                }}
                suffix={item.suffix}
                style={{ marginRight: '10px', flexGrow: 1 }}
              />

              {item.icon && <div style={{ fontSize: 40, color: item.color }}>{item.icon}</div>}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
  const behaviorChart = () => ({
    tooltip: {
      trigger: 'axis',
      formatter: (params: any[]) => {
        return params
          .map((param) => {
            const value = generateData?.totalWatchDuration;
            const unit =
              param.seriesName === '观看时长' ? formatSeekTimeToCHEN2(value)?.unit : '次';
            return `${param.name}: ${param.value}${unit}`;
          })
          .join('<br/>');
      },
    },
    xAxis: {
      type: 'category',
      data: ['观看时长', '评论', '收藏', '点赞', '有效播放'],
      axisLabel: {
        interval: 0,
        rotate: 0,
        formatter: (value: string) => {
          return value.length > 4 ? `${value.substring(0, 2)}\n${value.substring(2)}` : value;
        },
      },
    },
    yAxis: [
      {
        type: 'value',
        name: formatSeekTimeToCHEN2(generateData?.totalWatchDuration)?.unit,
        position: 'left',
        axisLabel: {
          formatter: '{value} ' + formatSeekTimeToCHEN2(generateData?.totalWatchDuration)?.unit,
        },
        splitLine: {
          show: false,
        },
      },
      {
        type: 'value',
        name: '次数',
        position: 'right',
        axisLabel: {
          formatter: '{value} 次',
        },
      },
    ],
    grid: {
      top: 30,
      bottom: 25,
      containLabel: true,
    },
    series: [
      {
        name: '观看时长',
        animationDelay: (idx: number) => idx * 150,
        data: [formatSeekTimeToCHEN2(generateData?.totalWatchDuration)?.value],
        // 转换为小时
        type: 'bar',
        barWidth: 28,
        yAxisIndex: 0, // 使用左侧小时单位轴
        itemStyle: {
          color: '#1890ff',
          borderRadius: [4, 4, 0, 0],
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c} ' + formatSeekTimeToCHEN2(generateData?.totalWatchDuration)?.unit,
        },
      },
      {
        name: '互动数据',
        animationDelay: (idx: number) => idx * 150,
        data: [
          '', // 观看时长位置留空
          generateData?.commentCount,
          generateData?.collectionCount,
          generateData?.likeCount,
          generateData?.effectivePlayCount,
        ],
        type: 'bar',
        barWidth: 28,
        yAxisIndex: 1, // 使用右侧次数单位轴
        itemStyle: {
          color: '#13c2c2',
          borderRadius: [4, 4, 0, 0],
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c} 次',
        },
      },
    ],
  });
  const ScoreChart = ({ score, style }: { score: number; style?: React.CSSProperties }) => {
    // 计算颜色和评级
    const getRatingInfo = () => {
      const roundedScore = Number(score.toFixed(1));
      if (roundedScore < 30)
        return {
          color: '#ff4d4f',
          label: '消极',
          description: '负面情绪占主导',
        };
      if (roundedScore <= 60)
        return {
          color: '#faad14',
          label: '中性',
          description: '情绪较为平稳',
        };
      return {
        color: '#52c41a',
        label: '积极',
        description: '正面情绪占主导',
      };
    };

    const ratingInfo = getRatingInfo();
    const progressColor = ratingInfo.color;

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: `情感评分: ${score.toFixed(1)}%<br/>评级: ${ratingInfo.label}<br/>${
          ratingInfo.description
        }`,
      },
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '35%',
          style: {
            text: '情感得分',
            fill: '#666',
            fontSize: 14,
            fontWeight: 'normal',
          },
        },
      ],
      animationDuration: 2000,
      animationEasing: 'cubicInOut',
      series: [
        {
          animationType: 'scale',
          animationDelay: 500,
          type: 'pie',
          radius: ['65%', '90%'],
          avoidLabelOverlap: false,
          hoverAnimation: true,
          silent: true,
          label: {
            show: true,
            position: 'center',
            formatter: [`{a|${score.toFixed(1)}%}`, `{b|${ratingInfo.label}}`].join('\n'),
            rich: {
              a: {
                fontSize: 28,
                fontWeight: 'bold',
                color: progressColor,
                lineHeight: 36,
              },
              b: {
                fontSize: 16,
                color: '#666',
                padding: [5, 0, 0, 0],
              },
            },
          },
          emphasis: {
            scale: false,
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
            },
          },
          data: [
            {
              value: score,
              name: '情感得分',
              itemStyle: {
                color: progressColor,
                shadowColor: progressColor,
                shadowBlur: 10,
              },
            },
            {
              value: 100 - score,
              name: '剩余',
              itemStyle: {
                color: '#f0f0f0',
              },
            },
          ],
        },
      ],
    };

    return (
      <div style={{ position: 'relative', ...style }}>
        <ReactECharts
          option={option}
          style={{
            height: style?.height || 300,
            width: '100%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 0,
            right: 0,
            textAlign: 'center',
            color: '#666',
            fontSize: 12,
          }}
        >
          {ratingInfo.description}
        </div>
      </div>
    );
  };
  return (
    <>
      <Card
        title={title + '的数据~'}
        style={{ marginBottom: 24 }}
        bodyStyle={{ padding: 16 }}
        extra={selectTime}
      >
        {renderOverviewMetrics()}
        {/* 新增类型偏好卡片 */}
        <Row gutter={24} style={{ marginTop: 16 }}>
          <Flex style={{ width: '100%', height: '100%' }} align={'center'}>
            <Col span={16}>
              <Card
                title="内容类型偏好"
                bordered={false}
                headStyle={{ fontSize: 16, border: 'none' }}
                bodyStyle={{ padding: '16px 24px' }}
              >
                <Statistic
                  title={title + '最喜欢类型'}
                  value={generateData?.topType || '无'}
                  valueStyle={{
                    fontSize: 20,
                    color: token.colorPrimary,
                    marginBottom: 12,
                  }}
                />
                {generateData?.top_10_types && (
                  <>
                    <Divider style={{ margin: '12px 0' }} />
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ color: token.colorTextSecondary, marginBottom: 8 }}>
                        {title}偏好类型TOP10
                      </div>
                      <TypeTags types={generateData?.top_10_types} />
                    </div>
                  </>
                )}
              </Card>
            </Col>

            <Col span={8}>
              <Card
                bordered={false}
                headStyle={{ display: 'none' }}
                bodyStyle={{
                  padding: 0,
                  height: '100%', // 确保高度充满
                  display: 'flex', // 启用flex布局
                  alignItems: 'center', // 垂直居中
                  justifyContent: 'center', // 水平居中
                  backgroundColor: token.colorPrimaryBg,
                  borderRadius: token.borderRadiusLG,
                }}
              >
                <div
                  style={{
                    padding: 24,
                    width: '100%', // 确保内容区域宽度充满
                    textAlign: 'center',
                    // 添加最小高度保证视觉效果
                    minHeight: 180,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center', // 内容垂直居中
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      color: token.colorPrimaryTextHover,
                      marginBottom: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <ClockCircleOutlined style={{ fontSize: 16 }} />
                    主要活跃时段
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: token.colorPrimary,
                      lineHeight: 1.4,
                      margin: '8px 0',
                      wordBreak: 'break-word', // 防止长文本溢出
                    }}
                  >
                    {generateData?.activePeriod || '--'}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: token.colorTextDescription,
                    }}
                  >
                    每日高频互动时间段
                  </div>
                </div>
              </Card>
            </Col>
          </Flex>
        </Row>

        {/* 图表部分 */}
        <Row gutter={24} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Card
              title="行为分布"
              bordered={false}
              headStyle={{ fontSize: 16, border: 'none' }}
              bodyStyle={{ padding: '16px 0' }}
            >
              <ReactECharts option={behaviorChart()} style={{ height: 400 }} />
            </Card>
          </Col>

          <Col span={12}>
            <Card
              title="情感分析"
              bordered={false}
              headStyle={{ fontSize: 16, border: 'none' }}
              bodyStyle={{ padding: '16px 0' }}
            >
              <ScoreChart score={(generateData?.avgSentiment || 0) * 100} style={{ height: 400 }} />
            </Card>
          </Col>
        </Row>
      </Card>
    </>
  );
};
