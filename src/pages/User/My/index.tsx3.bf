import { Column, DualAxes, Heatmap, Line, Pie } from '@ant-design/charts';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import { Card, Col, DatePicker, Row, Tabs, Tag } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

const { RangePicker } = DatePicker;

// 视觉样式配置
const chartTheme = {
  colors10: ['#20a8d8', '#4dbd74', '#ffc107', '#f86c6b', '#63c2de'],
  colors20: ['#20a8d8', '#4dbd74', '#ffc107', '#f86c6b', '#63c2de'],
};

// 模拟数据生成
const mockData = {
  // 全量数据
  overview: {
    active_days: 68,
    avg_daily_activities: 18.2,
    total_watch_duration: 4820,
    comment_count: 156,
    sentiment: {
      positive: 72,
      neutral: 23,
      negative: 5,
    },
    activity_heatmap: Array.from({ length: 90 }).map((_, i) => ({
      date: dayjs()
        .subtract(89 - i, 'day')
        .format('YYYY-MM-DD'),
      value: Math.floor(Math.random() * 50) + 10,
    })),
  },

  // 周数据
  weekly: {
    current: generateWeekData(0),
    previous: generateWeekData(1),
  },

  // 月数据
  monthly: {
    current: generateMonthData(0),
    previous: generateMonthData(1),
  },
};

function generateWeekData(weeksAgo: number) {
  return Array.from({ length: 7 }).map((_, i) => ({
    date: dayjs()
      .subtract(weeksAgo * 7 + 6 - i, 'day')
      .format('YYYY-MM-DD'),
    watch: Math.floor(Math.random() * 300) + 100,
    comments: Math.floor(Math.random() * 30),
    likes: Math.floor(Math.random() * 200),
  }));
}

function generateMonthData(monthsAgo: number) {
  return Array.from({ length: 30 }).map((_, i) => ({
    date: dayjs()
      .subtract(monthsAgo, 'month')
      .subtract(29 - i, 'day')
      .format('YYYY-MM-DD'),
    watch: Math.floor(Math.random() * 400) + 50,
    comments: Math.floor(Math.random() * 40),
    active_hours: Array.from({ length: 24 }).map((_, h) => ({
      hour: `${h}:00`,
      value: Math.floor(Math.random() * 50) + (h > 18 ? 30 : 10),
    })),
  }));
}

// 核心指标展示组件
const MetricCard = ({ title, value, compare }: any) => (
  <Card bordered={false} bodyStyle={{ padding: 16 }}>
    <div style={{ fontSize: 14, color: '#666' }}>{title}</div>
    <div style={{ fontSize: 24, fontWeight: 600, margin: '8px 0' }}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
    {compare && (
      <div style={{ color: compare.value > 0 ? '#4dbd74' : '#f86c6b' }}>
        {compare.value > 0 ? <CaretUpOutlined /> : <CaretDownOutlined />}
        {Math.abs(compare.value)}% vs 上周
      </div>
    )}
  </Card>
);

// 全量数据页
const OverviewTab = () => (
  <Row gutter={[16, 16]}>
    <Col span={24}>
      <Row gutter={16}>
        <Col span={6}>
          <MetricCard
            title="总活跃天数"
            value={mockData.overview.active_days}
            compare={{ value: 12.5 }}
          />
        </Col>
        <Col span={6}>
          <MetricCard
            title="观看时长（小时）"
            value={(mockData.overview.total_watch_duration / 60).toFixed(1)}
          />
        </Col>
        <Col span={6}>
          <MetricCard title="日均活跃度" value={mockData.overview.avg_daily_activities} />
        </Col>
        <Col span={6}>
          <MetricCard title="积极情感占比" value={`${mockData.overview.sentiment.positive}%`} />
        </Col>
      </Row>
    </Col>

    <Col span={24}>
      <Card title="90日活跃热力图">
        <Heatmap
          data={mockData.overview.activity_heatmap}
          xField="date"
          yField="week"
          colorField="value"
          color={['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']}
          legend={{ position: 'bottom' }}
          height={200}
        />
      </Card>
    </Col>

    <Col span={12}>
      <Card title="情感分布">
        <Pie
          data={Object.entries(mockData.overview.sentiment).map(([k, v]) => ({
            type: k,
            value: v,
          }))}
          angleField="value"
          colorField="type"
          innerRadius={0.6}
          label={{
            type: 'inner',
            offset: '-50%',
            content: '{value}%',
          }}
        />
      </Card>
    </Col>

    <Col span={12}>
      <Card title="行为分布">
        <Column
          data={[
            { type: '观看', value: mockData.overview.total_watch_duration },
            { type: '评论', value: mockData.overview.comment_count },
            { type: '收藏', value: 89 },
          ]}
          xField="type"
          yField="value"
          color="#20a8d8"
          label={{ position: 'middle' }}
        />
      </Card>
    </Col>
  </Row>
);

