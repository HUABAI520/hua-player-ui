import { Pie } from '@ant-design/charts';
import { Modal, Statistic, Table, Typography } from 'antd';
import React from 'react';

interface DailyDetailModalProps {
  visible: boolean;
  date: string | null;
  onClose: () => void;
}

const DailyDetailModal: React.FC<DailyDetailModalProps> = ({ visible, date, onClose }) => {
  const behaviorData = [
    { type: '观看', value: 50 },
    { type: '收藏', value: 20 },
    { type: '评分', value: 10 },
  ];

  const tableData = behaviorData.map((item, index) => ({
    key: index,
    type: item.type,
    count: item.value,
  }));

  const pieConfig = {
    data: behaviorData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
  };

  return (
    <Modal
      title={<Typography.Title level={4}>{date} 用户行为详情</Typography.Title>}
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Statistic title="活跃用户数" value={80} style={{ marginBottom: 16 }} />
      <Pie {...pieConfig} />
      <Table
        dataSource={tableData}
        columns={[
          { title: '行为类型', dataIndex: 'type', key: 'type' },
          { title: '次数', dataIndex: 'count', key: 'count' },
        ]}
        pagination={false}
        style={{ marginTop: 16 }}
      />
    </Modal>
  );
};

export default DailyDetailModal;
