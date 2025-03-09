import React, { useCallback, useEffect, useState } from 'react';
import { deleteRecordAll, deleteRecordById, listRecord } from '@/services/api/animeController';
import {
  Button,
  Card,
  Flex,
  FloatButton,
  Image,
  Input,
  message,
  Modal,
  Spin,
  Timeline,
  Typography,
} from 'antd';
import { ClockCircleOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { formatSeekTime } from '@/common/utils/timeUtil';
import { locale } from '@/svg/base64/no';
import _ from 'lodash';
import { calculateTimeDifference } from '@/common/utils/DateUtils';

const Record: React.FC = () => {
  const [records, setRecords] = useState<API.VideoRecordResp[]>([]);
  const [query, setQuery] = useState<API.RecordRequest>({
    current: 1,
    pageSize: 10,
  });
  const [totalPage, setTotalPage] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // 节流处理 scroll 事件
  const handleScroll = useCallback(
    _.throttle(() => {
      if (loading || (totalPage && totalPage <= (query?.current || 1))) return;

      // 检测是否滚动到底部
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 5) {
        setQuery((prevQuery) => ({
          ...prevQuery,
          current: (prevQuery.current || 1) + 1,
        }));
      }
    }, 300),
    [loading, totalPage, query],
  );

  const getRecords = async () => {
    setLoading(true);
    let q = { ...query };

    if (inputValue && inputValue !== '') {
      q = {
        ...q,
        current: 1,
        key: inputValue,
      };
    }

    const res = await listRecord(q);
    if (res) {
      const newRecords =
        (q.current || 1) > 1 ? [...records, ...(res.records || [])] : res.records || [];
      setRecords(newRecords);
      setTotalPage(res.totalPage || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    getRecords();
  }, [query]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const highlightKeyword = (text: string, keyword: string, color = 'red') => {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} style={{ color }}>
          {part}
        </span>
      ) : (
        <span key={index}>{part}</span>
      ),
    );
  };

  const items = records.map((record) => ({
    label: <div>{calculateTimeDifference(record.updateTime)}</div>,
    children: (
      <Card
        hoverable
        styles={{
          body: {
            padding: '5px',
            overflow: 'hidden',
          },
        }}
        style={{
          marginBottom: '6px',
          backgroundColor: 'transparent',
          border: 'none',
          marginRight: '5px',
          marginLeft: '5px',
        }}
        onClick={() => {
          window.open('/player?animeId=' + record?.animeId);
        }}
      >
        <Flex gap={'10px'} align={'center'} style={{ width: '100%' }}>
          {record.image ? (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Image
                preview={false}
                alt="avatar"
                src={record?.image}
                style={{
                  display: 'block',
                  height: '90px',
                  width: '160px',
                  borderRadius: '4px',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '5px',
                  bottom: '5px',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)', // 半透明背景以确保文字可读
                  color: 'white',
                  padding: '2px 4px',
                  borderRadius: '3px',
                  fontSize: '12px',
                }}
              >
                {formatSeekTime(record?.seek || 0)}/{formatSeekTime(record?.duration || 0)}
              </span>
            </div>
          ) : (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Image
                preview={false}
                style={{
                  display: 'block',
                  // height: '60px',
                  // width: '106.45px',
                  height: '90px',
                  width: '160px',
                  borderRadius: '4px',
                }}
                src="error"
                fallback={locale}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '5px',
                  bottom: '5px',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)', // 半透明背景以确保文字可读
                  color: 'white',
                  padding: '2px 4px',
                  borderRadius: '3px',
                  fontSize: '12px',
                }}
              >
                {formatSeekTime(record?.seek || 0)}
              </span>
            </div>
          )}

          {/*<Flex vertical align="start" justify="center" style={{ width: '819px' }}>*/}
          <Flex style={{ width: '100%' }} justify={'space-between'} align={'center'}>
            <Flex vertical align="start" justify="space-between">
              <Typography.Text
                style={{
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: 'bold',
                  wordWrap: 'break-word', // 确保文字在达到最大宽度时换行
                  whiteSpace: 'normal', // 防止文字在同一行内强制显示
                }}
              >
                {highlightKeyword(record.name || '', query.key || '')}
              </Typography.Text>

              <Flex align="start" justify="space-between" style={{ width: '100%' }}>
                <Typography.Text
                  style={{
                    fontSize: '12px',
                    color: '#999',
                    marginBottom: '8px',
                    wordWrap: 'break-word', // 同样添加换行处理
                    whiteSpace: 'normal', // 防止同一行内强制显示
                  }}
                >
                  <Flex style={{ color: '#999' }}>
                    时间：{calculateTimeDifference(record.updateTime)}
                  </Flex>
                  <Flex style={{ color: '#999' }}>
                    第 {record.rank} 集 {record.title}
                  </Flex>
                </Typography.Text>
              </Flex>
            </Flex>
            <Button
              size={'small'}
              type={'text'}
              icon={<DeleteOutlined />}
              style={{ padding: 0, margin: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                Modal.confirm({
                  title: '确定删除该记录吗？',
                  content: '删除后无法恢复',
                  okText: '确定',
                  cancelText: '取消',
                  onOk: async () => {
                    if (record.id) {
                      const recordId = record.id;
                      const res = await deleteRecordById({ recordId: recordId });
                      if (res) {
                        // 删除对应项
                        const index = records.findIndex((record) => record.id === recordId);
                        records.splice(index, 1);
                        setRecords([...records]);
                      }
                    }
                  },
                });
              }}
            />
          </Flex>
        </Flex>
      </Card>
    ),
  }));

  return (
    <div style={{ width: '100%', transition: 'all 1s ease-in-out' }}>
      <Flex vertical style={{ width: '1160px', margin: '0 auto' }} align={'center'}>
        <Flex style={{ width: '100%' }} align={'center'} justify={'space-between'}>
          <Flex align={'end'}>
            <ClockCircleOutlined style={{ fontSize: '28px', color: '#dd936c', marginRight: 16 }} />
            <Typography.Title level={3} style={{ margin: 0 }}>
              历史记录
            </Typography.Title>
          </Flex>
          <Flex align={'center'}>
            <Input
              placeholder="搜索历史记录"
              size={'small'}
              onChange={(event) => setInputValue(event.target.value)}
              style={{ marginRight: '20px' }}
              value={inputValue}
              prefix={
                <Button
                  type={'text'}
                  icon={<SearchOutlined />}
                  onClick={getRecords}
                  onMouseEnter={() => setIsFocused(true)}
                  onMouseLeave={() => setIsFocused(false)}
                  style={{ color: isFocused ? '#1890ff' : 'inherit' }}
                />
              }
              onPressEnter={() => {
                setQuery({
                  ...query,
                  key: inputValue,
                  current: 1,
                });
              }}
            />
            <Button
              onClick={async () => {
                Modal.confirm({
                  title: '确定清空记录吗？',
                  content: '删除后无法恢复',
                  okText: '确定',
                  cancelText: '取消',
                  onOk: async () => {
                    const res = await deleteRecordAll();
                    if (res) {
                      message.success('清空成功');
                      await getRecords();
                    }
                  },
                });
              }}
            >
              清空记录
            </Button>
          </Flex>
        </Flex>
        <Flex vertical style={{ marginTop: '20px', width: '100%' }}>
          <Timeline mode={'alternate'} items={items} />
          {loading && <Spin style={{ display: 'block', marginTop: '16px', textAlign: 'center' }} />}
        </Flex>
      </Flex>
      <FloatButton.BackTop />
    </div>
  );
};
export default Record;
