import { add } from '@/services/api/typeController';
import { Button, Flex, Form, Input } from 'antd';
import React, { useState } from 'react';

export const KindAdd: React.FC<{
  onCloseRefresh: (values: API.HuaType[]) => void;
}> = ({ onCloseRefresh }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setLoading(true);
    const values = await form.validateFields();
    try {
      const res = await add({
        ...values,
      });
      if (res) {
        form.resetFields();
        onCloseRefresh(res);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <Form onFinish={submit} form={form} style={{ marginTop: '20px' }} layout={'vertical'}>
      <Form.Item
        name="huaType"
        label="类型"
        rules={[
          { required: true, message: '请输入类型' },
          {
            max: 10,
            message: '类型不能超过10个字符',
          },
        ]}
      >
        <Input allowClear placeholder="请输入类型" />
      </Form.Item>
      <Flex style={{ width: '100%', marginTop: '12px' }} justify={'end'}>
        <Button type="primary" htmlType="submit" loading={loading}>
          添加
        </Button>
      </Flex>
    </Form>
  );
};
