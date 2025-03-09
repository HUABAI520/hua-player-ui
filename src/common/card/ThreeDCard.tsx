// src/ThreeDCard.jsx
import { Card, Flex, Image, Skeleton, theme } from 'antd';
import { useEffect, useRef, useState } from 'react';
import './ThreeDCard.less'; // 导入样式
//@ts-ignore
import ColorThief from 'color-thief';

const { useToken } = theme;

interface ThreeDCardProps {
  loading: boolean;
  index: number;
  // focusAnimeId: number | undefined;
  // setFocusAnimeId: (id: number | undefined) => void;
  onClick: () => void;
  anime: API.AnimeIndexResp;
  is3D: { is: boolean; type: boolean };
  fd?: boolean;
}

export const ThreeDCard = ({
  anime,
  loading,
  index,
  onClick,
  is3D,
  fd = true,
}: ThreeDCardProps) => {
  const cardRef = useRef<any>(null);
  const { token } = useToken();
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  const [bgColor, setBgColor] = useState<undefined | string>(undefined);
  const [glowColor, setGlowColor] = useState('rgba(0, 150, 255, 0.4)');
  const imgRef = useRef<any>(null);
  const [fadeIn, setFadeIn] = useState<boolean>(false);
  useEffect(() => {
    if (!loading) {
      setTimeout(() => setFadeIn(true), 10); // 短暂延迟后触发淡入
    } else {
      setFadeIn(false); // 在 loading 状态下设置为透明
    }
  }, [loading]);
  const handleMouseMove = (e: { clientX: number; clientY: number }) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // 鼠标在卡片内的 x 坐标
    const y = e.clientY - rect.top; // 鼠标在卡片内的 y 坐标

    const midX = rect.width / 2;
    const midY = rect.height / 2;
    if (is3D.type) {
      const rotateY = ((midX - x) / midX) * 20; // 最大旋转角度 10 度
      const rotateX = ((y - midY) / midY) * 20;
      setTransform({ rotateX, rotateY });
    } else {
      const rotateY = ((x - midX) / midX) * 15; // 最大旋转角度 10 度
      const rotateX = ((midY - y) / midY) * 15;
      setTransform({ rotateX, rotateY });
    }
  };

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0 });
  };
  useEffect(() => {
    console.log('Image already loaded');
    const img = imgRef.current;
    if (!img) return;
    if (img.complete) {
      console.log('Image already loaded');
      extractColor(img);
    }
  }, [imgRef.current]);
  const extractColor = (img: any) => {
    try {
      console.log('处理...');
      const colorThief = new ColorThief();
      // Ensure the image is loaded and has been painted
      if (img && img.complete && img.naturalWidth !== 0) {
        console.log('开始提取颜色...');
        const dominantColor = colorThief.getColor(img);
        console.log('颜色提取完成，结果为：', dominantColor);
        const rgb = `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]})`;
        const rgba = `rgba(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]}, 0.4)`;
        setBgColor(rgb);
        setGlowColor(rgba);
        const canvasElements = document.getElementsByTagName('canvas');
        for (let i = 0; i < canvasElements.length; i++) {
          // 因为会生成多个canvas元素，所以删除所有canvas元素
          console.log('Removing canvas element:', canvasElements[i]);
          canvasElements[i].remove();
        }
      }
    } catch (error) {
      console.error('Error extracting color:', error);
      // Fallback colors
      setBgColor('#ffffff');
      setGlowColor('rgba(0, 150, 255, 0.4)');
    }
  };
  return (
    <Card
      // cover={<img alt={anime?.name ?? ''} src={anime?.image} style={{ borderRadius: '15px' }} />}
      // style={{ backgroundColor: 'transparent' }}
      key={index}
      className="three-d-card-container"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `perspective(1000px)  rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) `,
        transition: 'transform 0.2s ease-out,box-shadow 0.1s ease-out',
        boxShadow:
          transform.rotateY !== 0 && transform.rotateX !== 0
            ? `${-transform.rotateY * 1.5}px ${
                transform.rotateX * 1.5
              }px 40px rgba(0, 0, 0, 0.2),0 0 20px ${glowColor}`
            : 'none',

        backgroundColor:
          transform.rotateY !== 0 && transform.rotateX !== 0 ? bgColor : 'transparent',
        marginBottom: '6px',
        border: 'none',
        marginRight: '5px',
        marginLeft: '5px',
      }}
      styles={{
        body: {
          padding: '5px',
          overflow: 'hidden',
          width: '100%',
        },
      }}
    >
      <Flex vertical>
        <div
          style={{
            height: '214px',
            maxHeight: '214px',
            width: '160px',
            maxWidth: '160px',
            overflow: 'hidden',
            borderRadius: '4px',
            display: 'inline-block',
          }}
        >
          {loading ? (
            <Skeleton.Node
              active={true}
              style={{
                display: 'block',
                height: '214px',
                width: '160px',
                borderRadius: '4px',
              }}
            />
          ) : anime.image ? (
            <>
              <img
                // preview={false}
                ref={imgRef}
                alt="avatar"
                crossOrigin={anime.id === -1 ? undefined : 'anonymous'} // 允许跨域提取颜色
                src={anime.image}
                loading="lazy"
                style={{
                  // 添加圆角
                  display: 'block',
                  // height: '214px',
                  // width: '160px',
                  width: '100%',
                  height: '100%',
                  objectFit: 'fill',
                  borderRadius: '4px',
                  transform: ` ${fadeIn ? 'translateY(0)' : 'translateY(25%)'}`,
                  transition:
                    'transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1),opacity 0.75s ease-in-out', // 平滑过渡效果
                  opacity: fadeIn ? 1 : 0.75, // 控制透明度的渐入效果
                }}
              />
              {anime.score && (
                <span
                  style={{
                    maxWidth: '90%',
                    right: '10%',
                    top: '190px',
                    position: 'absolute',
                    color: token.colorPrimaryText,
                    zIndex: 1,
                    transition: 'opacity 0.8s ease-in-out', // 使用贝塞尔曲线实现慢-快-慢效果
                    opacity: fd ? (fadeIn ? 1 : 0) : 0, // 控制透明度的渐入效果
                  }}
                >
                  <i style={{ fontSize: '16px', fontWeight: 'bold' }}>{anime.score.toFixed(1)}</i>
                </span>
              )}
            </>
          ) : (
            <Image
              preview={false}
              loading={'lazy'}
              style={{
                display: 'block',
                height: '214px',
                width: '160px',
                borderRadius: '4px',
              }}
              src="error"
            />
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
export default ThreeDCard;
