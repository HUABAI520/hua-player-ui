import { ExclamationCircleOutlined, UploadOutlined } from '@ant-design/icons';
import ProForm, {
  ProFormDatePicker,
  ProFormFieldSet,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { Button, Input, message, Modal, Tooltip, Upload } from 'antd';
import { useState } from 'react';

import { history, useModel } from '@@/exports';
import { ProFormSelect } from '@ant-design/pro-components';

import {
  getUserLoginUsingGet,
  updateUserUsingPost,
  uploadFile,
} from '@/services/api/userController';
import styles from './BaseView.less';
import { updateAnimePicture } from '@/services/api/animeController';
// 头像组件 方便以后独立，增加裁剪之类的功能
export const AvatarView = ({
  avatar,
  animeId,
  reload,
  onCancel,
}: {
  avatar: string | undefined;
  animeId?: number;
  reload?: () => void;
  onCancel?: () => void;
}) => {
  const [fileList, setFileList] = useState<File[]>([]); // 文件列表
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // 用户选择的头像预览 URL
  const [isAvatarSelected, setIsAvatarSelected] = useState<boolean>(false); // 标记是否已选择头像\
  const [string, setString] = useState<string>(animeId ? '选择动漫封面' : '选择头像'); // 字符串

  const beforeUpload = (file: any) => {
    // 在这里处理文件，例如读取文件内容等
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      // 在这里可以处理文件内容，上传到后端等
      console.log('File Content:', content);

      // 保存用户选择的头像文件信息
      setFileList([file]);
      // 创建预览 URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);
      setIsAvatarSelected(true);
      setString('重新选择');
    };
    reader.readAsBinaryString(file);

    // 返回 false 阻止默认上传行为
    return false;
  };
  const handleUpload = async () => {
    if (fileList.length > 0) {
      const avatarFile = fileList[0];
      // 调用后端接口上传头像文件
      try {
        const formData = new FormData();
        formData.append('file', avatarFile);
        if (animeId) {
          const res = await updateAnimePicture(
            {
              id: animeId,
            },
            avatarFile,
          );
          if (res) {
            message.success('上传成功!');
            // 上传成功后清空已选择头像的状态
            setIsAvatarSelected(false);
            setString('重新选择');
            reload?.();
            onCancel?.();
          }
        } else {
          const response = await uploadFile(avatarFile); // 上传头像的接口
          if (response) {
            message.success('上传成功!');
            // 上传成功后清空已选择头像的状态
            setIsAvatarSelected(false);
          }
        }

        // console.log('Upload Response:', response);
      } catch (error) {
        console.error('Upload Error:', error);
        message.error('上传失败');
      }
    }
  };

  const showConfirm = () => {
    Modal.confirm({
      title: '确认上传' + (animeId ? '动漫封面？' : '头像？'),
      icon: <ExclamationCircleOutlined />,
      onOk: handleUpload,
    });
  };
  return (
    <>
      <div className={styles.avatar_title}>{animeId ? '动漫封面' : '头像'}</div>
      <div className={styles.avatar}>
        {previewUrl ? (
          <img src={previewUrl} alt="avatar" style={{ maxWidth: '100%', maxHeight: '100%' }} />
        ) : (
          <img src={avatar} alt="avatar" />
        )}
      </div>
      <Upload
        showUploadList={false}
        beforeUpload={beforeUpload}
        // onChange={(info) => setFileList(info.fileList as File[])}
      >
        <div className={styles.button_view}>
          <Button>
            <UploadOutlined />
            {string}
          </Button>
        </div>
      </Upload>
      {isAvatarSelected && (
        <div className={styles.button_view}>
          <Button type="primary" onClick={showConfirm}>
            {'上传' + (animeId ? '动漫封面？' : '头像')}
          </Button>
        </div>
      )}
    </>
  );
};
const loginPath = '/user/login';
const BaseView = () => {
  // const { data: currentUser, loading } = useRequest(() => {
  //   return queryCurrent();
  // });
  const { initialState, setInitialState } = useModel('@@initialState'); //获得全局状态
  const { currentUser, loading } = initialState || {};
  const [formData, setFormData] = useState<API.UserVO>({});
  const [check, setCheck] = useState<boolean>(false);

  const getAvatarURL = () => {
    if (currentUser) {
      if (currentUser.userAvatar) {
        return currentUser.userAvatar;
      }
      return 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png';
    }
    return '';
  };

  const fetchUserInfo = async () => {
    try {
      return await getUserLoginUsingGet({
        skipErrorHandler: true,
      });
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  const handleValuesChange = (changedValues: any) => {
    const changed: API.UserVO = { ...formData, ...changedValues };
    setFormData(changed);
    setCheck(true);
  };

  const handleFinish = async () => {
    if (!check) {
      message.success('更新基本信息成功');
      return;
    }
    // @ts-ignore
    const updateUser: API.UserVO = {
      ...formData,
      id: currentUser?.id,
    };
    const res = await updateUserUsingPost(updateUser);
    if (res) {
      message.success('更新基本信息成功');
      // 重新获取最新的用户信息
      const updatedUserInfo = await fetchUserInfo();
      // 更新全局状态
      setInitialState({
        ...initialState,
        currentUser: updatedUserInfo,
      });
    } else {
      history.push(loginPath);
    }
  };
  return (
    <div className={styles.baseView}>
      {loading ? null : (
        <>
          <div className={styles.left}>
            <ProForm
              layout="vertical"
              onFinish={handleFinish}
              onValuesChange={handleValuesChange}
              submitter={{
                searchConfig: {
                  submitText: '更新基本信息',
                },
                render: (_, dom) => dom[1],
              }}
              initialValues={{
                ...currentUser,
                phone: currentUser?.phone?.split('-'),
                gender:
                  currentUser?.gender === 0 ? '女' : currentUser?.gender === 1 ? '男' : '保密',
                userRole: currentUser?.userRole === 'admin' ? '超级管理员' : currentUser?.userRole,
              }}
              requiredMark
            >
              <ProFormText
                width="md"
                name="email"
                label={
                  <Tooltip title="暂不允许修改~" color={'#f50'}>
                    <span>邮箱</span>
                  </Tooltip>
                }
                disabled
              />
              <ProFormText
                width="md"
                name="username"
                label="昵称"
                rules={[
                  {
                    required: true,
                    message: '请输入您的昵称!',
                  },
                ]}
              />
              <ProFormText
                width="md"
                name="userAccount"
                label={
                  <Tooltip title="不可更改" color={'#f50'}>
                    <span>账号</span>
                  </Tooltip>
                }
                disabled={true}
              />
              <div style={{ display: 'flex', gap: '16px' }}>
                <ProFormText
                  name="userRole"
                  label={
                    <Tooltip title="请联系管理员更改" color={'#f50'}>
                      <span>个人角色</span>
                    </Tooltip>
                  }
                  disabled={true}
                />
                <ProFormSelect
                  name="gender"
                  label="用户性别"
                  rules={[
                    {
                      required: true,
                      message: '请选择你的性别!',
                    },
                  ]}
                  valueEnum={{ 0: '女', 1: '男', 2: '保密' }}
                />
              </div>
              <ProFormTextArea
                width={'md'}
                name="profile"
                label="个人简介"
                rules={[
                  {
                    required: true,
                    message: '请输入个人简介!',
                  },
                ]}
                placeholder="个人简介"
              />
              <ProFormDatePicker
                width={'md'}
                name="createTime"
                label="注册时间"
                disabled
                fieldProps={{
                  format: 'YYYY-MM-DD HH:mm:ss', // 设置日期时间格式
                  showTime: false, // 显示时间选择
                }}
              />
            </ProForm>
          </div>
          <div className={styles.right}>
            <AvatarView avatar={getAvatarURL()} />
          </div>
        </>
      )}
    </div>
  );
};
export default BaseView;
