import {
  addSensitiveWord,
  getSensitiveWords,
  updateSensitiveWord,
} from '@/services/api/sensitiveController';
import { Button, Form, Input, message, Modal, Pagination, Table, TableProps, theme } from 'antd';
import React, { useEffect, useState } from 'react';

interface SensitiveWord {
  word: string;
}
const { useToken } = theme;
const Sensitive: React.FC = () => {
  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();
  const [data, setData] = useState<SensitiveWord[]>([]);
  const [pagination, setPagination] = useState<{
    current: number;
    pageSize: number;
    total: number;
  }>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [keyword, setKeyword] = useState<string>('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [currentWord, setCurrentWord] = useState<string>('');
  const { token } = useToken();
  // 获取敏感词列表
  const fetchSensitiveWords = async (page: number, pageSize: number, keyword?: string) => {
    try {
      console.log('Fetching sensitive words with:', { page, pageSize, keyword });
      const res = await getSensitiveWords({ page, pageSize, keyword });
      console.log('Response:', res);
      if (res && res.data) {
        const d = res.data.map((word: string) => ({ word }));
        setData(d);
        setPagination({
          current: res.page || page,
          pageSize: res.page_size || pageSize,
          total: res.total || 0,
        });
      } else {
        setData([]);
        setPagination((prev: any) => ({ ...prev, current: page, pageSize, total: 0 }));
      }
    } catch (error) {
      console.error('Error fetching sensitive words:', error);
      message.error('获取敏感词列表失败');
      setData([]);
    }
  };

  // 初始化加载数据
  useEffect(() => {
    fetchSensitiveWords(pagination.current || 1, pagination.pageSize || 10, keyword);
  }, []); // 仅初始化

  // 处理分页变化
  const handleTableChange = (page: number, pageSize: number) => {
    const newPage = page || 1;
    const newPageSize = pageSize || 10;
    fetchSensitiveWords(newPage, newPageSize, keyword); // 直接使用新参数
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setKeyword(value);
    fetchSensitiveWords(1, pagination.pageSize || 10, value); // 重置到第一页
  };

  // 添加敏感词
  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      const res = await addSensitiveWord({
        word: values.word,
      });
      message.success(res);
      form.resetFields();
      setIsAddModalVisible(false);
      fetchSensitiveWords(pagination.current || 1, pagination.pageSize || 10, keyword);
    } catch (error) {
      message.error('添加敏感词失败');
    }
  };

  // 更新敏感词
  const handleUpdate = async () => {
    try {
      const values = await updateForm.validateFields();
      const res = await updateSensitiveWord({ oldWord: currentWord, newWord: values.newWord });
      if (res) {
        message.success(res);
        updateForm.resetFields();
        setIsUpdateModalVisible(false);
        fetchSensitiveWords(pagination.current || 1, pagination.pageSize || 10, keyword);
      }
    } catch (error) {
      message.error('更新敏感词失败');
    }
  };

  // 表格列定义
  const columns: TableProps<SensitiveWord>['columns'] = [
    {
      title: '敏感词',
      dataIndex: 'word',
      key: 'word',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          style={{
            color: token.colorPrimaryText,
          }}
          onClick={() => {
            setCurrentWord(record.word);
            updateForm.setFieldsValue({ newWord: record.word });
            setIsUpdateModalVisible(true);
          }}
        >
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="输入关键词搜索"
          onSearch={handleSearch}
          style={{ width: 200, marginRight: 16 }}
        />
        <Button type="primary" onClick={() => setIsAddModalVisible(true)}>
          添加敏感词
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowKey={'word'}
        scroll={{ y: 'calc(60vh)' }}
      />
      <Pagination
        showTotal={(total, range) => `${range[0]}-${range[1]} 共 ${total} 条`}
        defaultCurrent={1}
        defaultPageSize={10}
        current={pagination.current}
        pageSize={pagination.pageSize}
        style={{ marginTop: 15 }}
        total={pagination.total}
        onChange={handleTableChange}
        showSizeChanger
        showQuickJumper
        align="end"
      />
      <Modal
        title="添加敏感词"
        open={isAddModalVisible}
        onOk={handleAdd}
        onCancel={() => {
          form.resetFields();
          setIsAddModalVisible(false);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="word"
            label="敏感词"
            rules={[{ required: true, message: '请输入敏感词' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="更新敏感词"
        open={isUpdateModalVisible}
        onOk={handleUpdate}
        onCancel={() => {
          updateForm.resetFields();
          setIsUpdateModalVisible(false);
        }}
      >
        <Form form={updateForm} layout="vertical">
          <Form.Item
            name="newWord"
            label="新敏感词"
            rules={[{ required: true, message: '请输入新敏感词' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default Sensitive;
