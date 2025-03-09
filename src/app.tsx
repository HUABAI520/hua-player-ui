import { loginPath, THEME_COLOR, THEME_LIGHT } from '@/common/GlobalKey';
import { getLocal } from '@/common/utils/LocalUtils';
import Footer from '@/components/Footer';
import { Question } from '@/components/RightContent';
import { getUserLoginUsingGet } from '@/services/api/userController';
import { useLocation } from '@@/exports';
import { RunTimeLayoutConfig } from '@@/plugin-layout/types';
import { LinkOutlined } from '@ant-design/icons';
import { SettingDrawer, Settings as LayoutSettings } from '@ant-design/pro-components';
import { history, Link } from '@umijs/max';
import { TabPaneProps } from 'antd';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import React, { useEffect } from 'react';
import defaultSettings from '../config/defaultSettings';
import { AvatarDropdown, AvatarName } from './components/RightContent/AvatarDropdown';
import { errorConfig } from './requestErrorConfig';

const isDev = process.env.NODE_ENV === 'development';

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.UserVO;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.UserVO | undefined>;
  tabList?: (TabPaneProps & { key?: React.Key | undefined })[] | { key: string; tab: any }[];
}> {
  const fetchUserInfo = async () => {
    try {
      const currentUser = await getUserLoginUsingGet({
        skipErrorHandler: true,
      });
      return currentUser;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  const tabList: (TabPaneProps & { key?: React.Key | undefined })[] | { key: string; tab: any }[] =
    [];
  // 如果不是登录页面，执行
  const { location } = history;
  if (location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: {
        ...(defaultSettings as Partial<LayoutSettings>),
        navTheme: getLocal(THEME_LIGHT + currentUser?.id, defaultSettings.navTheme),
        colorPrimary: getLocal(THEME_COLOR + currentUser?.id, defaultSettings.colorPrimary),
      },
      tabList,
    };
  }
  return {
    fetchUserInfo,
    settings: {
      ...(defaultSettings as Partial<LayoutSettings>),
    },
    tabList,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const location = useLocation();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const unlisten = history.listen(() => {
      NProgress.configure({ showSpinner: false });
      NProgress.start(); // 路由开始切换时启动进度条
      const bar2 = document.querySelector('#nprogress .bar') as any;
      if (bar2) {
        bar2.style.backgroundColor = initialState?.settings?.colorPrimary; // 将 #yourColor 替换为你希望的颜色}
      }
    });
    NProgress.done(); // 路由切换完成时停止进度条
    return () => {
      unlisten(); // 清理监听器，防止内存泄漏
    };
  }, [location.pathname]);

  return {
    // headerTitleRender: () => <LeftContent />,
    actionsRender: () => [<Question />],
    avatarProps: {
      src: initialState?.currentUser?.userAvatar,
      title: <AvatarName />,
      // @ts-ignore
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    waterMarkProps: {
      content: initialState?.currentUser?.username,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    layoutBgImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState: any) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...errorConfig,
};
