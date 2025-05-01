import DongmanList from '@/pages/VideoList/Dongman/DongmanList';
import { Helmet, useModel } from '@@/exports';
import { AndroidOutlined, AppleOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Tabs, theme } from 'antd';
import React from 'react';
import Settings from '../../../../config/defaultSettings';
// @ts-ignore

const My: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const { token } = theme.useToken();
  return (
    // 修改浏览器标签页标题为个人中心！
    <PageContainer title={false} className={'my-layout-pro2'}>
      <div>
        <Helmet>
          <title>
            {currentUser?.username + '的个人主页'}- {Settings.title}
          </title>
        </Helmet>
        <Tabs
          defaultActiveKey="2"
          items={[AppleOutlined, AndroidOutlined].map((Icon, i) => {
            const id = String(i + 1);
            return {
              key: id,
              label: `Tab ${id}`,
              children: <DongmanList />,
              icon: <Icon />,
            };
          })}
        />
      </div>
    </PageContainer>
  );
};
export default My;
