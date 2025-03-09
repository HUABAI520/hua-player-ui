import ThreeDCard from '@/common/card/ThreeDCard';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, Flex, Input, List, message, Modal, Spin, theme } from 'antd';

export const Check = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <svg
    style={style}
    className={className}
    viewBox="64 64 896 896"
    focusable="false"
    data-icon="check"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 00-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"></path>
  </svg>
);
export const CheckColor = () => (
  <span role="img" aria-label="check" className="anticon anticon-check">
    <svg
      viewBox="64 64 896 896"
      focusable="false"
      data-icon="check"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 00-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"></path>
    </svg>
  </span>
);

interface CardData {
  title: string;
  image: string;
}

const cardData: CardData[] = [
  {
    title: '卡片 1',
    image: 'https://picsum.photos/200/300?random=1',
  },
  {
    title: '卡片 2',
    image: 'https://picsum.photos/200/300?random=2',
  },
  {
    title: '卡片 3',
    image: 'https://picsum.photos/200/300?random=3',
  },
  {
    title: '卡片 4',
    image: 'https://picsum.photos/200/300?random=4',
  },
  // 可以继续添加更多卡片
];

interface Card3DProps {
  position: [number, number, number];
  texture: CardData;
}

import './Testcss.less';
import { detail, scrape } from '@/services/api/paController';
import Countdown from '@/common/utils/Countdown';
import { AnimeAdOrUp } from '@/common/Edit/AnimeAdOrUp';
import { getAnimeById } from '@/services/api/animeController';

