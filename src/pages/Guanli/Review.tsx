import { ReportTypeList } from '@/common/interaction/InteractionType';
import { UserMsg } from '@/common/UserMsg';
import { formatDateByString } from '@/common/utils/DateUtils';
import { queryPage, queryRecordPage, review } from '@/services/api/contentReviewController';
import { usePagination } from 'ahooks';
import { Button, Form, Input, message, Modal, Select, Space, Table, TableProps, Tag } from 'antd';
import React, { useState } from 'react';

const REPORT_TYPE_MAP = {
  1: '色情低俗',
  2: '政治敏感',
  3: '暴恐涉政',
  4: '垃圾广告',
  5: '违法信息',
  6: '其他',
};

const ReviewPage = () => {
  const [form] = Form.useForm();
  const [selectedItem, setSelectedItem] = useState<API.ContentReviewQueryResp | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 分页查询
  const { data, loading, pagination, refresh } = usePagination(
    async ({ current, pageSize }, params) => {
      const { keyword, status, type } = await form.validateFields();
      const res = await queryPage({
        page: current,
        pageSize,
        ...params,
        keyword,
        status,
        type,
      });
      return {
        list: res.records || [],
        total: res.totalRow || 0,
      };
    },
    {
      defaultPageSize: 10,
    },
  );

  // 处理审核
  const handleReview = async (
    status: number,
    accType: number,
    record?: API.ContentReviewQueryResp,
  ) => {
    if (!record && (!selectedItem || !selectedItem?.thirdId || !selectedItem.thirdType)) {
      return;
    }
    if (!selectedItem! && (!record || !record.thirdType || !record.thirdId)) {
      return;
    }
    try {
      await review({
        thirdId: record ? record.thirdId : selectedItem?.thirdId,
        thirdType: record ? record.thirdType : selectedItem?.thirdType,
        status,
        accType: accType,
      });
      message.success('审核成功');
      setModalVisible(false);
      refresh();
    } catch (error) {
      message.error('审核失败');
    }
  };

  const columns: TableProps<API.ContentReviewQueryResp>['columns'] = [
    {
      title: '内容类型',
      dataIndex: 'thirdType',
      render: (type) => ['评论', '弹幕', '评价'][type - 1],
    },
    {
      title: '内容',
      dataIndex: 'content',
      ellipsis: true,
    },
    {
      title: '发布者',
      dataIndex: 'publishUser',
      render: (user) => {
        // todo 查看用户信息
        return user ? <UserMsg user={user} /> : '未知';
      },
    },
    {
      title: '举报类型',
      dataIndex: 'latestType',
      render: (type) => (
        <Tag color="red">{ReportTypeList.find((item) => item.type === type)?.name}</Tag>
      ),
    },
    {
      title: '举报次数',
      dataIndex: 'reportCount',
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={status === 0 ? 'orange' : status === 1 ? 'red' : 'green'}>
          {['待审核', '已违规', '未违规'][status]}
        </Tag>
      ),
    },
    {
      title: '操作',
      // 固定
      fixed: 'right',
      width: 250,
      render: (_, record) => (
        <Space>
          {record.status === 0 && (
            <>
              <Button
                type="default"
                onClick={() => {
                  setSelectedItem(record);
                  setModalVisible(true);
                }}
              >
                详情
              </Button>
              <Button danger onClick={() => handleReview(1, record.latestType || 6, record)}>
                违规
              </Button>
              <Button
                type="primary"
                onClick={() => handleReview(2, record.latestType || 6, record)}
              >
                不违规
              </Button>
            </>
          )}
          {record.status !== 0 && record.reviewer && (
            <UserMsg user={record.reviewer} content={'审核人：'} />
          )}
        </Space>
      ),
    },
  ];
  const detail = () => {
    return (
      <>
        {selectedItem && (
          <div>
            <p>
              最新举报类型：
              {ReportTypeList.find((item) => item.type === selectedItem.latestType)?.name}
            </p>
            <p>内容：{selectedItem.content}</p>
            <p>举报次数：{selectedItem.reportCount}</p>
            <p>首次举报时间：{formatDateByString(selectedItem.firstReportTime)}</p>
            <p>最新举报时间：{formatDateByString(selectedItem.latestReportTime)}</p>
            <p>
              确认举报类型：
              <Select
                placeholder="确认举报类型"
                value={selectedItem.latestType}
                onChange={(value) => {
                  setSelectedItem({
                    ...selectedItem,
                    latestType: value,
                  });
                }}
                options={ReportTypeList.map((item) => {
                  return {
                    value: item.type,
                    label: item.name,
                  };
                })}
              />
            </p>
            <ReportRecords
              thirdId={selectedItem.thirdId || 0}
              thirdType={selectedItem.thirdType || 0}
            />
          </div>
        )}
      </>
    );
  };
  return (
    <div>
      <Form form={form} layout="inline" onFinish={refresh}>
        <Form.Item label="状态" name="status" initialValue={0}>
          <Select style={{ width: 120 }}>
            <Select.Option value={0}>待审核</Select.Option>
            <Select.Option value={1}>已违规</Select.Option>
            <Select.Option value={2}>未违规</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="类型" name="type">
          <Select style={{ width: 120 }} allowClear>
            {Object.entries(REPORT_TYPE_MAP).map(([value, label]) => (
              <Select.Option key={value} value={value}>
                {label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="关键词" name="keyword">
          <Input placeholder="输入关键词" allowClear />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          查询
        </Button>
      </Form>

      <Table
        rowKey="thirdId"
        columns={columns}
        dataSource={data?.list}
        scroll={{ x: 'calc(70vw)', y: 'calc(60vh)' }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: data?.total,
          onChange: pagination.onChange,
          showQuickJumper: true,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        loading={loading}
      />

      <Modal
        title="举报详情"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={1000}
        footer={
          selectedItem?.status === 0 && [
            <Button
              key="reject"
              danger
              onClick={() => handleReview(1, selectedItem?.latestType || 6)}
            >
              标记违规
            </Button>,
            <Button
              key="approve"
              type="primary"
              onClick={() => handleReview(2, selectedItem?.latestType || 6)}
            >
              标记不违规
            </Button>,
          ]
        }
      >
        {detail()}
      </Modal>
    </div>
  );
};

// 举报记录组件
const ReportRecords: React.FC<{ thirdId: number; thirdType: number }> = ({
  thirdId,
  thirdType,
}) => {
  // 使用分页查询
  const { data, loading, pagination, refresh } = usePagination(
    async ({ current, pageSize }) => {
      const res = await queryRecordPage({
        page: current,
        pageSize,
        thirdId,
        thirdType,
      });
      return {
        list: res.records || [],
        total: res.totalRow || 0,
      };
    },
    {
      defaultCurrent: 1,
      defaultPageSize: 20, // 默认每页显示 20 条
    },
  );

  const columns: TableProps<API.ReportRecordResp>['columns'] = [
    {
      title: '举报用户',
      dataIndex: 'reportUser',
      render: (value) => <UserMsg user={value} />,
    },
    {
      title: '举报原因',
      dataIndex: 'reason',
    },
    {
      title: '举报时间',
      dataIndex: 'reportTime',
      render: (value) => formatDateByString(value),
    },
    {
      title: '举报类型',
      dataIndex: 'type',
      render: (value) => ReportTypeList.find((item) => item.type === value)?.name || '-',
    },
    {
      title: '举报详细原因',
      dataIndex: 'detailReason',
      width: 300,
      render: (value) => (
        <div
          style={{
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value || '-'}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Table
        dataSource={data?.list || []}
        columns={columns}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: data?.total,
          onChange: pagination.onChange,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        loading={loading}
        scroll={{ y: 'calc(35vh)' }}
      />
    </div>
  );
};

export default ReviewPage;
