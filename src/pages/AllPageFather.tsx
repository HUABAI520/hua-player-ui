import { useModel } from '@@/exports';
import { CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Dropdown, DropdownProps, MenuProps } from 'antd';
import React, { useCallback, useState } from 'react';
import ReactDOM from 'react-dom';

import { Outlet, useLocation, useNavigate } from 'umi';
import routes from '../../config/routes';

const AllPageFather: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // 引入全局状态
  const { initialState, setInitialState } = useModel('@@initialState');
  const tabList = initialState?.tabList || [];
  const [reKey, setReKey] = useState(0);

  // const [tabList, setTabList] = useState<
  //   (TabPaneProps & { key?: React.Key | undefined })[] | { key: string; tab: any }[]
  // >([]);

  const getTabName = () => {
    // 辅助函数，用于递归查找路由名称
    const findRouteName = (routes: any, path: any): any => {
      for (const route of routes) {
        if (path === route.path && (!route.routes || route.routes.length === 0)) {
          return { name: route.name, key: route.path };
        }
        if (route.routes && route.routes.length > 0) {
          // @ts-ignore
          const name = findRouteName(route.routes, path);
          if (name) return name; // 如果在子路由中找到匹配项，则返回名称
        }
      }
      return null; // 如果没有找到匹配项，则返回null
    };

    // 使用辅助函数查找当前路由的名称
    return findRouteName(routes, location.pathname);
  };
  const getTabKey = () => {
    // const tabKey = location.pathname.split('/').pop();
    // const tabKey = location.pathname.split('commodity/')[1];
    const tabKey = location.pathname;
    // 会传递路由 包含根 第二层 等 我只需要获得最后的路由 根据 routes 判断

    // 判断tabList 是否包含该key
    // 包含直接返回，不包含添加并返回
    // @ts-ignore
    if (tabList.find((item: { key: string }) => item.key === tabKey)) {
      return tabKey;
    }

    if (!getTabName()) {
      return null;
    }
    const { name, key } = getTabName();
    if (name) {
      tabList.push({
        key: tabKey,
        tab: name,
      });
      return key;
    }
    return null; // 默认选中 Display
  };
  const handleTabChange = useCallback(
    (key: string) => {
      navigate(key);
    },
    [navigate],
  );
  const welcome = '/welcome';

  const handleTabClose = (e: React.MouseEvent | React.KeyboardEvent | string) => {
    if (tabList.length === 1) {
      navigate(welcome);
      return;
    }
    // 如果删除的是其他key的标签 直接删除不做处理
    if (e !== location.pathname) {
      // @ts-ignore
      const updatedTabList = tabList.filter((item) => item.key !== e);
      // setTabList(updatedTabList);
      setInitialState({
        ...initialState,
        tabList: updatedTabList,
      });
      return;
    } else {
      const index = tabList.findIndex((item: any) => item.key === e);
      if (index > 0) {
        if (tabList) {
          const item = tabList[index - 1];
          navigate((item.key as string) || welcome);
        }
      } else {
        navigate((tabList[index + 1].key as string) || welcome);
      }
      tabList.splice(index, 1);
      // setTabList(tabList);
    }
  };

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [contextKey, setContextKey] = useState('');
  const handleContextMenu = (key: string, event: React.MouseEvent) => {
    event.preventDefault();
    setContextKey(key);
    setMenuPosition({ x: event.clientX, y: event.clientY });
    setMenuVisible(true);
  };

  const handleMenuClick = (action: string) => {
    if (action === 'close') {
      handleTabClose(contextKey);
    } else if (action === 'otherClose') {
      console.log('关闭其他');
      // @ts-ignore
      const updatedTabList = tabList.filter((item) => item.key === location.pathname);
      setInitialState({
        ...initialState,
        tabList: updatedTabList,
      });
    } else if (action === 'allClose') {
      setInitialState({
        ...initialState,
        tabList: [],
      });
      navigate(welcome);
    } else if (action === 'reload') {
      setReKey((prevKey) => prevKey + new Date().getTime()); // 改变 key 值
    }
    setMenuVisible(false);
  };

  // const menu = (
  //   <Menu>
  //     <Menu.Item key="1" onClick={() => handleMenuClick('close')}>
  //       关闭当前标签
  //     </Menu.Item>
  //     <Menu.Item key="2" onClick={() => message.info('其他操作')}>
  //       其他操作
  //     </Menu.Item>
  //   </Menu>
  // );
  const items: MenuProps['items'] = [
    {
      label: (
        <span onClick={() => handleMenuClick('close')}>
          <CloseOutlined /> 关闭当前
        </span>
      ),
      key: '0',
    },
    {
      label: (
        <span onClick={() => handleMenuClick('reload')}>
          <ReloadOutlined /> 刷新页面
        </span>
      ),
      key: '1',
    },
    {
      type: 'divider',
    },
    {
      label: (
        <span onClick={() => handleMenuClick('otherClose')}>
          <CloseOutlined /> 关闭其他
        </span>
      ),
      key: '3',
    },
    {
      label: (
        <span onClick={() => handleMenuClick('allClose')}>
          <CloseOutlined /> 全部关闭
        </span>
      ),
      key: '4',
    },
  ];
  const handleOpenChange: DropdownProps['onOpenChange'] = (nextOpen) => {
    setMenuVisible(nextOpen);
  };
  return (
    <>
      <PageContainer
        key={reKey}
        fixedHeader={true}
        title={false}
        tabList={tabList}
        className={'custom-tab'}
        tabActiveKey={getTabKey()}
        onTabChange={handleTabChange}
        tabProps={{
          animated: true,
          type: 'editable-card',
          hideAdd: true,
          onTabClick: (key, e) => {
            if (key === location.pathname) {
              e.preventDefault();
              handleContextMenu(key, e as React.MouseEvent);
            }
          },
          onEdit: (e, action) => {
            if (action === 'remove') {
              handleTabClose(e);
              // // 删除本身  删除后为空不获得key 并获得前一个的key 若不为空数组 若前一个为空 则获得删除的后面那个key
              // if (tabList.length === 1) {
              //   navigate(welcome);
              //   return;
              // }
              // // 如果删除的是其他key的标签 直接删除不做处理
              // if (e !== location.pathname) {
              //   // @ts-ignore
              //   const updatedTabList = tabList.filter((item) => item.key !== e);
              //   // setTabList(updatedTabList);
              //   setInitialState({
              //     ...initialState,
              //     tabList: updatedTabList,
              //   });
              //   return;
              // } else {
              //   const index = tabList.findIndex((item) => item.key === e);
              //   if (index > 0) {
              //     if (tabList) {
              //       const item = tabList[index - 1];
              //       navigate((item.key as string) || welcome);
              //     }
              //   } else {
              //     navigate((tabList[index + 1].key as string) || welcome);
              //   }
              //   tabList.splice(index, 1);
              //   // setTabList(tabList);
              // }
            }
          },
        }}
      >
        <Outlet />
      </PageContainer>
      {menuVisible &&
        ReactDOM.createPortal(
          <Dropdown
            menu={{ items }}
            open={menuVisible}
            trigger={['click']}
            onOpenChange={handleOpenChange}
          >
            <a
              onClick={(e) => e.preventDefault()}
              style={{
                position: 'absolute',
                top: menuPosition.y,
                left: menuPosition.x,
                zIndex: 1000,
              }}
            ></a>
          </Dropdown>,
          document.body,
        )}
    </>
  );
};

export default AllPageFather;
