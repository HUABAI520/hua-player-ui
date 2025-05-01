import { selable } from '@/pages/User/My/components/CommonPlay';
import { DailyModal } from '@/pages/User/My/components/DailyModal';
import { Card, Col, Flex, Row, Select, Statistic, theme } from 'antd';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import { BarChart, LineChart, ScatterChart } from 'echarts/charts';
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import React, { useState } from 'react';
import CountUp from 'react-countup';

// Register ECharts components
echarts.use([
  GridComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  DataZoomComponent,
  BarChart,
  LineChart,
  ScatterChart,
  CanvasRenderer,
]);

// Color constants
const CHART_COLORS = {
  watch: '#1890ff',
  effective: '#52c41a',
  comment: '#13c2c2',
  collect: '#722ed1',
  like: '#eb2f96',
  sentiment: '#ff7875',
  commentPerHour: '#fa8c16',
};

export interface TrendAnalysisProps {
  data: API.DailyUserFeatures[];
  lastDays: number;
  setLastDays?: (days: number) => void;
  type: 'all' | 'week' | 'month';
}

// Sentiment analysis utility
const analyzeSentiment = (data: API.DailyUserFeatures[]): string | null => {
  const countMap: Record<string, number> = { 积极: 0, 中性: 0, 消极: 0 };
  data.forEach((item) => {
    if (item.sentimentLabel) countMap[item.sentimentLabel]++;
  });
  const maxCount = Math.max(...Object.values(countMap));
  const dominant = Object.entries(countMap)
    .filter(([_, count]) => count === maxCount)
    .map(([label]) => label);
  return dominant.length === 1 ? dominant[0] : null;
};

// Active period analysis utility
const analyzeActivePeriod = (data: API.DailyUserFeatures[]): string | null => {
  const countMap: Record<string, number> = {};
  data.forEach((item) => {
    if (item.activePeriod) countMap[item.activePeriod] = (countMap[item.activePeriod] || 0) + 1;
  });
  const maxCount = Math.max(...Object.values(countMap));
  const dominant = Object.entries(countMap)
    .filter(([_, count]) => count === maxCount)
    .map(([period]) => period);
  return dominant.length === 1 ? dominant[0] : null;
};

