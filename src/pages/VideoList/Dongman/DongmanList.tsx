import { MaCard } from '@/common/card/MaCard';
import ThreeDCard from '@/common/card/ThreeDCard';
import { DetailEditIcon, PictureEditIcon, ThreeDIcon, TwoDIcon } from '@/common/DefinedIcon';
import { AnimeAdOrUp } from '@/common/Edit/AnimeAdOrUp';
import { SeriesSet } from '@/common/Edit/SeriesSet';
import { FEN_DISPLAY } from '@/common/GlobalKey';
import { getLocal, setLocal } from '@/common/utils/LocalUtils';
import { AvatarView } from '@/pages/User/Settings/components/base';
import ButtonSelector from '@/pages/VideoList/Dongman/components/ButtonSelector';
import RangeSelector from '@/pages/VideoList/Dongman/components/RangeSelector';
import { getAnimeById, queryAnime } from '@/services/api/animeController';
import { getTypeAll } from '@/services/api/typeController';
import { useModel } from '@@/exports';
import {
  BarsOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  SearchOutlined,
  SettingOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  UpOutlined,
} from '@ant-design/icons';
import {
  Button,
  Dropdown,
  Empty,
  Flex,
  FloatButton,
  Input,
  MenuProps,
  Modal,
  Pagination,
  Radio,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';

const { useToken } = theme;
const DongmanList: React.FC = () => {
  const { token } = useToken();
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const [query, setQuery] = useState<API.AnimeQueryReq>({
    pageSize: 20,
    current: 1,
    sortOrder: 'DESC',
    sortField: 'score',
  });
  const [animeList, setAnimeList] = useState<API.AnimeIndexResp[]>();
  const [types, setTypes] = useState<API.HuaType[]>();
  const [total, setTotal] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [is3D, setIs3D] = useState<{
    is: boolean;
    type: boolean;
  }>(getLocal('is3D:' + currentUser?.id, { is: false, type: false }));
  const [fenshuDisplay, setFenshu] = useState<boolean>(
    getLocal(FEN_DISPLAY + currentUser?.id, true),
  );

  const getAnimePage = async () => {
    // 延迟500毫秒
    setLoading(true);
    let q = { ...query };
    if (inputValue && inputValue !== '') {
      q = {
        ...q,
        current: 1,
        name: inputValue,
      };
    }
    const res = await queryAnime(q);
    if (currentUser && currentUser.userRole === 'admin')
      res.records?.push({
        id: -1,
        name: '新增动漫',
        image: 'https://img.51miz.com/Element/00/77/38/01/98e97ce5_E773801_ae28c5fa.png',
        // image: 'http://localhost:9000/hua-picture/dongman/24/24.webp',
      });
    setAnimeList(res?.records && [...res?.records]);
    setTotal(res.totalRow);

    // 整个页面回到最顶部
    window.scrollTo({ top: 0 });
    setTimeout(() => {
      setLoading(false);
    }, 200);
  };
  const getTypes = async () => {
    const res = await getTypeAll();
    setTypes([{ id: undefined, type: undefined }, ...res]);
  };
  useEffect(() => {
    getAnimePage()
      .then()
      .finally(() => {
        if (!types || types.length === 0) getTypes();
      });
  }, [query]);
  const [isFocused, setIsFocused] = useState(false);
  const handleMouseEnter = () => {
    setIsFocused(true);
  };

  const handleMouseLeave = () => {
    setIsFocused(false);
  };
  const handlePaginationChange = (page: number, pageSize?: number) => {
    const updatedDataSource = { ...query, current: page, pageSize: pageSize || 20 };
    setQuery(updatedDataSource); // 当点击分页信息，更新tableListDataSource请求数据值
  };
  const [open, setOpen] = useState(false);
  const [openSeries, setOpenSeries] = useState(false);
  const [imgOpen, setImgOpen] = useState(false);
  // const [focusAnimeId, setFocusAnimeId] = useState<number>();
  const [animeMsg, setAnimeMsg] = useState<API.AnimeIndexResp>();
  const cart = (index: number, anime: API.AnimeIndexResp) => {
    return (
      <div>
        {!is3D.is ? (
          <MaCard
            fd={fenshuDisplay}
            anime={anime}
            onClick={() => {
              if (anime.id === -1) {
                setAnimeMsg(undefined);
                setOpen(true);
                return;
              }
              window.open('/player?animeId=' + anime.id);
            }}
            loading={loading}
            index={index}
          />
        ) : (
          <ThreeDCard
            fd={fenshuDisplay}
            is3D={is3D}
            anime={anime}
            onClick={() => {
              if (anime.id === -1) {
                setAnimeMsg(undefined);
                setOpen(true);
                return;
              }
              window.open('/player?animeId=' + anime.id);
            }}
            index={index}
            loading={loading}
          />
        )}
      </div>
    );
  };
  const [selectedAnimeId, setSelectedAnimeId] = useState<any>();

  const getAnimeData = async () => {
    if (selectedAnimeId === 0) {
      return undefined;
    }
    const res = await getAnimeById({ id: selectedAnimeId });
    if (res) {
      setAnimeMsg(res);
      return 1;
    }
    return undefined;
  };
  const items: MenuProps['items'] = [
    {
      label: '直接编辑',
      key: '1',
      onClick: () => {
        getAnimeData().then(() => {
          setOpen(true);
        });
      },
      icon: <EditOutlined />,
    },
    {
      label: '详细编辑',
      key: '2',
      onClick: () => {
        window.open('/manage?animeId=' + selectedAnimeId, '_blank');
      },
      icon: <DetailEditIcon />,
    },
    {
      type: 'divider',
    },
    {
      label: '修改图片',
      key: '3',
      onClick: () => {
        getAnimeData().then(() => {
          setImgOpen(true);
        });
      },
      icon: <PictureEditIcon />,
    },
    {
      label: '系列设置',
      key: '4',
      onClick: () => {
        // setImgOpen(true);
        // getAnimeData();
        getAnimeData().then((r) => {
          if (r) setOpenSeries(true);
        });
        // todo 打开系列设置
      },
      icon: <BarsOutlined />,
    },
    {
      type: 'divider',
    },
    {
      label: '删除动漫',
      key: '5',
      icon: <DeleteOutlined />,
      onClick: () => {
        alert('todo');
      },
    },
  ];

  const content = () => {
    if (!animeList || animeList.length === 0) {
      return <Empty style={{ marginTop: '100px' }} />;
    }

    return (
      <div className="anime-grid">
        {animeList.map((anime, index) => (
          <div key={anime.id || index} className="anime-item">
            {anime.id ? (
              currentUser && currentUser.userRole === 'admin' && anime.id !== -1 ? (
                <Flex
                  onContextMenu={() => {
                    setSelectedAnimeId(anime.id);
                  }}
                >
                  <Dropdown menu={{ items }} trigger={['contextMenu']} key={anime.id}>
                    {cart(index, anime)}
                  </Dropdown>
                </Flex>
              ) : (
                cart(index, anime)
              )
            ) : (
              <div style={{ width: '170px', marginRight: '5px', marginLeft: '5px' }}></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const toggleSortOrder = () => {
    if (query.sortOrder === 'ASC') {
      setQuery({ ...query, current: 1, sortOrder: 'DESC' });
    } else if (query.sortOrder === 'DESC') {
      setQuery({ ...query, current: 1, sortOrder: 'ASC' });
    } else {
      setQuery({ ...query, current: 1, sortOrder: 'DESC' });
    }
  };

  const options = [
    { label: '全部', value: undefined },
    { label: 'TV', value: 1 },
    { label: '剧场版', value: 0 },
  ];
  const isNewOptions = [
    { label: '全部', value: undefined },
    { label: '新番', value: 1 },
    { label: '完结', value: 0 },
  ];
  const isJiduOptions = [
    { label: '全部', value: undefined },
    { label: '1月', value: 1 },
    { label: '4月', value: 4 },
    { label: '7月', value: 7 },
    { label: '10月', value: 10 },
  ];
  const languageOptions = [
    { label: '全部', value: undefined },
    { label: '普通话', value: '普通话' },
    { label: '英语', value: '英语' },
    { label: '日语', value: '日语' },
    { label: '四川话', value: '四川话' },
    { label: '港语', value: '港语' },
    { label: '粤语', value: '粤语' },
  ];

  return (
    <>
      <div
        className="dongman-list-container"
        style={{
          display: 'flex',
          width: '100%', // 确保容器宽度不超过视口宽度
          overflow: 'hidden', // 隐藏溢出的内容
        }}
      >
        <div className="content-section">
          <Flex justify={'center'} style={{ width: '100%' }} align={'center'}>
            <Radio.Group
              value={query.sortField}
              onChange={(e) => setQuery({ ...query, current: 1, sortField: e.target.value })}
            >
              <Radio value={'score'}>评分</Radio>
              <Radio value={'issue_time'}>时间</Radio>
            </Radio.Group>
            <Tooltip title={query.sortOrder === 'ASC' ? '点击降序' : '点击升序'}>
              <Button
                onClick={toggleSortOrder}
                icon={
                  query.sortOrder === 'ASC' ? (
                    <SortAscendingOutlined />
                  ) : query.sortOrder === 'DESC' ? (
                    <SortDescendingOutlined />
                  ) : null
                }
              />
            </Tooltip>

            <Input
              placeholder="开启动漫幻想"
              size={'middle'}
              onChange={(event) => {
                setInputValue(event.target.value);
              }}
              value={inputValue}
              suffix={
                <Button
                  type={'text'}
                  icon={<SearchOutlined style={{ color: token.colorPrimary }} />}
                  onClick={async () => {
                    await getAnimePage();
                  }}
                  style={{
                    color: isFocused ? '#1890ff' : 'inherit',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                />
              }
              style={{ width: '50%', marginLeft: '16px' }}
              onPressEnter={() => {
                setQuery({
                  ...query,
                  name: inputValue,
                  current: 1,
                });
              }}
            />
          </Flex>
          {content()}
          {animeList && animeList.length > 0 && (
            <Pagination
              total={total}
              showTotal={(total, range) => `${range[0]}-${range[1]} 共 ${total} 条`}
              pageSize={query.pageSize}
              current={query.current}
              onChange={handlePaginationChange}
              onShowSizeChange={handlePaginationChange}
              showSizeChanger
              showQuickJumper
              align="end"
              style={{ marginRight: '5px' }}
              pageSizeOptions={['5', '10', '20', '30', '40', '50']}
            />
          )}
        </div>
        <div
          className="filter-section"
          style={{
            willChange: 'transform, opacity',
            transform: `translateX(${types && types.length ? '0' : '100%'})`,
            opacity: types && types.length > 0 ? 1 : 0,
            transition: 'all 1s ease-in-out',
          }}
        >
          <Typography.Title level={4}>筛选</Typography.Title>
          <ButtonSelector
            label={'类型'}
            options={options}
            value={query.type}
            onChange={(value) => setQuery({ ...query, current: 1, type: value.target.value })}
          />
          <ButtonSelector
            label={'语言'}
            options={languageOptions}
            value={query.language}
            onChange={(value) => setQuery({ ...query, current: 1, language: value.target.value })}
          />
          <ButtonSelector
            label={'状态'}
            options={isNewOptions}
            value={query.isNew}
            onChange={(value) => setQuery({ ...query, current: 1, isNew: value.target.value })}
          />
          <ButtonSelector
            label={'季度'}
            options={isJiduOptions}
            value={query.month}
            onChange={(value) => setQuery({ ...query, current: 1, month: value.target.value })}
          />
          <RangeSelector
            label={'年份'}
            onChange={(v) => {
              // 去到两个时间 并序列化 为 YYYY-MM-DD 格式
              setQuery({
                ...query,
                current: 1,
                startTime: v?.[0]?.format('YYYY-MM-DD'),
                endTime: v?.[1]?.format('YYYY-MM-DD'),
              });
            }}
          />
          <ButtonSelector
            style={{
              opacity: types && types.length > 0 ? 1 : 0,
              transition: 'all 0.5s ease-in-out',
            }}
            label={'风格'}
            options={
              types?.map((item) => {
                return { label: item.type ?? '全部', value: item.type };
              }) || []
            }
            value={query.kind}
            onChange={(value) => {
              setQuery({ ...query, current: 1, kind: value.target.value });
            }}
          />
        </div>
      </div>
      <Modal
        title={animeMsg ? '修改动漫' : '新增动漫'}
        width={600}
        onCancel={() => setOpen(false)}
        open={open}
        style={{ padding: '16px' }}
        footer={null}
        destroyOnClose
      >
        <AnimeAdOrUp
          open={open}
          cancelDo={() => setOpen(false)}
          reload={getAnimePage}
          animeMsg={animeMsg}
          reloadKinds={(values) => {
            setTypes(values);
          }}
        />
      </Modal>
      <Modal
        title={'更新图片'}
        width={600}
        onCancel={() => setImgOpen(false)}
        cancelText={'完成'}
        open={imgOpen}
        style={{ padding: '16px' }}
        footer={null}
        destroyOnClose
      >
        <AvatarView
          avatar={animeMsg?.image}
          animeId={animeMsg?.id}
          reload={getAnimePage}
          onCancel={() => setImgOpen(false)}
        />
      </Modal>
      <SeriesSet msg={animeMsg} open={openSeries} onClose={() => setOpenSeries(false)} />
      <FloatButton.Group shape="circle" style={{ insetInlineEnd: 60 }}>
        <FloatButton.Group
          trigger="click"
          style={{ insetInlineEnd: 60 }}
          tooltip={<div>点击设置卡片</div>}
          icon={<SettingOutlined />}
        >
          {is3D.is && (
            <FloatButton
              icon={is3D.type ? <DownOutlined /> : <UpOutlined />}
              tooltip={is3D.type ? '向下' : '向上'}
              onClick={() => {
                setLocal('is3D:' + currentUser?.id, { ...is3D, type: !is3D.type });
                setIs3D({
                  is: is3D.is,
                  type: !is3D.type,
                });
              }}
            />
          )}
          <FloatButton
            icon={is3D.is ? <TwoDIcon /> : <ThreeDIcon />}
            tooltip={is3D.is ? '切换2d' : '切换3d'}
            onClick={() => {
              setLocal('is3D:' + currentUser?.id, { ...is3D, is: !is3D.is });
              setIs3D({
                is: !is3D.is,
                type: is3D.type,
              });
            }}
          />
          <FloatButton
            icon={fenshuDisplay ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            tooltip={fenshuDisplay ? '不展示分数' : '展示分数'}
            onClick={() => {
              setLocal(FEN_DISPLAY + currentUser?.id, !fenshuDisplay);
              setFenshu(!fenshuDisplay);
            }}
          />
        </FloatButton.Group>
        <FloatButton.BackTop />
      </FloatButton.Group>
    </>
  );
};
export default DongmanList;