// 周数据页
const WeeklyTab = () => {
  const [compareMode, setCompareMode] = useState(true);

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card
          title="本周趋势分析"
          extra={
            <Tag.CheckableTag
              checked={compareMode}
              onChange={(checked) => setCompareMode(checked)}
              style={{ marginRight: 0 }}
            >
              对比模式
            </Tag.CheckableTag>
          }
        >
          <DualAxes
            data={[mockData.weekly.current, mockData.weekly.previous]}
            xField="date"
            yField={['watch', 'watch']}
            geometryOptions={[
              { geometry: 'line', color: '#20a8d8' },
              { geometry: 'line', color: '#4dbd74', lineDash: [4, 4] },
            ]}
            legend={{
              items: [
                { name: '本周', marker: { style: { fill: '#20a8d8' } } },
                { name: '上周', marker: { style: { stroke: '#4dbd74' } } },
              ],
            }}
          />
        </Card>
      </Col>

      <Col span={12}>
        <Card title="每日活跃对比">
          <Column
            data={[
              ...mockData.weekly.current.map((d) => ({ ...d, type: '本周' })),
              ...mockData.weekly.previous.map((d) => ({ ...d, type: '上周' })),
            ]}
            xField="date"
            yField="watch"
            seriesField="type"
            isGroup={true}
            color={['#20a8d8', '#4dbd74']}
          />
        </Card>
      </Col>

      <Col span={12}>
        <Card title="互动行为趋势">
          <Line
            data={mockData.weekly.current}
            xField="date"
            yField="comments"
            color="#ffc107"
            yAxis={{ label: { formatter: (v) => `${v}次` } }}
          />
        </Card>
      </Col>
    </Row>
  );
};

// 月数据页
const MonthlyTab = () => (
  <Row gutter={[16, 16]}>
    <Col span={24}>
      <Card title="月度趋势对比">
        <DualAxes
          data={[mockData.monthly.current, mockData.monthly.previous]}
          xField="date"
          yField={['watch', 'watch']}
          geometryOptions={[
            { geometry: 'line', color: '#20a8d8' },
            { geometry: 'line', color: '#f86c6b', lineDash: [4, 4] },
          ]}
        />
      </Card>
    </Col>

    <Col span={24}>
      <Card title="分时段活跃热力图">
        <Heatmap
          data={mockData.monthly.current.flatMap((day) =>
            day.active_hours.map((h) => ({
              date: day.date,
              hour: h.hour,
              value: h.value,
            })),
          )}
          xField="date"
          yField="hour"
          colorField="value"
          color="#20a8d8-#f86c6b"
          shape="circle"
          size={0.8}
          tooltip={{ fields: ['date', 'hour', 'value'] }}
        />
      </Card>
    </Col>
  </Row>
);

export default function Dashboard() {
  return (
    <div
      style={{
        padding: 24,
        background: '#f8f9fa',
        maxWidth: 1600,
        margin: '0 auto',
      }}
    >
      <Card
        bordered={false}
        headStyle={{
          fontSize: 20,
          fontWeight: 600,
          borderBottom: '2px solid #f0f0f0',
          padding: '0 16px',
        }}
        bodyStyle={{ padding: 0 }}
        title="用户行为分析中心"
      >
        <Tabs
          defaultActiveKey="1"
          items={[
            { key: '1', label: '全景概览', children: <OverviewTab /> },
            { key: '2', label: '周度分析', children: <WeeklyTab /> },
            { key: '3', label: '月度洞察', children: <MonthlyTab /> },
          ]}
          tabBarStyle={{
            padding: '0 16px',
            marginBottom: 0,
          }}
          animated
        />
      </Card>
    </div>
  );
}
