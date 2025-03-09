import React, { useEffect, useRef, useState } from 'react';
import Artplayer from '@/pages/Player/Artplayer';
import { Card, Flex, Image, message, Modal, FloatButton, Rate, Tag, Typography, theme } from 'antd';
import { addOrUp, get, getAnimeById } from '@/services/api/animeController';
import { useLocation } from '@@/exports';
import { useNavigate } from 'umi';
import { LanguageIcon, PlayingIcon } from '@/common/DefinedIcon';
import { ClockCircleOutlined } from '@ant-design/icons';
import InfoDisplay from '@/common/display/InfoDisplay';
import TextArea from 'antd/es/input/TextArea';
import { locale } from '@/svg/base64/no';
import Hls from 'hls.js';
import { formatSeekTime } from '@/common/utils/timeUtil';
import { UserRating } from '@/common/rating/UserRating';
import { Comment } from '@/pages/Player/components/Comment';
import artplayerPluginDanmuku from 'artplayer-plugin-danmuku';
import { addBarrage, getBarrages } from '@/services/api/barrageController';
import { useModel } from '@umijs/max';
import { addCount } from '@/services/api/countsController';
import { TabDisplay } from '@/common/display/TabDisplay';

const { useToken } = theme;
const Player: React.FC = () => {
  const { token } = useToken();
  const { initialState } = useModel('@@initialState');
  const { settings } = initialState || {};
  const artInstance = useRef<Artplayer | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const animeIdP = queryParams.get('animeId');
  const videoIdP = queryParams.get('videoId');
  const [animeId, setAnimeId] = useState(Number(animeIdP));
  const [animeMsg, setAnimeMsg] = useState<API.AnimeIndexResp>();
  const [fileVideo, setFileVideo] = useState<API.AnimeVideosResp>();
  const [indexVideoId, setIndexVideoId] = useState<number | undefined>(0);
  const [isCur, setIsCur] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);
  const [cursor, setCursor] = useState<{
    maxCursor: number;
    hasNext: boolean;
    time: number;
  }>({
    maxCursor: 0,
    hasNext: true,
    time: 0,
  });
  const getAnimeData = async () => {
    if (animeId === 0) {
      return;
    }
    const res = await getAnimeById({ id: animeId });
    if (res) {
      if (!res.videos?.length || res.videos?.length <= 0) {
        navigate('/404');
        return;
      }
      setAnimeMsg(res);
    } else {
      navigate('/404');
    }
  };
  const getIndex = (videoId: number | undefined | null) => {
    if (videoId === undefined || videoId === null) {
      return -1;
    }
    // 获取 fileVideo id 在
    const index = animeMsg?.videos?.findIndex((item) => Number(item.id) === Number(videoId));
    console.log('index', index);
    console.log('animeMsg?.videos', animeMsg?.videos);
    console.log('videoId', videoId);
    return index ?? -1;
  };
  const handQie = async (videoId: number | undefined) => {
    if (!videoId || videoId === 0 || videoId === undefined) {
      return;
    }
    const res = await get({ videoId });
    // 将状态和 id 设置到浏览器的url 后面
    const currentUrl = new URL(window.location.href, window.location.origin);
    // 获取当前查询参数的迭代器
    const searchParams = new URLSearchParams(currentUrl.search);
    searchParams.set('videoId', String(res.id));
    if (animeId !== Number(animeIdP)) {
      searchParams.set('animeId', String(animeId));
    }
    currentUrl.search = searchParams.toString();
    history.pushState({}, '', currentUrl.toString());
    setFileVideo(res);
    setCursor({
      maxCursor: 0,
      hasNext: true,
      time: 0,
    });
    if (artInstance.current) artInstance.current.plugins.artplayerPluginDanmuku.reset(); //清空弹幕
    localStorage.setItem(animeIdP + '_videoId', String(res?.id));
    localStorage.setItem(animeIdP + '_animeId', String(animeId));
  };
  useEffect(() => {
    if (animeId != null && animeId !== 0) {
      getAnimeData();
    } else if (animeId === 0) {
      navigate('/404');
      return;
    }
  }, [animeId]);
  useEffect(() => {
    const x = getIndex(Number(videoIdP));
    let i = x < 0 ? 0 : x;
    if (i <= 0) {
      const y = getIndex(Number(animeMsg?.lookVideoId));
      i = y < 0 ? 0 : y;
    }
    handQie(animeMsg?.videos?.[i]?.id);
    setIndexVideoId(animeMsg?.videos?.[i + 1]?.id);
  }, [animeMsg]);
  const nextOrPrev = (type: string) => {
    if (type === 'next') {
      if (indexVideoId) {
        handQie(indexVideoId);
        const index = animeMsg?.videos?.findIndex(
          (item) => Number(item.id) === Number(indexVideoId),
        );
        setIndexVideoId(animeMsg?.videos?.[(index || 0) + 1]?.id);
      }
    } else {
      if (indexVideoId) {
        const index = animeMsg?.videos?.findIndex(
          (item) => Number(item.id) === Number(indexVideoId),
        );
        if (index === undefined || index < 2) {
          message.error('已经是第一集了');
          return;
        }
        const vId = animeMsg?.videos?.[index - 1 - 1]?.id;
        if (!vId) {
          return;
        }
        handQie(vId);
        setIndexVideoId(animeMsg?.videos?.[index - 1]?.id);
      } else {
        handQie(animeMsg?.videos?.[animeMsg?.videos?.length - 1 - 1]?.id);
        setIndexVideoId(animeMsg?.videos?.[animeMsg?.videos?.length - 1]?.id);
      }
    }
  };
  const nextEvent = () => {
    nextOrPrev('next');
  };
  const prevEvent = () => {
    nextOrPrev('prev');
  };
  const addAnimeCount = async () => {
    if (animeMsg?.id) {
      await addCount({ animeId: animeMsg.id });
    }
  };

  const [option, setOption] = useState({
    url: '',
    volume: 0.5,
    autoplay: true,
    pip: true,
    hotkey: true, // 快捷键
    miniProgressBar: true, // 迷你进度条
    autoSize: true,
    autoMini: true,
    screenshot: true,
    lock: true,
    fastForward: true,
    autoOrientation: true,
    setting: true, // 是否启用设置面板。
    flip: true, // 是否启用翻转。
    playbackRate: true, // 是否启用播放速度。
    aspectRatio: true, // 是否启用宽高比。
    fullscreen: true, // 是否启用全屏。
    fullscreenWeb: true, // 是否启用网页全屏。
    // subtitleOffset: true, // 是否启用字幕偏移。
    mutex: true, // 是否启用互斥模式（只允许一个实例播放，其他实例暂停）
    backdrop: true, // 是否启用背景虚化效果。
    // playsInline: true, // 是否启用内嵌播放（不自动全屏）
    autoPlayback: true, // 是否启用自动播放。
    airplay: true, //是否启用 AirPlay 支持。
    theme: '#fbc0cb', // 播放器的主题颜色
    lang: navigator.language.toLowerCase(), //播放器的语言设置，自动根据用户浏览器语言选择。
    moreVideoAttr: {
      crossOrigin: 'anonymous',
    },
    // 自定义设置
    settings: [],
    contextmenu: [
      {
        html: 'huabai',
        click: function (contextmenu: { show: boolean }) {
          console.info('You clicked on the custom menu');
          contextmenu.show = false;
        },
      },
    ],
    // 缩略图
    thumbnails: {},
    controls: [
      {
        position: 'right',
        html: '90s',
        index: 1,
        tooltip: '快进一分30秒',
        style: {
          margin: '0',
        },
        click: function () {
          // @ts-ignore
          artInstance.current.seek = artInstance.current.currentTime + 90;
        },
      },
    ],
    customType: {
      // 定义自定义类型处理方式
      m3u8: function (video: any, url: any, art: any) {
        // 这里可以添加 TS 视频的处理逻辑
        // 例如，使用 HLS.js 来处理 TS 视频
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(url);
          hls.attachMedia(video);
          art.hls = hls;
          art.on('destroy', () => hls.destroy());
        }
      },
    },
    plugins: [
      artplayerPluginDanmuku({
        danmuku: [],
        fontSize: 25,
        antiOverlap: true, // 弹幕是否防重叠
        width: 1300, // 当播放器宽度小于此值时，弹幕发射器置于播放器底部
        theme: 'light', // 弹幕主题，支持 dark 和 light，只在自定义挂载时生效
        // 这是用户在输入框输入弹幕文本，然后点击发送按钮后触发的函数
        // 你可以对弹幕做合法校验，或者做存库处理
        // 当返回true后才表示把弹幕加入到弹幕队列
        async beforeEmit(danmu) {
          const isDirty = /fuck/i.test(danmu.text);
          if (danmu.text.includes('>')) {
            const c = danmu.text.split('>')[0];
            if (c.includes('#')) {
              danmu.color = c;
              danmu.text = danmu.text.split('>')[1];
            }
          }
          if (isDirty) return false;
          // const state = await saveDanmu(danmu);
          // return state;
          const videoId = localStorage.getItem(animeIdP + '_videoId');
          if (!videoId) return false;
          const res = await addBarrage({
            videoId: videoId,
            content: danmu.text,
            timestamp: danmu.time || 0,
            style: {
              color: danmu.color || '#FFFFFF',
              position: danmu.mode || 0,
            },
          });
          return res;
        },

        // 这里是所有弹幕的过滤器，包含来自服务端的和来自用户输入的
        // 你可以对弹幕做合法校验
        // 当返回true后才表示把弹幕加入到弹幕队列
        filter(danmu) {
          return danmu.text.length <= 200;
        },

        // 这是弹幕即将显示的时触发的函数
        // 你可以对弹幕做合法校验
        // 当返回true后才表示可以马上发送到播放器里
        async beforeVisible(danmu) {
          return true;
        },
      }),
    ],
  });

  useEffect(() => {
    const f = getIndex(fileVideo?.id) === (animeMsg?.videos?.length || 1) - 1;
    setIsCur((prev) => {
      if (artInstance.current) {
        if (fileVideo?.id && getIndex(fileVideo?.id) >= 0 && !prev && !f) {
          // artInstance.current.hotkey.add(221, nextEvent);
          // artInstance.current.hotkey.add(219, prevEvent);
          artInstance.current.controls.add({
            index: 5,
            name: 'next',
            position: 'left',
            html: '<img src="http://8.137.78.53/touxiang/icon/next.svg" alt="1" width="21px">',
            tooltip: '下一集',
            click: function () {
              // @ts-ignore
              nextOrPrev('next');
            },
          });
          prev = true;
        } else if (fileVideo?.id && getIndex(fileVideo?.id) >= 0 && prev && !f) {
          artInstance.current.controls.remove('next');
          prev = false;
          artInstance.current.controls.add({
            index: 5,
            name: 'next',
            position: 'left',
            html: '<img src="http://8.137.78.53/touxiang/icon/next.svg" alt="1" width="21px">',
            tooltip: '下一集',
            click: function () {
              // @ts-ignore
              nextOrPrev('next');
            },
          });
          prev = true;
        } else if (fileVideo?.id && (getIndex(fileVideo?.id) < 0 || f) && prev) {
          artInstance.current.controls.remove('next');
          prev = false;
        }
        return prev;
      } else return prev;
    });
  }, [fileVideo?.id]);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      // 如果有输入框 检查输入框是否获取焦点
      const inputRef = document.activeElement;
      if (inputRef && (inputRef.tagName === 'TEXTAREA' || inputRef.tagName === 'INPUT')) {
        return;
      }
      if (event.key === '[') {
        prevEvent();
      } else if (event.key === ']') {
        nextEvent();
      } else if (event.key === 'f') {
        if (artInstance.current) {
          artInstance.current.fullscreen = !artInstance.current.fullscreen;
        }
      }
    };
    // 添加键盘事件监听器
    document.addEventListener('keydown', handleKeyDown);

    // 组件卸载时移除监听器
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [fileVideo?.id]);

  // useEffect(() => {
  //   const updateLayersTime = () => {
  //     const now = new Date();
  //     const hours = String(now.getHours()).padStart(2, '0');
  //     const minutes = String(now.getMinutes()).padStart(2, '0');
  //     const seconds = String(now.getSeconds()).padStart(2, '0');
  //     const timeString = `${hours}:${minutes}:${seconds}`;
  //
  //     // 如果layers中已经有时间层，则更新它的内容
  //     if (artInstance.current) {
  //       artInstance.current.layers.update({
  //         name: 'time',
  //         html: `<div style="display: flex; align-items: center; justify-content: center;">${timeString}</div>`,
  //         style: {
  //           position: 'absolute',
  //           top: '8px',
  //           right: '16px',
  //         },
  //       });
  //     }
  //   };
  //   const intervalId = setInterval(updateLayersTime, 1000);
  //   return () => clearInterval(intervalId);
  // }, [artInstance.current]);
  const handleSwitchUrl = (newUrl: string) => {
    const title = animeMsg?.name + ' ' + fileVideo?.title;
    // 已经有实例就切换
    if (artInstance.current) {
      artInstance.current.switchUrl(newUrl);
      artInstance.current.layers.update({
        name: 'potser',
        html: `
           <div style="display: flex; align-items: center; justify-content: center;">
               <span id="text" style="">${title}</span>
            </div>
         `,
        click: function (...args) {},
        style: {
          position: 'absolute',
          top: '8px',
          left: '16px',
        },
      });
      // if (animeMsg?.seek && animeMsg?.lookVideoId === fileVideo?.id && !videoIdP) {
      //   setTimeout(() => {
      //     // if (artInstance.current) artInstance.current.seek = Number(animeMsg?.seek || 0);
      //     if (artInstance.current) artInstance.current.currentTime = Number(animeMsg?.seek || 0);
      //   }, 200);
      // }
    } else {
      // 没有就改变状态变量 实例监听所以会重新渲染
      setOption({
        ...option,
        url: newUrl,
      });
    }
  };

  useEffect(() => {
    if (fileVideo?.id === undefined) {
      return;
    }
    if (fileVideo?.fileUrl) {
      handleSwitchUrl(fileVideo?.fileUrl);
    } else {
      let index = getIndex(fileVideo?.id);
      if (index > 0) {
        for (let i = index; i >= 0; i--) {
          const an = animeMsg?.videos?.[i - 1];
          if (an?.fileUrl) {
            index = i;
            break;
          }
        }
      }
      message.destroy();
      message.error('该集暂无播放源,为你返回' + (index <= 0 ? '第1集' : '有视频源的集数~'));
      setTimeout(() => {
        handQie(animeMsg?.videos?.[index <= 0 ? 0 : index - 1]?.id);
      }, 200);
    }
  }, [fileVideo?.id]);
  const tiaojian = (video: API.AnimeVideosResp) => {
    return fileVideo?.id && Number(video.id) === Number(fileVideo?.id);
  };
  const videoRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const selectedVideoIndex = animeMsg?.videos?.findIndex((video) => tiaojian(video));
    if (selectedVideoIndex)
      if (selectedVideoIndex !== -1 && videoRefs.current[selectedVideoIndex]) {
        videoRefs.current[selectedVideoIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest', // 修改为 'nearest'，避免容器滚动超出必要范围
          inline: 'nearest', // 添加 inline 选项
        });
      }
  }, [fileVideo?.id]);

  const updateRecord = async (seek: any, animeId: any, videoId: any) => {
    if (!seek) {
      return;
    }
    return await addOrUp({
      animeId: Number(animeId),
      videoId: Number(videoId),
      seek: Number(seek),
    });
  };
  const [intervalId, setIntervalId] = useState<any>();
  const dingShiUpdateRecord = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    const interval = setInterval(() => {
      const seek = localStorage.getItem(animeIdP + '_lastSeekTime');
      const videoId = localStorage.getItem(animeIdP + '_videoId');
      const animeIdd = localStorage.getItem(animeIdP + '_animeId');
      updateRecord(seek, animeIdd, videoId);
    }, 15000);
    setIntervalId(interval);
  };

  function hotkeyEvent(event: any) {
    if (artInstance.current) {
      let b = 1;
      b = artInstance.current.playbackRate;
      if (b === 3) {
        b = 1;
      } else if (b === 1) {
        b = b + 0.25;
      } else if (b === 1.5) {
        b = b + 0.5;
      } else if (b === 1.25) {
        b = b + 0.25;
      } else {
        b = b + 1;
      }
      artInstance.current.playbackRate = b;
    }
  }

  const handleBeforeUnload = () => {
    // 这里的代码会在页面关闭前执行
    // 组件卸载时，从localStorage获取最后记录的播放时间
    const seek = localStorage.getItem(animeIdP + '_lastSeekTime');
    const videoId = localStorage.getItem(animeIdP + '_videoId');
    const animeIdd = localStorage.getItem(animeIdP + '_animeId');
    localStorage.removeItem(animeIdP + '_lastSeekTime');
    localStorage.removeItem(animeIdP + '_videoId');
    localStorage.removeItem(animeIdP + '_animeId');
    // 调用updateRecord并等待其完成
    updateRecord(seek, animeIdd, videoId).catch((error) => {
      console.error('Error updating record:', error);
    });
  };
  useEffect(() => {
    const handleTimeUpdate = () => {
      if (artInstance.current) {
        // 获取当前播放时间
        const seek = artInstance.current.currentTime;
        // 存储当前时间，以便在组件卸载时使用
        localStorage.setItem(animeIdP + '_lastSeekTime', String(seek));
      }
    };
    if (artInstance.current) {
      artInstance.current.on('info', (state) => {
        if (state) {
          // 刷新页面
          window.location.reload();
        }
      });
      artInstance.current.on('video:timeupdate', handleTimeUpdate);
      // 可以在这里根据新的 URL 设置处理方式
      // 例如，如果新的 URL 是 TS 格式，可以这样设置
      artInstance.current.on('error', (error, reconnectTime) => {
        console.info(error, reconnectTime);
        console.info('播放器地址', fileVideo?.fileUrl);
      });
      artInstance.current.on('control', (state) => {
        // console.log('隐藏状态：', state);
        if (artInstance.current) artInstance.current.layers.show = state;
      });
      artInstance.current.on('video:ended', () => {
        console.log('视频已播放完成！~');
        if (intervalId) {
          clearInterval(intervalId);
          setIntervalId(null);
        }
        nextOrPrev('next');
      });
      artInstance.current.on('seek', (currentTime) => {
        if (
          artInstance.current &&
          animeMsg?.seek &&
          animeMsg?.lookVideoId === fileVideo?.id &&
          animeMsg?.seek > 0
        ) {
          if (artInstance.current) artInstance.current.plugins.artplayerPluginDanmuku.reset(); //清空弹幕
          const cha = Math.abs(currentTime - animeMsg?.seek);
          if (cha > 0.5) {
            return;
          }
          const title = '已为您跳转到' + formatSeekTime(currentTime);
          console.info(title);
          artInstance.current.layers.update({
            name: 'tiaozhuan',
            html: `
           <div style="display: flex; align-items: center; justify-content: center;background-color: rgba(0, 0, 0, 0.7);
           padding: 10px 12px 10px 24px;border-radius: 5px">
               <span id="text" style="font-size: 14px ;color: white">${title}</span>
            </div>
         `,
            click: function (...args) {},
            style: {
              position: 'absolute',
              bottom: '15%',
              left: '16px',
              zIndex: '9999',
            },
          });
          setTimeout(() => {
            if (artInstance.current) {
              try {
                artInstance.current.layers.remove('tiaozhuan');
              } catch (e) {
                console.log(e);
              }
            }
          }, 3500);
        }
      });
      artInstance.current.on('ready', () => {
        artInstance?.current?.hotkey.add(75, hotkeyEvent);
        if (animeMsg?.seek && animeMsg?.lookVideoId === fileVideo?.id && animeMsg?.seek > 0) {
          if (artInstance.current) artInstance.current.seek = Number(animeMsg?.seek || 0);
        }
      });
      artInstance.current.on('restart', () => {
        artInstance?.current?.hotkey.add(75, hotkeyEvent);
        if (animeMsg?.seek && animeMsg?.lookVideoId === fileVideo?.id && animeMsg?.seek > 0) {
          if (artInstance.current) artInstance.current.seek = Number(animeMsg?.seek || 0);
        }
      });
      artInstance.current.on('play', () => {
        const seek = localStorage.getItem(animeIdP + '_lastSeekTime');
        const videoId = localStorage.getItem(animeIdP + '_videoId');
        const animeIdd = localStorage.getItem(animeIdP + '_animeId');
        updateRecord(seek, animeIdd, videoId || fileVideo?.id).catch((error) => {
          console.error('Error updating record:', error);
        });
        dingShiUpdateRecord();
      });
      artInstance.current.on('pause', () => {
        const seek = localStorage.getItem(animeIdP + '_lastSeekTime');
        const videoId = localStorage.getItem(animeIdP + '_videoId');
        const animeIdd = localStorage.getItem(animeIdP + '_animeId');
        // 调用updateRecord并等待其完成
        updateRecord(seek, animeIdd, videoId).catch((error) => {
          console.error('Error updating record:', error);
        });
        if (intervalId) {
          clearInterval(intervalId);
          setIntervalId(null);
        }
      });
    }
    return () => {
      // 移除事件监听器
      if (artInstance.current) {
        artInstance.current.off('seek');
        artInstance.current.off('video:ended');
        artInstance.current.off('error');
        artInstance.current.off('video:timeupdate', handleTimeUpdate);
        artInstance.current.off('ready');
        artInstance.current.off('restart');
        artInstance.current.off('play');
        artInstance.current.off('pause');
      }
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    };
  }, [artInstance.current, fileVideo?.id, intervalId]);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const getBarrage = async (type: number, maxCursor: number, hasNext: boolean) => {
    if (!fileVideo?.id || !hasNext) return;
    console.log('开始获取弹幕');
    const r = await getBarrages({
      videoId: fileVideo?.id,
      maxCursor: maxCursor,
    });

    const data = r.data;
    if (data && artInstance.current) {
      console.log('获取到弹幕', data);
      const target = data.map((item) => {
        return {
          text: item.content,
          color: item.style?.color,
          time: item.timestamp,
          mode: item.style?.position,
        };
      });
      if (type === 0) {
        target.unshift({
          text: '友好发送弹幕吧~...',
          color: '#fff',
          time: 0,
          mode: 1,
        });
        artInstance.current.plugins.artplayerPluginDanmuku.config({
          danmuku: target,
        });
        artInstance.current.plugins.artplayerPluginDanmuku.load();
      } else artInstance.current.plugins.artplayerPluginDanmuku.load(target);
      setCursor({
        maxCursor: r.maxCursor,
        hasNext: r.hasNext,
        time: 0,
      });
      // 添加弹幕
      if (r.hasNext)
        //如果还有就递归
        timeoutRef.current = setTimeout(() => {
          console.log('继续获取弹幕', data);
          getBarrage(1, r.maxCursor, r.hasNext);
        }, 1000);
    } else {
      if (type === 0 && artInstance.current) {
        artInstance.current.plugins.artplayerPluginDanmuku.config({
          danmuku: [],
        });
        artInstance.current.plugins.artplayerPluginDanmuku.load();
      }
      setCursor({
        maxCursor: r.maxCursor,
        hasNext: false,
        time: 0,
      });
    }
  };
  useEffect(() => {
    // 清除当前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (artInstance.current && cursor.hasNext) {
      artInstance.current.on('restart', async () => {
        if (fileVideo?.id) {
          addAnimeCount();
          getBarrage(0, cursor.maxCursor, cursor.hasNext).then();
        }
      });
      artInstance.current.on('ready', async () => {
        if (fileVideo?.id) {
          addAnimeCount();
          getBarrage(0, cursor.maxCursor, cursor.hasNext).then();
        }
      });
    }
    return () => {
      if (artInstance.current) {
        artInstance.current.off('restart');
        artInstance.current.off('ready');
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [artInstance.current, fileVideo?.id]);
  useEffect(() => {
    // 添加页面关闭事件监听器
    window.addEventListener('beforeunload', handleBeforeUnload);
    // 组件卸载时移除事件监听器
    return () => {
      // 路由切换 组件卸载时也记录播放进度
      handleBeforeUnload();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  // 系列标签页
  const containerRef = useRef<HTMLDivElement | null>(null);
  // 鼠标滚轮横向滚动
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      container.scrollBy({
        left: e.deltaY,
        behavior: 'smooth', // 使用平滑滚动
      });
    };

    container.addEventListener('wheel', handleWheel);
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const selectedTab = container.querySelector<HTMLElement>('.selected-tab');
    if (selectedTab) {
      // 滚动到视图中央
      const containerRect = container.getBoundingClientRect();
      const tabRect = selectedTab.getBoundingClientRect();
      const offset =
        tabRect.left - containerRect.left - containerRect.width / 2 + tabRect.width / 2;
      container.scrollBy({
        left: offset,
        behavior: 'smooth', // 使用平滑滚动
      });
    }
  }, [animeMsg]);
  return (
    <div style={{ width: '100%' }} className={'shang-anime'}>
      <Flex vertical gap={'30px'}>
        <Flex style={{ width: '100%' }} justify={'space-between'}>
          <Artplayer
            option={option}
            style={{
              width: '115vh',
              minWidth: '843px',
              height: `${115 * 0.5625}vh`,
              minHeight: `${590 * 0.5625}px`,
              marginLeft: '60px',
            }}
            getInstance={(art: any) => {
              artInstance.current = art;
            }}
          />
          <Card
            style={{
              width: '48vh',
              minWidth: '246px',
              height: `${115 * 0.5625}vh`,
              minHeight: `${590 * 0.5625}px`,
              marginRight: '9vh',
              marginLeft: '22px',
              backgroundColor:
                settings && settings.navTheme === 'light' ? '#e8e9ea' : token.colorBgLayout,
              // backgroundColor: token.colorBgMask,
              overflow: 'hidden',
            }}
            styles={{ body: { padding: 0, overflow: 'hidden' } }}
          >
            <Typography.Title level={3} style={{ marginTop: '12px', marginLeft: '12px' }}>
              {animeMsg?.name}
            </Typography.Title>
            <span style={{ fontWeight: 'normal', fontSize: '18px', marginLeft: '12px' }}>正片</span>
            <span
              style={{
                fontSize: '14px',
                color: '#999',
                marginLeft: '12px',
              }}
            >
              {'(' + (getIndex(fileVideo?.id) + 1) + '/' + (animeMsg?.videos?.length || 0) + ')'}
            </span>
            <br />
            <Flex
              ref={containerRef}
              style={{
                width: '100%',
                maxWidth: '100%',
                overflowX: 'auto',
                padding: '16px 12px 8px 12px',
                scrollBehavior: 'smooth',
              }}
              className="custom-scrollbar2"
            >
              {animeMsg?.seriesId ? (
                <Flex>
                  {animeMsg.series?.map((series, index) => (
                    <Flex
                      onClick={() => {
                        setAnimeId(series.id!);
                      }}
                    >
                      <TabDisplay
                        key={series.id}
                        is={animeMsg.id === series.id}
                        title={series.seasonTitle || (animeMsg?.type === 0 ? '剧场版' : 'TV')}
                        className={animeMsg.id === series.id ? 'selected-tab' : ''}
                      />
                    </Flex>
                  ))}
                </Flex>
              ) : (
                <TabDisplay title={animeMsg?.type === 0 ? '剧场版' : 'TV'} is={true} />
              )}
            </Flex>

            <Flex
              vertical
              className="custom-scrollbar"
              onWheel={(e) => e.stopPropagation()} // 阻止滚轮事件冒泡到页面，避免页面滚动
              style={{ maxHeight: `${115 * 0.5625 - 22}vh`, overflowY: 'auto', marginLeft: '12px' }}
            >
              {animeMsg?.videos?.map((video, index) => (
                <Card
                  hoverable
                  styles={{
                    body: {
                      padding: '5px',
                      overflow: 'hidden',
                      width: '100%',
                    },
                  }}
                  style={{
                    marginBottom: '6px',
                    backgroundColor:
                      settings && settings.navTheme === 'light' ? '#e8e9ea' : token.colorBgLayout,
                    border: 'none',
                    marginRight: '5px',
                    marginLeft: '5px',
                  }}
                  key={video.id}
                  onClick={() => {
                    if (video.id === fileVideo?.id) return;
                    handQie(video.id);
                    setIndexVideoId(animeMsg?.videos?.[getIndex(video.id) + 1]?.id);
                  }}
                  ref={(el) => (videoRefs.current[index] = el)} // 保存每个 Card 的 DOM 引用
                >
                  <Flex gap={'10px'}>
                    {video.image ? (
                      <Image
                        preview={false}
                        alt="avatar"
                        src={video?.image}
                        style={{
                          display: 'block',
                          height: '60px',
                          width: '106.45px',
                          borderRadius: '4px',
                        }}
                      />
                    ) : (
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
                    )}
                    <Flex vertical align="start" justify="center">
                      <Typography.Text
                        style={{
                          fontSize: '14px',

                          marginBottom: '8px',
                          fontWeight: 'bold',
                        }}
                      >
                        <Flex
                          style={{
                            color: tiaojian(video) ? token.colorPrimaryText : '#999',
                            transition: 'all 1s ease',
                          }}
                        >
                          {/*{tiaojian(video) && <PlayingIcon color={token.colorPrimaryText} />}*/}
                          <Flex
                            style={{
                              width: tiaojian(video) ? '8px' : '0',
                              marginRight: tiaojian(video) ? '9px' : '0',
                              // 条件不满足不显示 包含的子组件
                              opacity: tiaojian(video) ? 1 : 0,
                              transition: 'all 0.5s ease-in-out',
                            }}
                          >
                            <PlayingIcon color={token.colorPrimaryText} />
                          </Flex>
                          第 {video.rank} 集
                        </Flex>
                      </Typography.Text>
                      {/*循环 animeMsg.videos*/}
                      <Flex align="start" justify="space-between" style={{ width: '100%' }}>
                        <Typography.Title
                          level={5}
                          style={{
                            margin: 0,
                            color: tiaojian(video) ? token.colorPrimaryText : token.colorText,
                            transition: 'all 1s ease',
                          }}
                        >
                          {video.title}
                        </Typography.Title>
                      </Flex>
                    </Flex>
                  </Flex>
                </Card>
              ))}
            </Flex>
          </Card>
        </Flex>
        <Flex>
          <div></div>
        </Flex>
        <Card
          style={{
            width: '167vh',
            marginLeft: '60px',
            backgroundColor: 'transparent',
            border: 'none',
          }}
          styles={{ body: { padding: 0, overflow: 'hidden' } }}
        >
          <Flex vertical justify={'start'} align={'start'}>
            <Flex gap={'12px'} style={{ width: '100%' }}>
              <Image
                preview={false}
                alt="avatar"
                src={animeMsg?.image}
                style={{
                  display: 'block',
                  width: 250,
                  borderRadius: '8px',
                }}
              />
              <Flex
                gap={'12px'}
                vertical
                align="flex-start"
                flex={1}
                justify="space-between"
                style={{ padding: 16, width: '100%' }}
              >
                <Typography.Title level={3}>{animeMsg?.name}</Typography.Title>
                <Flex>
                  {animeMsg?.month && (
                    <Tag color={'default'} bordered={false} icon={<ClockCircleOutlined />}>
                      {animeMsg?.issueTime?.split('-')[0]}
                    </Tag>
                  )}
                  {animeMsg?.month && (
                    <Tag color={'default'} bordered={false} icon={<ClockCircleOutlined />}>
                      {animeMsg?.month + '月'}
                    </Tag>
                  )}
                  <Tag color={'default'} bordered={false} icon={<LanguageIcon />}>
                    {animeMsg?.language}
                  </Tag>
                  {animeMsg?.playCount && (
                    <Tag color={'default'} bordered={false}>
                      {(animeMsg?.playCount || 0) + '次播放'}
                    </Tag>
                  )}
                </Flex>

                <Flex gap={'small'} align="center" justify="space-between" style={{ width: '60%' }}>
                  {animeMsg?.score && (
                    <>
                      <Rate disabled defaultValue={animeMsg?.score / 2} allowHalf />{' '}
                      <div style={{ color: '#f9ad31', fontWeight: 'bold', fontSize: '20px' }}>
                        {animeMsg?.score?.toFixed(1)}{' '}
                      </div>
                      <span style={{ marginTop: '4px', color: 'var(--color-gray)' }}>
                        {animeMsg.number}人评分
                      </span>
                    </>
                  )}
                  <Flex style={{ flex: 1 }} justify={'end'} gap={'8px'}>
                    <span style={{ color: '#999' }}>我的评分 </span>
                    <Rate
                      defaultValue={0}
                      allowHalf
                      value={(animeMsg?.userScore || 0) / 2}
                      onChange={(v) => {
                        setSelectedRating(v);
                      }}
                    />
                    <Modal
                      open={selectedRating !== undefined}
                      onCancel={() => setSelectedRating(undefined)}
                      footer={null}
                      centered
                      title={'请发表你对这部作品的评分'}
                    >
                      <UserRating
                        defaultValue={selectedRating}
                        setDefaultValue={setSelectedRating}
                        animeId={animeMsg?.id || 0}
                        old={{
                          id: animeMsg?.ratingId,
                          score: animeMsg?.userScore,
                        }}
                        onResult={(data) => {
                          if (data.id) {
                            // setAnimeMsg({
                            //   ...animeMsg,
                            //   userScore: data.score,
                            //   ratingId: data.id,
                            // });
                            if (animeMsg) {
                              animeMsg.userScore = data.score;
                              animeMsg.ratingId = data.id;
                            }
                            setSelectedRating(undefined);
                          }
                        }}
                      />
                    </Modal>
                  </Flex>
                </Flex>
                <InfoDisplay label={'导演：'} value={animeMsg?.director} />
                <InfoDisplay
                  label={'演员：'}
                  value={animeMsg?.actRole?.join('、')}
                  useTooltip={true}
                />
                <InfoDisplay label={'类型：'} value={animeMsg?.kind?.join(' ')} />

                <Flex flex={1} align={'end'} style={{ width: '100%' }}>
                  <Flex
                    align={'center'}
                    justify="center"
                    style={{ fontSize: '16px', width: '100%' }}
                  >
                    <div
                      style={{
                        fontWeight: 'bold',
                        color: token.colorPrimaryText,
                        marginRight: '8px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0, // 防止换行
                      }}
                    >
                      简介：
                    </div>
                    <TextArea
                      value={animeMsg?.intro}
                      className={'custom-scrollbar'}
                      style={{
                        padding: '0',
                        color:
                          settings && settings.navTheme === 'light'
                            ? 'black'
                            : 'var(--text--white)',
                        fontSize: '16px',
                        overflowY: 'auto',
                      }}
                      autoSize
                      disabled
                      variant="borderless"
                    />
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Card>
        <Flex
          vertical
          style={{
            width: '167vh',
            marginLeft: '60px',
          }}
        >
          <Comment videoId={fileVideo?.id || 0} animeId={animeId} />
        </Flex>
      </Flex>

      {/*{fileVideo?.id && getIndex(fileVideo?.id) >= 0 && <div>第{fileVideo.rank}集</div>}*/}
      {/*{fileVideo?.id && getIndex(fileVideo?.id) > 0 && (*/}
      {/*  <Button*/}
      {/*    style={{ width: 100 }}*/}
      {/*    onClick={() => {*/}
      {/*      handQie(animeMsg?.videos?.[getIndex(fileVideo?.id) - 1]?.id);*/}
      {/*      setIndexVideoId(animeMsg?.videos?.[getIndex(fileVideo?.id)]?.id);*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    上一集*/}
      {/*  </Button>*/}
      {/*)}*/}
      {/*{fileVideo?.id && getIndex(fileVideo?.id) < (animeMsg?.videos?.length || 1) - 1 && (*/}
      {/*  <Button*/}
      {/*    style={{ width: 100 }}*/}
      {/*    onClick={() => {*/}
      {/*      handQie(animeMsg?.videos?.[getIndex(fileVideo?.id) + 1]?.id);*/}
      {/*      setIndexVideoId(animeMsg?.videos?.[getIndex(fileVideo?.id) + 1 + 1]?.id);*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    下一集*/}
      {/*  </Button>*/}
      {/*)}*/}
      <FloatButton.BackTop />
    </div>
  );
};
export default Player;
