import CollectionDetail from '@/pages/User/Collection';
import MonthlyTab from '@/pages/User/My/components/MonthlyTab';
import OverviewTab from '@/pages/User/My/components/OverviewTab';
import WeeklyTab from '@/pages/User/My/components/WeeklyTab';
import { collectionsCount } from '@/services/api/collectionController';

import { PageContainer } from '@ant-design/pro-components';
import { Badge, Flex, Tabs, theme } from 'antd';

import * as echarts from 'echarts';
import { useEffect, useState } from 'react';
// 模拟数据生成

// 图表主题配置
echarts.registerTheme('dashboard', {
  color: ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE'],
  backgroundColor: '#f8f9fa',
});
const { useToken } = theme;
const Dashboard = () => {
  const { token } = useToken();
  const [collectionCount, setCollectionCount] = useState<number>();
  const getCollectionCount = () => {
    collectionsCount().then((res) => {
      setCollectionCount(res);
    });
  };
  useEffect(() => {
    getCollectionCount();
  }, []);
  const [activeTab, setActiveTab] = useState('1');
  const items = [
    {
      key: '1',
      label: `全景概览`,
      children: <OverviewTab />,
    },
    {
      key: '2',
      label: `周概览`,
      children: <WeeklyTab />,
    },
    {
      key: '3',
      label: `月概览`,
      children: <MonthlyTab />,
    },
    {
      key: '4',
      label: (
        <Flex justify={'start'} gap={'2px'}>
          <span>收藏</span> <Badge count={collectionCount} color={token.colorPrimary} />
        </Flex>
      ),
      children: (
        <CollectionDetail
          reLoadCount={() => {
            getCollectionCount();
          }}
        />
      ),
    },
  ];
  return (
    <PageContainer title={false} className={'my-layout-pro2'}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        defaultActiveKey="1"
        items={items.map((item) => {
          return {
            key: item.key,
            label: item.label,
          };
        })}
      />
      {items.map((item) => {
        //是对应的才展示
        if (item.key === activeTab) {
          // eslint-disable-next-line react/jsx-key
          return <div style={{}}>{item.children}</div>;
        } else {
          return null;
        }
      })}
    </PageContainer>
  );
};

export default Dashboard;