// Format duration dynamically
const formatDuration = (seconds: number): { value: number; unit: string } => {
  if (seconds >= 3600) return { value: seconds / 3600, unit: '小时' };
  if (seconds >= 60) return { value: seconds / 60, unit: '分钟' };
  return { value: seconds, unit: '秒' };
};
const { useToken } = theme;
export const DailysPlay: React.FC<TrendAnalysisProps> = ({ data, lastDays, setLastDays, type }) => {
  const { token } = useToken();
  const filteredData = data.slice(-lastDays);
  const dates = filteredData.map((d) => d.activityDate);
  const dominantSentiment = analyzeSentiment(filteredData);
  const dominantActivePeriod = analyzeActivePeriod(filteredData);
  const avgWatchDuration =
    filteredData.reduce((sum, d) => sum + (d.totalWatchDuration || 0), 0) / filteredData.length;
  const { value: watchValue, unit: watchUnit } = formatDuration(avgWatchDuration);
  const [dailyPlay, setDailyPlay] = useState<string | undefined>();
  const getTotalAct = () => {
    return filteredData.reduce((sum, d) => sum + (d.avgDailyActivities || 0), 0);
  };
  const getTotalActDay = () => {
    return filteredData.reduce((sum, d) => sum + (d.activeDays || 0), 0);
  };

  // Count type occurrences
  const typeCountMap: Record<string, number> = {};
  filteredData.forEach((d) => {
    if (d.topType) typeCountMap[d.topType] = (typeCountMap[d.topType] || 0) + 1;
  });

  const mostFrequentTypeEntry = Object.entries(typeCountMap).reduce(
    (max, current) => (current[1] > max[1] ? current : max),
    ['', 0],
  );
  const mostFrequentType = mostFrequentTypeEntry[0] || '无记录';
  const mostFrequentCount = mostFrequentTypeEntry[1];
  // Chart generator
  const createTrendChart = (
    title: string,
    metrics: Array<{
      key: keyof API.DailyUserFeatures;
      name: string;
      color: string;
      formatter?: (v: number) => string;
      yAxisIndex?: number;
      type?: 'line' | 'bar';
    }>,
    isDualAxis: boolean = false,
  ) => ({
    title: { text: title, left: 'center', textStyle: { fontSize: 16, color: '#333' } },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#ddd',
      textStyle: { color: '#666' },
      formatter: (params: any) => {
        const date = dayjs(params[0].axisValue).format('YYYY-MM-DD');
        const items = params
          .map((p: any) => {
            const value = p.value;
            const formattedValue =
              p.seriesName === '观看时长' && value !== undefined
                ? `${formatDuration(
                    value * (watchUnit === '小时' ? 3600 : watchUnit === '分钟' ? 60 : 1),
                  ).value.toFixed(1)}${
                    formatDuration(
                      value * (watchUnit === '小时' ? 3600 : watchUnit === '分钟' ? 60 : 1),
                    ).unit
                  }`
                : value?.toLocaleString() || '-';
            return `
            <div style="display: flex; align-items: center; margin: 6px 0">
              <span style="display:inline-block;width:10px;height:10px;background:${p.color};border-radius:50%;margin-right:8px"></span>
              ${p.seriesName}: ${formattedValue}
            </div>
          `;
          })
          .join('');
        return `<div style="font-weight:600;margin-bottom:8px">${date}</div>${items}`;
      },
    },
    grid: { top: 60, bottom: 60, containLabel: true },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        formatter: (value: string) => dayjs(value).format('MM-DD'),
        rotate: 45,
      },
      axisTick: { alignWithLabel: true },
    },
    yAxis: isDualAxis
      ? [
          {
            type: 'value',
            name: `时长（${watchUnit}）`,
            position: 'left',
            axisLabel: { formatter: (v: number) => `${v.toFixed(1)}${watchUnit}` },
          },
          {
            type: 'value',
            name: '次数',
            position: 'right',
            axisLabel: { formatter: (v: number) => `${v.toLocaleString()}次` },
            splitLine: { show: false },
          },
        ]
      : {
          type: 'value',
          axisLabel: { formatter: (v: number) => `${v.toLocaleString()}` },
        },
    dataZoom: [
      {
        type: 'slider',
        bottom: 20,
        start: 0,
        end: 100,
        height: 20,
        handleSize: '80%',
      },
    ],

    series: metrics.map(({ key, name, color, yAxisIndex = 0, type = 'line' }) => ({
      name,
      type,
      yAxisIndex,
      smooth: true,
      data: filteredData.map((d) =>
        key === 'totalWatchDuration'
          ? (d[key] || 0) / (watchUnit === '小时' ? 3600 : watchUnit === '分钟' ? 60 : 1)
          : d[key],
      ),
      itemStyle: { color },
      lineStyle: type === 'line' ? { width: 2 } : undefined,
      areaStyle: type === 'line' ? { color: `${color}20` } : undefined,
      barMaxWidth: 40,
    })),
  });

  // Content preference chart with icons in tooltip
  const createTypePreferenceChart = () => {
    const allTypes = Array.from(new Set(filteredData.map((d) => d.topType))).filter(Boolean);
    const colors = [
      '#1890ff',
      '#52c41a',
      '#fadb14',
      '#eb2f96',
      '#722ed1',
      '#13c2c2',
      '#ff7a45',
      '#2f54eb',
      '#eb4f38',
      '#8c54ff',
      // Add more colors if needed for dozens of types
    ];
    const typeColors = allTypes.reduce(
      (acc, type, i) => ({ ...acc, [type as string]: colors[i % colors.length] }),
      {},
    );

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const data = filteredData[params[0].dataIndex];
          const icon = selable.find((s) => s.label === data.topType)?.icon || '';
          return `
            <div style="padding:8px;background:#fff;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
              <div style="font-weight:600">${dayjs(data.activityDate).format('YYYY-MM-DD')}</div>
              <div style="margin-top:8px;display:flex;align-items:center">
                ${icon ? `<span style="margin-right:8px">${icon}</span>` : ''}
                最喜欢类型: ${data.topType || '无记录'}
              </div>
              <div style="margin-top:4px">出现次数: ${typeCountMap[data.topType] || 0}</div>
            </div>
          `;
        },
      },
      grid: { top: 60, bottom: 60, left: 100, right: 20 },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          interval: Math.max(1, Math.floor(dates.length / 7)),
          rotate: 45,
          formatter: (value: string) => dayjs(value).format('MM-DD'),
        },
      },
      yAxis: {
        type: 'category',
        data: allTypes,
        axisLabel: {
          interval: 0,
          formatter: (value: string) => (value.length > 8 ? `${value.slice(0, 8)}...` : value),
        },
      },
      dataZoom: [
        {
          type: 'slider',
          bottom: 20,
          start: 0,
          end: 100,
          height: 20,
          handleSize: '80%',
        },
      ],
      graphic: {
        type: 'text',
        left: 'center',
        top: 10,
        style: {
          text: `最喜欢类型: ${mostFrequentType}  出现${mostFrequentCount}次`,
          fontSize: 14,
          fontWeight: 'bold',
          fill: '#333',
        },
      },
      series: [
        {
          type: 'line',
          data: filteredData.map((d) => ({
            value: d.topType || '无记录',
            itemStyle: { color: typeColors[d.topType as string] || '#999' },
          })),
          symbol: 'circle',
          symbolSize: 10,
          lineStyle: { width: 1, type: 'dashed' },
          itemStyle: { borderWidth: 2 },
        },
      ],
    };
  };

  // Summary cards
  const renderSummaryCards = () => (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      {[
        {
          title: '平均观看时长',
          value: watchValue,
          suffix: `${watchUnit}/天`,
          precision: 1,
        },
        {
          title: '时均评论数',
          value:
            filteredData.reduce((sum, d) => sum + (d.commentCount || 0), 0) /
            (filteredData.reduce((sum, d) => sum + (d.totalWatchDuration || 0), 0) / 3600),
          suffix: '次/小时',
          precision: 2,
        },
        dominantSentiment
          ? {
              title: '主流情感',
              value: dominantSentiment,
              color: selable.find((s) => s.label === dominantSentiment)?.color,
              icon: selable.find((s) => s.label === dominantSentiment)?.icon,
            }
          : null,
        dominantActivePeriod
          ? {
              title: '主要活跃时段',
              value: dominantActivePeriod,
              color: 'geekblue',
            }
          : null,
      ]
        .filter(Boolean)
        .map((item, i) => (
          <Col span={6} key={i}>
            <Card bordered={false} bodyStyle={{ padding: '16px 20px' }}>
              <Statistic
                title={<span style={{ color: '#666' }}>{item!.title}</span>}
                value={item!.value}
                suffix={item!.suffix}
                precision={item!.precision}
                formatter={(value) =>
                  typeof value === 'number' ? (
                    <CountUp end={value} duration={1.5} decimals={item!.precision} separator="," />
                  ) : (
                    <span style={{ color: item!.color }}>{value}</span>
                  )
                }
                valueStyle={{ color: item!.color || '#333', fontSize: 24, fontWeight: 'normal' }}
                prefix={
                  item!.icon && <div style={{ marginRight: 8, fontSize: 20 }}>{item!.icon}</div>
                }
              />
            </Card>
          </Col>
        ))}
    </Row>
  );

  return (
    <>
      <Card
        title={
          (type === 'all' ? '近' + lastDays + '天' : type === 'week' ? '这周' : '这月') +
          '的趋势分析'
        }
        bodyStyle={{ padding: 24 }}
        extra={
          type === 'all' && (
            <Select
              value={lastDays}
              onChange={(value) => {
                if (setLastDays) {
                  setLastDays(Number(value));
                }
              }}
              style={{ width: 120 }}
              options={[
                { label: '近10天', value: 10 },
                { label: '近15天', value: 15 },
                { label: '近30天', value: 30 },
                { label: '近60天', value: 60 },
                { label: '近90天', value: 90 },
                { label: '近100天', value: 100 },
              ]}
            />
          )
        }
      >
        {renderSummaryCards()}
        <Col span={24}>
          <Card
            title={
              <Flex gap={'small'}>
                <span>活跃度分析</span>
                {type === 'all' && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'end',
                    }}
                  ></div>
                )}
              </Flex>
            }
            style={{ margin: '24px 0' }}
          >
            <Row gutter={24}>
              {/* 左半部分 - 每日活动柱状图 */}
              <Col span={24}>
                <ReactECharts
                  onEvents={{
                    click: (params: any) => {
                      console.log(params);
                      if (params.value && params.value > 0) {
                        setDailyPlay(params.name);
                      }
                    },
                  }}
                  option={{
                    // 新增标题配置
                    title: [
                      {
                        text: `总活跃数：${getTotalAct()}`,
                        right: 0,
                        top: 50,
                        textStyle: {
                          fontSize: 16,
                          color: token.colorPrimary,
                          fontWeight: 'bold',
                          rich: {
                            num: {
                              color: token.colorError,
                              fontSize: 20,
                              padding: [0, 5],
                            },
                          },
                        },
                        // 添加背景装饰
                        backgroundColor: token.colorPrimaryBg,
                        borderRadius: 4,
                        padding: [6, 12],
                      },
                      {
                        text: `活跃天数：${getTotalActDay()}`,
                        right: 0,
                        top: 20,
                        textStyle: {
                          fontSize: 16,
                          color: token.colorPrimary,
                          fontWeight: 'bold',
                          rich: {
                            num: {
                              color: token.colorError,
                              fontSize: 20,
                              padding: [0, 5],
                            },
                          },
                        },
                        // 添加背景装饰
                        backgroundColor: token.colorPrimaryBg,
                        borderRadius: 4,
                        padding: [6, 12],
                      },
                    ],
                    animationDuration: 10,
                    animationEasing: 'backOut',
                    visualMap: {
                      type: 'piecewise',
                      orient: 'horizontal',
                      left: 'center',
                      bottom: 10,
                      pieces: [
                        { min: 1000, label: '极限活动度', color: '#8B0000' },
                        { min: 500, max: 999, label: '极高活动度', color: '#D50000' },
                        { min: 200, max: 499, label: '高活动度', color: '#FF5722' },
                        { min: 100, max: 199, label: '中活动度', color: '#FF9800' },
                        { min: 50, max: 99, label: '低活动度', color: '#FFC107' },
                        { min: 1, max: 49, label: '极低活动度', color: '#FFEB3B' },
                        { min: 0, max: 0, label: '无活动度', color: '#E0E0E0' },
                      ],
                      textStyle: {
                        color: '#666',
                      },
                    },
                    tooltip: {
                      trigger: 'axis',
                      formatter: (params: any) => {
                        const data = params[0];
                        return `${data.name}<br/>活动次数: ${data.value}`;
                      },
                    },
                    xAxis: {
                      type: 'category',
                      data: data?.map((d) => dayjs(d.activityDate).format('YYYY-MM-DD')),
                      itemStyle: {
                        color: (params: any) => {
                          const value = params.value || 0;
                          // 按指定分级返回颜色
                          if (value >= 1000) return '#8B0000'; // 极限-暗红
                          if (value >= 500) return '#D50000'; // 极高-深红
                          if (value >= 200) return '#FF5722'; // 高-橙红
                          if (value >= 100) return '#FF9800'; // 中-橙色
                          if (value >= 50) return '#FFC107'; // 低-金黄
                          if (value >= 1) return '#FFEB3B'; // 极低-明黄
                          return '#E0E0E0'; // 无-灰色
                        },
                        borderRadius: [4, 4, 0, 0],
                      },
                      barWidth: '70%',
                      // 添加渐变色效果
                      emphasis: {
                        itemStyle: {
                          shadowBlur: 8,
                          shadowColor: 'rgba(0, 0, 0, 0.3)',
                        },
                      },
                      axisLabel: {
                        rotate: 45, // 日期标签倾斜45度
                      },
                    },
                    yAxis: {
                      type: 'value',
                      name: '活动次数',
                    },
                    series: [
                      {
                        type: 'bar',
                        data: data?.map((d) => d.avgDailyActivities),
                        itemStyle: {
                          color: '#1890ff',
                          borderRadius: [4, 4, 0, 0], // 顶部圆角
                        },
                        barWidth: '70%', // 控制柱宽
                        label: {
                          show: true,
                          position: 'top',
                          // @ts-ignore
                          formatter: ({ value }) => (value > 0 ? value : ''),
                          color: token.colorText,
                          fontSize: 12,
                        },
                      },
                    ],
                    grid: {
                      top: 40,
                      bottom: 80, // 为倾斜标签留出空间
                      containLabel: true,
                    },
                    graphic: [
                      {
                        type: 'text',
                        right: 0,
                        bottom: 80,
                        style: {
                          text: `日均: ${(getTotalAct() / (data?.length || 1)).toFixed(1)}次/天`,
                          fill: token.colorTextSecondary,
                          fontSize: 12,
                          textAlign: 'right',
                        },
                      },
                      {
                        type: 'text',
                        right: 0,
                        bottom: 60,
                        style: {
                          text: `有效日均: ${(getTotalAct() / getTotalActDay()).toFixed(1)}次/天`,
                          fill: token.colorTextSecondary,
                          fontSize: 12,
                          textAlign: 'right',
                        },
                      },
                    ],
                  }}
                  style={{ height: 320, width: '100%' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Row gutter={[24, 24]}>
          {/* Content consumption trend */}
          <Col span={24}>
            <Card title="内容消费趋势" bodyStyle={{ padding: '16px 24px 8px' }}>
              <ReactECharts
                option={createTrendChart(
                  '',
                  [
                    {
                      key: 'totalWatchDuration',
                      name: '观看时长',
                      color: CHART_COLORS.watch,
                      yAxisIndex: 0,
                    },
                    {
                      key: 'effectivePlayCount',
                      name: '有效播放',
                      color: CHART_COLORS.effective,
                      yAxisIndex: 1,
                      type: 'bar',
                    },
                  ],
                  true,
                )}
                onEvents={{
                  click: (params: any) => {
                    if (params.value && params.value > 0) {
                      setDailyPlay(params.name);
                    }
                  },
                }}
                style={{ height: 400 }}
                opts={{ renderer: 'svg' }}
              />
            </Card>
          </Col>

          {/* Interaction behavior trend */}
          <Col span={24}>
            <Card title="互动行为趋势" bodyStyle={{ padding: '16px 24px' }}>
              <ReactECharts
                onEvents={{
                  click: (params: any) => {
                    console.log(params);
                    if (params.value && params.value > 0) {
                      setDailyPlay(params.name);
                    }
                  },
                }}
                option={createTrendChart('', [
                  {
                    key: 'commentCount',
                    name: '评论数',
                    color: CHART_COLORS.comment,
                    type: 'line',
                  },
                  {
                    key: 'commentsPerHour',
                    name: '每小时评论数',
                    color: CHART_COLORS.commentPerHour,
                    type: 'line',
                  },
                  {
                    key: 'collectionCount',
                    name: '收藏数',
                    color: CHART_COLORS.collect,
                    type: 'line',
                  },
                  { key: 'likeCount', name: '点赞数', color: CHART_COLORS.like, type: 'line' },
                ])}
                style={{ height: 300 }}
              />
            </Card>
          </Col>

          {/* Sentiment trend */}
          <Col span={24}>
            <Card title="情感趋势" bodyStyle={{ padding: '16px 24px' }}>
              <ReactECharts
                onEvents={{
                  click: (params: any) => {
                    console.log(params);
                    if (params.value && params.value > 0) {
                      setDailyPlay(params.name);
                    }
                  },
                }}
                option={createTrendChart('', [
                  { key: 'avgSentiment', name: '情感评分', color: CHART_COLORS.sentiment },
                  { key: 'sentimentLabel', name: '情感标签', color: '#722ed1', type: 'bar' },
                ])}
                style={{ height: 300 }}
              />
            </Card>
          </Col>

          {/* Content preference */}
          <Col span={24}>
            <Card title="每日动漫类型" bodyStyle={{ padding: '16px 24px' }}>
              <ReactECharts
                option={createTypePreferenceChart()}
                style={{ height: 400 }}
                onEvents={{
                  click: (params: any) => {
                    console.log(params);
                    if (params.value && params.value !== 0) {
                      setDailyPlay(params.name);
                    }
                  },
                }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      <DailyModal day={dailyPlay} setDailyPlay={setDailyPlay} />
    </>
  );
};
