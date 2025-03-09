import React from 'react';
import ProForm from '@ant-design/pro-form';
import { message, Modal } from 'antd';
import { ProFormCaptcha, ProFormText } from '@ant-design/pro-components';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { getUpdateMailEmail, updatePasswordUsingPut } from '@/services/api/userController';

export const PasswordModal: React.FC<{
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}> = ({ visible, onCancel, onSuccess }) => {
  const [form] = ProForm.useForm();
  return (
    <Modal
      title="修改密码"
      open={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      footer={null}
      destroyOnClose
      width={400}
    >
      <ProForm
        form={form}
        submitter={{
          searchConfig: {
            submitText: '提交修改',
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
            const msg = await updatePasswordUsingPut({
              ...values,
            });
            if (msg) {
              message.success('密码修改成功');
              form.resetFields();
              onSuccess();
              return true;
            }
            message.error('密码修改失败');
            return false;
          } catch (error) {
            message.error('密码修改失败，请重试');
            return false;
          }
        }}
      >
        <ProFormText
          name="email"
          label="邮箱"
          fieldProps={{
            prefix: <MailOutlined />,
          }}
          placeholder="请输入注册邮箱"
          rules={[
            { required: true, message: '请输入邮箱' },
            {
              type: 'email',
              message: '邮箱格式不正确',
            },
          ]}
        />

        <ProFormCaptcha
          name="code"
          label="验证码"
          fieldProps={{
            prefix: <LockOutlined />,
          }}
          placeholder="请输入验证码"
          rules={[{ required: true, message: '请输入验证码' }]}
          onGetCaptcha={async () => {
            const email = form.getFieldValue('email');
            if (!email) {
              message.error('请先输入邮箱');
              return;
            }
            try {
              await getUpdateMailEmail({ email });
              message.success('验证码已发送到您的邮箱');
            } catch (error) {
              message.error('验证码发送失败，请稍后重试');
            }
          }}
        />

        <ProFormText.Password
          name="userPassword"
          label="新密码"
          fieldProps={{
            prefix: <LockOutlined />,
          }}
          placeholder="请输入新密码"
          rules={[
            { required: true, message: '请输入新密码' },
            {
              pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$/,
              message: '6-16位字母+数字组合',
            },
          ]}
        />

        <ProFormText.Password
          name="checkPassword"
          label="确认密码"
          fieldProps={{
            prefix: <LockOutlined />,
          }}
          placeholder="请再次输入新密码"
          dependencies={['userPassword']}
          rules={[
            { required: true, message: '请确认密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('userPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject('两次输入的密码不一致');
              },
            }),
          ]}
        />
      </ProForm>
    </Modal>
  );
};
