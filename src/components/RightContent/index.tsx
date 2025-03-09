import {
  ClockCircleOutlined,
  QuestionCircleOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import '@umijs/max';
import { useModel } from '@umijs/max';
import { Button, Card, Flex, Image, message, Popover, Typography } from 'antd';
import React, { useState } from 'react';
import { listRecord } from '@/services/api/animeController';
import { locale } from '@/svg/base64/no';
import { PlayingIcon } from '@/common/DefinedIcon';
import { formatSeekTime } from '@/common/utils/timeUtil';
import './RightLess.less';

export type SiderTheme = 'light' | 'dark';
export const SelectLang = () => {
  return (
    // @ts-ignore
    // eslint-disable-next-line react/jsx-no.ts-undef
    <UmiSelectLang
      style={{
        padding: 4,
      }}
    />
  );
};

const pro = process.env.NODE_ENV !== 'production';
type SelectLangProps = {
  value?: number;
  label?: string;
};
export const PlayRecord = () => {
  const [records, setRecords] = useState<API.VideoRecordResp[]>();
  const getRecords = async () => {
    const res = await listRecord({
      current: 1,
      pageSize: 10,
    });
    setRecords(res.records);
  };

  return (
    <Popover
      placement={'left'}
      title={'观看记录'}
      content={
        <Flex
          vertical
          style={{ maxHeight: '480px', overflowY: 'auto' }}
          className={'custom-scrollbar'}
        >
          {records?.map((record, index) => (
            <Card
              hoverable
              key={index}
              styles={{
                body: {
                  padding: '5px',
                  overflow: 'hidden',
                  width: '100%',
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
                window.open('/player?animeId=' + record.animeId);
              }}
            >
              <Flex gap={'10px'} align={'center'}>
                {record.image ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <Image
                      preview={false}
                      alt="avatar"
                      src={record?.image}
                      style={{
                        display: 'block',
                        height: '60px',
                        width: '106.45px',
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
                        height: '60px',
                        width: '106.45px',
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

                <Flex
                  vertical
                  align="start"
                  justify="center"
                  style={{ maxWidth: '200px', width: '100%' }}
                >
                  <Typography.Text
                    style={{
                      margin: 0,
                      fontSize: '14px',
                      color: 'black',
                      fontWeight: 'bold',
                      wordWrap: 'break-word', // 确保文字在达到最大宽度时换行
                      whiteSpace: 'normal', // 防止文字在同一行内强制显示
                    }}
                  >
                    {record.name}
                  </Typography.Text>
                  {/* 循环 animeMsg.videos */}
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
                      时间：{record.updateTime}
                      <Flex style={{ color: '#999' }}>
                        第 {record.rank} 集 {record.title}
                      </Flex>
                    </Typography.Text>
                  </Flex>
                </Flex>
              </Flex>
            </Card>
          ))}
          <Button onClick={() => window.open('/record', '_blank')}>查看全部</Button>
        </Flex>
      }
      overlayClassName="custom-popover"
      onOpenChange={async (visible) => {
        if (visible) {
          const res = await getRecords();
          return;
        }
      }}
    >
      <Flex
        vertical
        style={{ height: '100%' }}
        align={'center'}
        gap={'3px'}
        className="collection-container"
        onClick={() => window.open('/record', '_blank')}
      >
        <ClockCircleOutlined className="star-hover" />
        <span style={{ fontSize: 13, lineHeight: '13px', fontWeight: 'bold' }}>历史</span>
      </Flex>
    </Popover>
  );
};
const Collection = () => {
  return (
    <Flex
      vertical
      style={{ height: '100%' }}
      align={'center'}
      gap={'3px'}
      className="collection-container"
      onClick={() => window.open('/collection', '_blank')}
    >
      <StarOutlined className="star-hover" />
      <span style={{ fontSize: 13, lineHeight: '13px', fontWeight: 'bold' }}>收藏</span>
    </Flex>
  );
};
export const Question = () => {
  // 读取  routes配置 查看是否layout 为false 没有则是默认值true
  // const route = useRouteProps();
  // if (!route.meta?.layout) {
  //   route.meta = {
  //     ...route.meta,
  //     layout: true,
  //   };
  // }
  //
  // const layout = route.meta?.layout;
  // alert(layout);

  return (
    <Flex
      gap={'large'}
      className={'ant-pro-global-header-header-actions-hover'}
      style={{ fontSize: 20 }}
    >
      <Collection />
      <PlayRecord />
    </Flex>
  );
};
