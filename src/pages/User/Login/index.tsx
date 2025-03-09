import Footer from '@/components/Footer';

import {
  getLoginEmail,
  getRegisterEmail,
  userLoginMailUsingPost,
  userLoginUsingPost,
  userRegisterUsingPost,
} from '@/services/api/userController';
import {
  AlipayCircleOutlined,
  LockOutlined,
  MailOutlined,
  TaobaoCircleOutlined,
  UserOutlined,
  WeiboCircleOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import { Helmet, history, useModel } from '@umijs/max';
import { Alert, message, Modal, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import Settings from '../../../../config/defaultSettings';

import defaultSettings from '../../../../config/defaultSettings';
import { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { getLocal } from '@/common/utils/LocalUtils';
import { THEME_COLOR, THEME_LIGHT } from '@/common/GlobalKey';
import ProForm from '@ant-design/pro-form';
import { PasswordModal } from '@/pages/User/ChangePassword';

const Lang = () => {
  const langClassName = useEmotionCss(({ token }) => {
    return {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    };
  });
  console.log(langClassName);
  return;
};
const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};
const RegisterForm: React.FC<{
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}> = ({ visible, onCancel, onSuccess }) => {
  const [form] = ProForm.useForm();

  return (
    <Modal title="注册新账号" open={visible} onCancel={onCancel} footer={null} destroyOnClose>
      <ProForm
        form={form}
        submitter={{
          searchConfig: {
            submitText: '点击注册',
          },
          resetButtonProps: {
            style: {
              display: 'none',
            },
          },
          render: (props, doms) => {
            return [<div style={{ display: 'flex', justifyContent: 'flex-end' }}>{doms}</div>];
          },
        }}
        onFinish={async (values) => {
          try {
            const msg = await userRegisterUsingPost(values);
            if (msg > 0) {
              message.success('注册成功！');
              onSuccess();
              onCancel();
              return;
            }
            message.error('注册失败');
          } catch (error) {
            message.error('注册失败，请重试！');
          }
        }}
      >
        <ProFormText
          name="userAccount"
          label="账号"
          fieldProps={{
            prefix: <UserOutlined />,
          }}
          placeholder="请输入账号"
          rules={[
            { required: true, message: '请输入账号!' },
            { pattern: /^[a-zA-Z0-9]{4,16}$/, message: '4-16位字母数字组合' },
          ]}
        />
        <ProFormText
          name="username"
          label="用户名"
          fieldProps={{
            prefix: <UserOutlined />,
          }}
          placeholder="请输入用户名"
        />
        <ProFormText.Password
          name="userPassword"
          label="密码"
          fieldProps={{
            prefix: <LockOutlined />,
          }}
          placeholder="请输入密码"
          rules={[
            { required: true, message: '请输入密码!' },
            { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$/, message: '6-16位字母+数字组合' },
          ]}
        />
        <ProFormText.Password
          name="checkPassword"
          label="确认密码"
          fieldProps={{
            prefix: <LockOutlined />,
          }}
          placeholder="请再次输入密码"
          dependencies={['userPassword']}
          rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('userPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject('两次输入的密码不匹配!');
              },
            }),
          ]}
        />
        <ProFormText
          name="email"
          label="邮箱"
          fieldProps={{
            prefix: <MailOutlined />,
          }}
          placeholder="请输入邮箱"
          rules={[
            { required: true, message: '请输入邮箱!' },
            { type: 'email', message: '邮箱格式不正确' },
          ]}
        />
        <ProFormCaptcha
          name="code"
          label="验证码"
          fieldProps={{
            prefix: <LockOutlined />,
          }}
          placeholder="请输入验证码"
          rules={[{ required: true }]}
          onGetCaptcha={async () => {
            const email = form.getFieldValue('email');
            if (!email) {
              message.error('请先输入邮箱');
              return;
            }
            await getRegisterEmail({ email });
            message.success('验证码已发送！');
          }}
        />
      </ProForm>
    </Modal>
  );
};
const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const [type, setType] = useState<string>('account');
  const { initialState, setInitialState } = useModel('@@initialState');
  const [registerVisible, setRegisterVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    if (initialState && initialState?.currentUser) {
      // 返回上一个路由
      history.go(-1);
    }
  }, [initialState]);
  const containerClassName = useEmotionCss(() => {
    return {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    };
  });
  // 登录修修改登录用户信息全局状态+ 该用户保存的地区
  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (!userInfo) {
      message.error('登录失败，请重新登录');
      return;
    }
    if (userInfo) {
      flushSync(() => {
        setInitialState((s: any) => ({
          ...s,
          currentUser: userInfo,
          settings: {
            ...(defaultSettings as Partial<LayoutSettings>),
            navTheme: getLocal(THEME_LIGHT + userInfo?.id, defaultSettings.navTheme),
            colorPrimary: getLocal(THEME_COLOR + userInfo?.id, defaultSettings.colorPrimary),
          },
        }));
      });
    }
  };
  // todo 获取用户是否有查询权限的权限
  // const fetchPermissionOptions = async () => {
  //   const page = await initialState?.fetchPermissionOptions?.();
  //   // 在数据获取后更新全局状态
  //   setInitialState((s) => ({
  //     ...s,
  //     permissionOptions: page?.records,
  //   }));
  // };
  const handleSubmit = async (values: any) => {
    try {
      // 登录
      const msg =
        type === 'account'
          ? await userLoginUsingPost({
              ...(values as API.UserLoginRequest),
            })
          : await userLoginMailUsingPost({
              ...(values as {
                email: string;
                code: string;
              }),
            });
      if (msg.status === 'ok') {
        const defaultLoginSuccessMessage = '登录成功！';
        message.success(defaultLoginSuccessMessage);
        await fetchUserInfo();
        // await fetchPermissionOptions();
        const urlParams = new URL(window.location.href).searchParams;
        history.replace(urlParams.get('redirect') || '/');
        return;
      }
      console.log(msg);
      // 如果失败去设置用户错误信息
      setUserLoginState(msg);
    } catch (error) {
      const defaultLoginFailureMessage = '登录失败，请重试！';
      console.log(error);
      message.error(defaultLoginFailureMessage);
    }
  };
  const { status, type: loginType } = userLoginState;
  const [form] = ProForm.useForm();
  // @ts-ignore
  return (
    <div className={containerClassName}>
      <Helmet>
        <title>
          {'登录'}- {Settings.title}
        </title>
      </Helmet>
      {/*// @ts-ignore*/}
      <Lang />
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          form={form}
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/system_logo.png" />}
          title="Player"
          subTitle={'在线动漫观看平台'}
          initialValues={{
            autoLogin: true,
          }}
          // actions={['其他登录方式 :', <ActionIcons key="icons" />]}
          onFinish={async (values) => {
            await handleSubmit(values as any);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: '账户密码登录',
              },
              {
                key: 'email',
                label: '邮箱登录',
              },
            ]}
          />

          {status === 'error' && loginType === 'account' && (
            <LoginMessage content={'错误的用户名和密码'} />
          )}
          {type === 'account' && (
            <>
              <ProFormText
                name="userAccount"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder={'请输入账号！'}
                rules={[
                  {
                    required: true,
                    message: '账号是必填项！',
                  },
                  {
                    pattern: /^[a-zA-Z0-9]+$/,
                    message: '账号只能由数字和字母组成！',
                  },
                ]}
              />
              <ProFormText.Password
                name="userPassword"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={'请输入密码！'}
                rules={[
                  {
                    required: true,
                    message: '密码是必填项！',
                  },
                  {
                    pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/,
                    message: '密码必须包含字母和数字，且不少于 6 位，不超过 16 位！',
                  },
                ]}
              />
            </>
          )}

          {status === 'error' && loginType === 'email' && <LoginMessage content="验证码错误" />}
          {type === 'email' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MailOutlined />, // 使用邮箱图标
                }}
                name="email"
                placeholder={'请输入邮箱！'}
                rules={[
                  {
                    required: true,
                    message: '邮箱是必填项！',
                  },
                  {
                    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: '不合法的邮箱地址！',
                  },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder={'请输入验证码！'}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${'秒后重新获取'}`;
                  }
                  return '获取验证码';
                }}
                name="code"
                rules={[
                  {
                    required: true,
                    message: '验证码是必填项！',
                  },
                ]}
                onGetCaptcha={async () => {
                  const email = form.getFieldValue('email');
                  // 邮箱没有则不能发送且不进入计时
                  if (!email) {
                    message.error('请输入邮箱！');
                    return new Promise((resolve, reject) => {
                      reject();
                    });
                  }
                  const result = await getLoginEmail({
                    email,
                  });
                  if (!result) {
                    return;
                  }
                  message.success('验证码发送成功！');
                }}
              />
            </>
          )}
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              自动登录
            </ProFormCheckbox>
            <div style={{ float: 'right' }}>
              <a style={{ marginRight: 16 }} onClick={() => setPasswordVisible(true)}>
                忘记密码 ？
              </a>
              <a onClick={() => setRegisterVisible(true)}>没有账号 ？</a>
            </div>
          </div>
        </LoginForm>
        <RegisterForm
          visible={registerVisible}
          onCancel={() => setRegisterVisible(false)}
          onSuccess={() => {
            message.success('注册成功，请登录');
            setRegisterVisible(false);
          }}
        />
        <PasswordModal
          visible={passwordVisible}
          onCancel={() => setPasswordVisible(false)}
          onSuccess={() => {
            message.success('修改密码成功，请重新登录');
            setPasswordVisible(false);
          }}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Login;