// const Test = () => {
//   const [counts, setCounts] = useState(5);
//   const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
//   const colors = [
//     'red',
//     'blue',
//     'green',
//     'yellow',
//     'purple',
//     'orange',
//     'pink',
//     'brown',
//     'teal',
//     'violet',
//   ];
//   const ob = new IntersectionObserver((entries) => {
//     entries.forEach((entry) => {
//       if (entry.isIntersecting) {
//         const index = itemRefs.current.findIndex((el) => el === entry.target);
//         if (index !== -1) {
//           const animation = entry.target.animate(
//             [
//               { transform: 'translateY(100px)', opacity: 0 },
//               { transform: 'translateY(0)', opacity: 1 },
//             ],
//             {
//               duration: 500,
//               easing: 'ease-in-out',
//
//               fill: 'forwards',
//             },
//           );
//           animation.play();
//           ob.unobserve(entry.target);
//         }
//       }
//     });
//   });
//   // useEffect(() => {
//   //   itemRefs.current.forEach((item) => {
//   //     if (item) {
//   //       ob.observe(item);
//   //     }
//   //   });
//   // }, []);
//   useEffect(() => {
//     console.log(itemRefs.current);
//     itemRefs.current.forEach((item) => {
//       if (item) {
//         ob.observe(item);
//       }
//     });
//   }, [counts]);
//   return (
//     <>
//       <Button onClick={() => setCounts(counts + 1)}>+1</Button>
//       <div className="elements-container">
//         {/*  循环生counts 个 div*/}
//         {Array.from({ length: counts }).map((_, index) => (
//           <div
//             ref={(el) => (itemRefs.current[index] = el)}
//             className="item"
//             key={index}
//             v-slide-in
//             style={{ backgroundColor: colors[index % colors.length] }}
//           >
//             {index + 1}
//           </div>
//         ))}
//       </div>
//     </>
//   );
// };
const { useToken } = theme;
const Test = () => {
  const { token } = useToken();
  const [searchName, setSearchName] = useState('');
  const [daiName, setDaiName] = useState('');
  const [searchList, setSearchList] = useState<string[]>([]);
  const [msgs, setMsgs] = useState<API.Scrape[]>([]);
  // 搜索时的loading
  const [loading, setLoading] = useState(false);
  const q = useRef('');
  const [open, setOpen] = useState(false);
  const [animeMsg, setAnimeMsg] = useState<API.AnimeIndexResp>();

  const getAnimeData = async (selectedAnimeId: number) => {
    if (selectedAnimeId === 0) {
      return;
    }
    const res = await getAnimeById({ id: selectedAnimeId });
    if (res) {
      setAnimeMsg(res);
    }
  };
  const getMsg = () => {
    if (loading) return;
    setLoading(true);
    scrape({ q: q.current })
      .then((r) => {
        // 先判断是否存在
        if (msgs.some((m) => m.url === r.url)) {
          message.error('已存在');
          return;
        }
        setMsgs([
          {
            ...r,
            competeStatus: 0,
          },
          ...msgs,
        ]);
        setSearchName('');
        q.current = '';
      })
      .finally(() => setLoading(false));
  };
  const caiji = (msg: API.Scrape) => {
    if (msg.competeStatus === 0) {
      msg.competeStatus = 1;
      setMsgs([...msgs]);
      detail({
        q: msg.url,
      }).then((r) => {
        if (r.res.code === 0) {
          message.success(msg.name + '信息添加成功');
          // setMsgs(
          //   msgs.map((m) => {
          //     if (m.url === msg.url) {
          //       return {
          //         ...m,
          //         competeStatus: 2,
          //       };
          //     } else return m;
          //   }),
          // );
          msg.id = r.res.data;
          msg.competeStatus = 2;
        } else {
          msg.competeStatus = 0;
        }
        setMsgs([...msgs]);
      });
    } else if (msg.competeStatus === 2)
      getAnimeData(msg.id).then(() => {
        setOpen(true);
      });
  };
  const addList = () => {
    const name = daiName.trim();
    if (name == '') {
      return;
    }

    let list = name.split('/');
    // 将已存在的名字过滤掉
    list = list.filter((l) => !searchList.some((s) => s === l));
    // 添加到 setSearchList 后面
    setSearchList([...searchList, ...list.map((name) => name.trim())]);
    setDaiName('');
  };
  useEffect(() => {
    if (searchList.length > 0 && !loading) {
      setLoading(true);
      // 取出第一个且删掉
      const name = searchList.shift();
      if (name) {
        q.current = name.trim();
        getMsg();
        setSearchList([...searchList]);
      }
    }
  }, [searchList, loading]);

  return (
    <>
      <h1>爬虫测试页面</h1>
      <Flex style={{ width: '100%' }} gap={'8px'} wrap={'wrap'}>
        {searchList.length > 0 &&
          searchList.map((s, i) => (
            <div
              onClick={() => {
                const newList = searchList.filter((_, index) => index !== i);
                setSearchList(newList);
              }}
              style={{
                borderRadius: '8px',
                backgroundColor: '#f5f5f5',
                padding: '8px',
                margin: '8px',
                textAlign: 'center',
                cursor: 'pointer',
                color: token.colorPrimaryText,
                fontSize: '15px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0, 0, 0)',
              }}
            >
              {s}
            </div>
          ))}
      </Flex>
      <Input
        value={daiName}
        onChange={(e) => {
          setDaiName(e.target.value);
        }}
        suffix={
          <Button
            onClick={() => {
              addList();
            }}
          >
            添加
          </Button>
        }
        placeholder={'添加待添加番剧 可使用/分隔输入多个'}
        onPressEnter={() => {
          addList();
        }}
      ></Input>
      <p>搜索</p>
      {loading ? (
        <Spin size="small" />
      ) : (
        <Input
          type="text"
          placeholder="请输入搜索内容"
          value={searchName}
          onChange={(e) => {
            setSearchName(e.target.value);
            q.current = e.target.value;
          }}
          onPressEnter={(e) => {
            // 去除前后空格
            q.current = q.current.trim();
            if (!q.current || q.current === '') return;
            setSearchName(q.current);
            // getMsg();
            window.open('https://www.douban.com/search?q=' + q.current, '_blank');
          }}
        />
      )}
      {/*自动换行*/}
      {msgs && (
        <Flex gap={'12px'} style={{ marginTop: '16px' }} wrap={'wrap'}>
          {msgs.map((msg, index) => (
            <Flex vertical style={{ width: '200px' }}>
              <Flex style={{ width: '100%' }} justify={'space-between'} align={'center'}>
                {/* 这个 需要适应图片的高度 一样*/}
                <img
                  src={`data:image/jpeg;base64,${msg.img}`}
                  alt={msg.name}
                  width={96}
                  height={135.2}
                />
                <Flex vertical style={{ height: 135.2 }} justify={'space-between'} align={'center'}>
                  <span style={{ fontWeight: 'bold', fontSize: 'large' }}>{msg.name}</span>
                  <Flex style={{ width: '100%' }}>
                    <Button
                      loading={msg.competeStatus === 1}
                      onClick={() => {
                        msg.isAll = '不同';
                        setMsgs([...msgs]);
                        caiji(msg);
                      }}
                    >
                      {msg.competeStatus === 0
                        ? '采取信息'
                        : msg.competeStatus === 1
                        ? '采取中'
                        : '修改信息'}{' '}
                      {msg.isAll === '一样' && (
                        <Countdown
                          s={10}
                          onEnd={() => {
                            msg.isAll = '不同';
                            setMsgs([...msgs]);
                            caiji(msg);
                          }}
                          onClick={() => {
                            msg.isAll = '不同';
                            setMsgs([...msgs]);
                          }}
                        />
                      )}
                    </Button>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          ))}
        </Flex>
      )}
      <Modal
        title={'修改动漫'}
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
          reload={() => {}}
          animeMsg={animeMsg}
        />
      </Modal>
      {/*{searchName !== '' && (*/}
      {/*  <iframe*/}
      {/*    src={'https://www.douban.com/search?q=' + searchName}*/}
      {/*    frameBorder="0"*/}
      {/*    width="100%"*/}
      {/*    height="500px"*/}
      {/*  ></iframe>*/}
      {/*)}*/}

      {/*<p>详细</p>*/}
      {/*<iframe*/}
      {/*  src="https://movie.douban.com/subject/35722670/"*/}
      {/*  frameBorder="0"*/}
      {/*  width="100%"*/}
      {/*  height="500px"*/}
      {/*></iframe>*/}
    </>
  );
};
export default Test;
