import { Column, Heatmap, Line, Pie } from '@ant-design/charts';
import type { TabsProps } from 'antd';
import { Card, Col, DatePicker, Row, Statistic, Tabs } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

const { RangePicker } = DatePicker;

// 模拟数据生成函数
const generateWeeklyData = () => {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    data.push({
      date: dayjs().subtract(i, 'week').format('YYYY-MM-DD'),
      watch: Math.floor(Math.random() * 300) + 100,
      comments: Math.floor(Math.random() * 50),
      likes: Math.floor(Math.random() * 200),
    });
  }
  return data;
};

const generateDailyHeatmap = () => {
  const data = [];
  const start = dayjs().subtract(30, 'day');
  for (let i = 0; i < 30; i++) {
    data.push({
      date: start.add(i, 'day').format('YYYY-MM-DD'),
      value: Math.floor(Math.random() * 100),
    });
  }
  return data;
};

// 总体概况页
const OverviewTab = () => {
  const data = generateWeeklyData();

  const lineConfig = {
    data,
    xField: 'date',
    yField: 'watch',
    seriesField: 'type',
    color: ['#1890ff', '#2fc25b', '#facc14'],
    smooth: true,
  };

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card title="核心指标">
          <Row gutter={16}>
            <Col span={6}>
              <Statistic title="总活跃天数" value={112} suffix="天" />
            </Col>
            <Col span={6}>
              <Statistic title="总观看时长" value={68.5} suffix="小时" />
            </Col>
            <Col span={6}>
              <Statistic title="平均每日活动" value={24.3} />
            </Col>
            <Col span={6}>
              <Statistic title="最爱类型" value="科幻" />
            </Col>
          </Row>
        </Card>
      </Col>

      <Col span={12}>
        <Card title="活跃趋势">
          <Line {...lineConfig} />
        </Card>
      </Col>

      <Col span={12}>
        <Card title="行为分布">
          <Column data={data} xField="date" yField="comments" color="#1890ff" />
        </Card>
      </Col>

      <Col span={24}>
        <Card title="活跃热力图">
          <Heatmap
            data={generateDailyHeatmap()}
            xField="date"
            yField="time"
            colorField="value"
            color="#F51D27-#FA541C-#FF8C12-#FFC838-#FAFFA8"
          />
        </Card>
      </Col>
    </Row>
  );
};

// 月数据页
const MonthlyTab = () => {
  const [selectedMonth, setSelectedMonth] = useState(dayjs().subtract(1, 'month'));

  return (
    <div>
      <Card
        title="选择月份"
        extra={
          <DatePicker
            picker="month"
            defaultValue={selectedMonth}
            disabledDate={(current) => current > dayjs().endOf('month')}
          />
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Line data={generateWeeklyData()} xField="date" yField="watch" color="#1890ff" />
          </Col>
          <Col span={12}>
            <Pie
              data={[
                { type: '观看', value: 68 },
                { type: '评论', value: 12 },
                { type: '收藏', value: 20 },
              ]}
              angleField="value"
              colorField="type"
              innerRadius={0.6}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

// 周数据页
const WeeklyTab = () => {
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(2, 'week'),
    dayjs().subtract(1, 'week'),
  ]);

  return (
    <div>
      <Card
        title="选择周范围"
        extra={
          <RangePicker picker="week" disabledDate={(current) => current > dayjs().endOf('week')} />
        }
      >
        {/* 周数据图表 */}
      </Card>
    </div>
  );
};

const UserDashboard = () => {
  const items: TabsProps['items'] = [
    { key: '1', label: '总体概况', children: <OverviewTab /> },
    { key: '2', label: '月度分析', children: <MonthlyTab /> },
    { key: '3', label: '周度趋势', children: <WeeklyTab /> },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5' }}>
      <Card
        title="用户行为分析中心"
        bordered={false}
        headStyle={{ fontSize: 20, fontWeight: 'bold' }}
      >
        <Tabs defaultActiveKey="1" items={items} animated />
      </Card>
    </div>
  );
};

export default UserDashboard;
