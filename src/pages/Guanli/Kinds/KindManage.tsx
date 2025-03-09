import { KindAdd } from '@/common/Edit/KindAdd';
import { deleteType, getTypeAll } from '@/services/api/typeController';
import { Button, Input, message, Modal, Space, Table } from 'antd';
import React, { useEffect, useState } from 'react';

const KindManage: React.FC = () => {
  const [data, setData] = useState<API.HuaType[]>([]);
  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState<string>('');
  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const types = await getTypeAll();
      setData(types);
    } catch (error) {
      message.error('获取类型失败');
    }
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) {
      message.error('ID不能为空');
      return;
    }
    const res = await deleteType({ id });
    if (res) {
      message.success('删除成功');
      setData(res);
    }
  };

  const handleAddSuccess = (newData: API.HuaType[]) => {
    setData(newData);
    setVisible(false);
  };
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };
  const filteredData = data.filter((item) =>
    item.type.toLowerCase().includes(searchText.toLowerCase()),
  );
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: API.HuaType) => (
        <Button type="default" onClick={() => handleDelete(record?.id)}>
          删除
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Space direction="vertical" style={{ marginBottom: '16px' }}>
        <Space>
          <Input
            placeholder="按类型搜索"
            value={searchText}
            onChange={handleSearch}
            style={{ width: 200 }}
          />
          <Button type="primary" onClick={() => setVisible(true)}>
            新增类型
          </Button>
        </Space>
      </Space>
      <Table dataSource={filteredData} columns={columns} rowKey="id" scroll={{ y: 'calc(60vh)' }} />
      <Modal title="新增类型" open={visible} footer={null} onCancel={() => setVisible(false)}>
        <KindAdd onCloseRefresh={handleAddSuccess} />
      </Modal>
    </div>
  );
};
export default KindManage;
