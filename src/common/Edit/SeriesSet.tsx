import UpInDisplay from '@/common/display/UpInDisplay';
import { SeriesCard } from '@/common/Edit/SeriesCard';
import { BLine } from '@/common/line/BLine';
import { fetch } from '@/common/utils/DelayUtil';
import { getAnimeById, list } from '@/services/api/animeController';
import {
  addAnime,
  addSeries,
  deleteAnime,
  getOne,
  listQuery,
  updateAnime,
  updateSeries,
} from '@/services/api/seriesController';
import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Select,
  SelectProps,
  Spin,
  Switch,
  theme,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React, { useEffect, useState } from 'react';

interface SeriesSetProps {
  msg: API.AnimeIndexResp | undefined;
  open: boolean;
  onClose: () => void;
  onFresh?: () => void;
}

const { useToken } = theme;
export const SeriesSet: React.FC<SeriesSetProps> = ({ msg, open, onClose, onFresh }) => {
  const { token } = useToken();
  const [series, setSeries] = useState<API.SeriesResp>();
  const [searchVisible, setSearchVisible] = useState(false);
  const [selectedAnimes, setSelectedAnimes] = useState<API.AnimeIndexResp[]>([]);
  const [data, setData] = useState<SelectProps['options']>([]);
  const [check, setCheck] = useState(false);
  const [selectId, setSelectId] = useState<number | undefined>();
  useEffect(() => {
    if (!open) {
      setCheck(false);
      setSeries(undefined);
      setSelectId(undefined);
    }
    if (!msg || !open) return;
    if (msg.id) {
      setSelectId(msg.id);
    }
    if (msg.seriesId) {
      getOne({
        seriesId: msg.seriesId,
      }).then((res) => {
        setSeries(res);
      });
    } else {
      setSeries({ animeList: [msg] });
    }
  }, [msg?.id, open]);
  const [loading, setLoading] = useState<{
    add: boolean;
    fetching: boolean;
  }>({
    add: false,
    fetching: false,
  });

  // false 表示新增，ture 表示选择已有的系列

  const handleSearch = (newValue: string) => {
    setLoading((prev) => {
      return { ...prev, fetching: true };
    });
    fetch(newValue, setData, listQuery);
    setLoading((prev) => {
      return { ...prev, fetching: false };
    });
  };
  const handleChange = (seriesId: any) => {
    if (!seriesId) return;
    getOne({
      seriesId: Number(seriesId),
    }).then((res) => {
      // 获得还没添加系列的动漫(这里是之前为了保留该动漫的不消失 因为之前设为了undefined 所以会过滤出来)
      const animeList = series?.animeList?.filter((anime) => !anime.seriesId);
      setSeries({ ...res, animeList: [...(res.animeList || []), ...(animeList || [])] });
    });
  };
  const getSeriesPlay = () => {
    if (series?.id) {
      return (
        <Flex
          vertical
          style={{
            width: '100%',
          }}
        >
          <Flex
            onDoubleClick={() => {
              const animeList = series?.animeList?.filter((anime) => !anime.seriesId);
              setSeries({ animeList: animeList });
              setCheck(true);
            }}
          >
            <UpInDisplay
              label={'系列名称：'}
              value={series?.name}
              onChange={(v) => {
                if (v === '') {
                  message.error('系列名称不能为空~');
                  return;
                }
                if (v === series?.name) return;
                updateSeries({
                  id: series?.id!,
                  name: v,
                }).then((res) => {
                  if (res) {
                    message.success('修改成功');
                    setSeries({ ...series, name: v });
                    onFresh?.();
                  } else {
                    message.error('修改失败');
                  }
                });
              }}
            />
          </Flex>
          <UpInDisplay
            label={'介绍：'}
            value={series.intro}
            onChange={(v) => {
              if (v === series?.intro) return;
              updateSeries({
                id: series?.id!,
                name: series?.name!,
                intro: v,
              }).then((res) => {
                if (res) {
                  message.success('修改成功');
                  setSeries({ ...series, intro: v });
                  onFresh?.();
                } else {
                  message.error('修改失败');
                }
              });
            }}
            rows={5}
          />
        </Flex>
      );
    } else {
      return (
        <Flex vertical style={{ width: '100%' }} gap={'small'}>
          <Flex justify={'center'}>
            <Switch
              checkedChildren="选择"
              unCheckedChildren="新增"
              checked={check}
              onClick={setCheck}
            />
          </Flex>
          <Flex style={{ width: '100%' }} justify={'start'}>
            {check ? (
              <Flex style={{ width: '100%' }}>
                <Select
                  placeholder={'请输入需要选择的系列名称进行搜索'}
                  showSearch
                  value={series?.name}
                  size={'large'}
                  style={{
                    width: '100%',
                    fontWeight: 'bold',
                    fontSize: 24,
                    padding: '0 5px 0 0',
                  }}
                  defaultActiveFirstOption={false}
                  filterOption={false}
                  onSearch={handleSearch}
                  onChange={handleChange}
                  notFoundContent={loading.fetching ? <Spin size="small" /> : null}
                  options={(data || []).map((d) => ({
                    value: d.value,
                    label: d.text,
                  }))}
                />
              </Flex>
            ) : (
              <Form
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
                style={{ width: '100%' }}
                onFinish={(v) => {
                  if (loading.add || series?.id) return;
                  setLoading((prev) => {
                    return { ...prev, add: true };
                  });
                  addSeries({ name: v.name, intro: v.intro })
                    .then((id) => {
                      setSeries({
                        ...series,
                        id: id,
                        name: v.name,
                        intro: v.intro,
                      });
                    })
                    .finally(() =>
                      setLoading((prev) => {
                        return { ...prev, add: false };
                      }),
                    );
                }}
              >
                <Form.Item
                  name="name"
                  label="系列名称"
                  rules={[{ required: true, message: '请输入名称' }]}
                >
                  <Input placeholder="请输入系列名称" style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="intro" label="系列介绍">
                  <TextArea
                    placeholder="请输入系列介绍"
                    style={{ width: '100%' }}
                    autoSize={{ minRows: 2, maxRows: 4 }}
                  />
                </Form.Item>
                <Flex justify={'end'}>
                  <Button htmlType="submit">新增</Button>
                </Flex>
              </Form>
            )}
          </Flex>
        </Flex>
      );
    }
  };

  function tiaojian(item: API.AnimeIndexResp) {
    if (selectId === undefined) {
      return false;
    }
    return item.id === selectId;
  }

  // 新增 ---------------
  // 添加搜索动漫功能
  const handleAnimeSearch = (newValue: string) => {
    setLoading((prev) => ({ ...prev, fetching: true }));
    fetch(newValue, setData, list);
    setLoading((prev) => ({ ...prev, fetching: false }));
  };
  // 添加动漫到系列
  const handleAddAnimes = async () => {
    if (selectedAnimes === undefined || selectedAnimes.length <= 0) {
      return;
    }
    let ress: API.AnimeIndexResp[] = [];
    for (let i = 0; i < selectedAnimes.length; i++) {
      if (selectedAnimes[i] !== undefined && selectedAnimes[i].id !== undefined) {
        const res = await getAnimeById({ id: selectedAnimes[i].id! });
        // 查询是否series.animeList 已经存在了
        if (res && !series?.animeList?.some((item) => item.id === res.id)) {
          ress.push(res);
        }
      }
    }
    // 添加到待添加系列中，但是可以有重复 过滤一下
    // 添加到待添加系列中

    setSeries((prev) => ({
      ...prev,
      animeList: [...(prev?.animeList || []), ...ress] as API.AnimeIndexResp[],
    }));
    setSearchVisible(false);
    setSelectedAnimes([]);
  };
  const handleSelectChange = (newValue: string | number) => {
    // 确保 newValue 是字符串
    const valueAsString = typeof newValue === 'string' ? newValue : newValue.toString();
    let ids: string[];
    if (valueAsString.includes(',')) {
      ids = valueAsString.split(',');
    } else {
      ids = [valueAsString];
    }
    const newAnimes = ids.map((id) => {
      return {
        id: Number(id),
      } as API.AnimeIndexResp;
    });
    setSelectedAnimes(newAnimes);
  };
  // 在模态框中添加搜索模块
  const renderSearchModal = () => (
    <Modal
      title="添加动漫"
      open={searchVisible}
      onCancel={() => setSearchVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setSearchVisible(false)}>
          取消
        </Button>,
        <Button key="submit" type="primary" loading={loading.fetching} onClick={handleAddAnimes}>
          添加选中项
        </Button>,
      ]}
    >
      <Select
        mode="multiple"
        showSearch
        placeholder="输入动漫名称搜索"
        filterOption={false}
        onSearch={handleAnimeSearch}
        onChange={handleSelectChange}
        style={{ width: '100%' }}
        loading={loading.fetching}
        options={(data || []).map((d) => ({
          value: d.value,
          label: d.text,
        }))}
      />
    </Modal>
  );
  return (
    <Modal
      title={series?.id ? '修改系列' : '新增/选择系列'}
      width={600}
      onCancel={onClose}
      open={open}
      style={{ padding: '16px' }}
      footer={null}
      destroyOnClose
    >
      <Flex vertical style={{ width: '100%' }}>
        <Flex justify="space-between" align="center">
          {getSeriesPlay()}
          {series?.id && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setSearchVisible(true)}>
              添加其他动漫
            </Button>
          )}
        </Flex>
        {renderSearchModal()}
        <BLine />
        <Flex style={{ marginTop: '8px' }}>
          <div
            className="anime-series-grid"
            style={{ width: '100%', maxHeight: '450px', overflow: 'auto' }}
          >
            {series?.animeList?.map((item, index) => (
              <SeriesCard
                seriesId={series?.id}
                anime={item}
                index={index}
                style={{
                  backgroundColor: tiaojian(item) ? token.colorPrimaryBg : '',
                  border: tiaojian(item) ? `2px solid ${token.colorPrimary}` : '0px solid #3b8dfe',
                }}
                onSelect={() => {
                  if (item.id === selectId) {
                    setSelectId(undefined);
                  } else {
                    setSelectId(item.id);
                  }
                }}
                onClick={() => {
                  if (!series?.id) {
                    message.error('请先选择/添加系列');
                    return;
                  }

                  if (item.seriesId && item.seriesId === series.id && item.id) {
                    //移除
                    deleteAnime([item.id]).then((res) => {
                      if (res) {
                        message.success('移除成功');
                        // 需要判断移除是不是编辑的那个动漫
                        if (msg?.id && msg.id === item.id) {
                          item.seriesId = undefined;
                        }
                        // 刷新
                        handleChange(series?.id);
                      }
                    });
                  } else {
                    if (!item.seasonTitle || item.seasonTitle === '') {
                      message.error('展示标题不能为空~');
                      return;
                    }
                    // 添加
                    addAnime({
                      id: series.id,
                      animes: [{ id: item.id, seasonTitle: item.seasonTitle }],
                    }).then((res) => {
                      if (res) {
                        message.success('添加成功');
                        item.seriesId = series.id;
                        // 刷新
                        handleChange(series?.id);
                      }
                    });
                  }
                }}
                onChange={(v) => {
                  if (v === item.seasonTitle) return;
                  if (!v || v === '') {
                    message.error('展示标题不能为空~');
                    return;
                  }
                  // 先判断是否处在已存在的系列下
                  if (!series?.id) {
                    message.error('请先选择/添加系列');
                    return;
                  }
                  // 根据自身的系列id 和 当前系列id 是否一样判断是更新还是添加 添加只操作设置setSeries
                  if (item.seriesId && item.seriesId === series.id && item.id) {
                    // 更新
                    updateAnime({ animeId: item.id, sessionTitle: v }).then((res) => {
                      if (res) {
                        message.success('更新成功');
                        item.seasonTitle = v;
                        setSeries({
                          ...series,
                        });
                      }
                    });
                  } else {
                    item.seasonTitle = v;
                    setSeries({
                      ...series,
                    });
                  }
                }}
              />
            ))}
          </div>
        </Flex>
      </Flex>
    </Modal>
  );
};
