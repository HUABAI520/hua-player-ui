import { SeriesSet } from '@/common/Edit/SeriesSet';
import { OverflowTooltip } from '@/common/OverflowTooltip';
import { pageQuery } from '@/services/api/seriesController';
import { BarsOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Dropdown, Flex, Grid, Input, List, MenuProps, Pagination, Spin } from 'antd';
import React, { useEffect, useState } from 'react';

const { useBreakpoint } = Grid;

const SeriesManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<API.SeriesResp[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [searchName, setSearchName] = useState('');
  const screens = useBreakpoint();
  const [seriesId, setSeriesId] = useState<number>();
  const [openSeries, setOpenSeries] = useState(false);
  // 获取系列数据
  const fetchSeries = async () => {
    setLoading(true);
    try {
      const result = await pageQuery({
        pageNum: currentPage,
        pageSize: pageSize,
        name: searchName,
      });
      setData(result?.records || []);
      setTotal(result?.totalRow || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeries();
  }, [currentPage, pageSize, searchName]);

  // 处理分页变化
  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchName(value);
    setCurrentPage(1);
  };

  // 响应式布局配置
  const gridConfig = {
    gutter: 16,
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 6,
    xxl: screens.xxl ? 6 : 4,
  };

  const items: MenuProps['items'] = [
    {
      label: '修改',
      key: '1',
      onClick: () => {
        setOpenSeries(true);
      },
      icon: <BarsOutlined />,
    },
  ];
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24, display: 'flex', gap: '16px' }}>
        <Input.Search
          placeholder="搜索系列名称"
          allowClear
          enterButton
          onSearch={handleSearch}
          style={{ maxWidth: 400 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSeriesId(undefined);
            setOpenSeries(true);
          }}
        >
          新增系列
        </Button>
      </div>

      <Spin spinning={loading}>
        <List
          grid={gridConfig}
          dataSource={data}
          renderItem={(item) => (
            <Flex
              onContextMenu={() => {
                setSeriesId(item.id);
              }}
            >
              <Dropdown menu={{ items }} trigger={['contextMenu']} key={item.id}>
                <List.Item>
                  <Card
                    hoverable
                    cover={
                      <img
                        alt={item.name}
                        src={item.image}
                        style={{
                          height: '200px',
                          objectFit: 'cover',
                          borderTopLeftRadius: '8px',
                          borderTopRightRadius: '8px',
                        }}
                      />
                    }
                    styles={{ body: { padding: '16px' } }}
                    onClick={() => {
                      setSeriesId(item.id);
                      setOpenSeries(true);
                    }}
                  >
                    <Card.Meta
                      description={
                        <>
                          <OverflowTooltip
                            style={{ fontSize: '16px', fontWeight: 'bold' }}
                            text={`${item?.name}`}
                            maxWidth={800}
                          />
                          <OverflowTooltip text={item.intro} maxWidth={600} />
                        </>
                      }
                    />
                  </Card>
                </List.Item>
              </Dropdown>
            </Flex>
          )}
        />

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            showSizeChanger
            showQuickJumper
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
            showTotal={(total) => `共 ${total} 个系列`}
            align="end"
            pageSizeOptions={['12', '24', '48', '96']}
          />
        </div>
      </Spin>
      <SeriesSet
        msg={
          seriesId
            ? {
                seriesId: seriesId,
              }
            : undefined
        }
        open={openSeries}
        onClose={() => setOpenSeries(false)}
        onFresh={() => {
          fetchSeries();
        }}
      />
    </div>
  );
};

export default SeriesManagement;
