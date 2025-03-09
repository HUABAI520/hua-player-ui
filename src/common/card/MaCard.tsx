import { Card, Flex, Image, Skeleton, theme } from 'antd';
import React, { useEffect, useState } from 'react';
import { pictureFallback } from '@/common/error';
import { getLocal } from '@/common/utils/LocalUtils';
import { useModel } from '@umijs/max';
import { FEN_DISPLAY } from '@/common/GlobalKey';

interface MaCardProps {
  loading: boolean;
  index: number;
  onClick: () => void;
  anime: API.AnimeIndexResp;
  fd?: boolean;
}

const { useToken } = theme;
export const MaCard = ({ loading, index, onClick, anime, fd = true }: MaCardProps) => {
  const { token } = useToken();
  const [focusAnimeId, setFocusAnimeId] = useState<boolean>();
  const [fadeIn, setFadeIn] = useState<boolean>(false);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => setFadeIn(true), 10); // 短暂延迟后触发淡入
    } else {
      setFadeIn(false); // 在 loading 状态下设置为透明
    }
  }, [loading]);
  return (
    <Card
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
      onClick={onClick}
    >
      <Flex vertical>
        <div
          style={{
            height: '214px',
            width: '160px',
            overflow: 'hidden',
            borderRadius: '7px',
            display: 'inline-block',
            cursor: 'pointer',
          }}
        >
          {loading ? (
            <Skeleton.Node
              active={true}
              style={{
                display: 'block',
                height: '214px',
                width: '160px',
                borderRadius: '7px',
              }}
            />
          ) : (
            <>
              <img
                onMouseEnter={() => {
                  setFocusAnimeId(true);
                }}
                onMouseLeave={() => {
                  setFocusAnimeId(false);
                }}
                // preview={false}
                alt="avatar"
                src={anime.image}
                loading={'lazy'}
                style={{
                  // 添加圆角
                  display: 'block',
                  // height: '214px',
                  // width: '160px',
                  width: '100%',
                  height: '100%',
                  objectFit: 'fill',
                  borderRadius: '7px',
                  transform: `${focusAnimeId ? 'scale(1.2)' : 'scale(1)'} ${
                    fadeIn ? 'translateY(0)' : 'translateY(25%)'
                  }`,
                  transition:
                    'transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1),opacity 0.75s ease-in-out', // 使用贝塞尔曲线实现慢-快-慢效果
                  opacity: fadeIn ? 1 : 0.75, // 控制透明度的渐入效果
                }}
                // fallback={pictureFallback}
              ></img>
              {anime.score && (
                <span
                  style={{
                    maxWidth: '90%',
                    right: '10%',
                    top: '190px',
                    position: 'absolute',
                    color: token.colorPrimaryText,
                    zIndex: 1,
                    transform: `${focusAnimeId ? 'scale(1.2)' : 'scale(1)'} `,
                    transition:
                      'transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1),opacity 0.8s ease-in-out', // 使用贝塞尔曲线实现慢-快-慢效果
                    opacity: fd ? (fadeIn ? 1 : 0) : 0, // 控制透明度的渐入效果
                  }}
                >
                  <i style={{ fontSize: '16px', fontWeight: 'bold' }}>{anime.score.toFixed(1)}</i>
                </span>
              )}
            </>
          )}
        </div>
        {loading ? (
          <Skeleton.Input
            active={true}
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              marginTop: '8px',
              width: '160px', // 限制宽度为160px
              display: 'inline-block', // 使元素表现为inline-block，这样可以设置宽度
              whiteSpace: 'normal', // 允许文本换行
              overflow: 'hidden', // 隐藏超出部分
              wordWrap: 'break-word', // 允许在单词内换行
            }}
          />
        ) : (
          <span
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              marginTop: '8px',
              width: '160px', // 限制宽度为160px
              display: 'inline-block', // 使元素表现为inline-block，这样可以设置宽度
              whiteSpace: 'normal', // 允许文本换行
              overflow: 'hidden', // 隐藏超出部分
              wordWrap: 'break-word', // 允许在单词内换行
              transform: ` ${fadeIn ? 'translateY(0)' : 'translateY(25%)'}`,
              transition:
                'transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1),opacity 0.75s ease-in-out', // 使用贝塞尔曲线实现慢-快-慢效果
              opacity: fadeIn ? 1 : 0.5, // 控制透明度的渐入效果
            }}
          >
            {anime.name}
          </span>
        )}
      </Flex>
    </Card>
  );
};
