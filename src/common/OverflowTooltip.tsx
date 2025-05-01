import { Tooltip } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

export const OverflowTooltip = ({
  text,
  maxWidth,
  style,
}: {
  text: string | undefined;
  maxWidth: number;
  style?: React.CSSProperties;
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);

  // 检测文本是否溢出
  useEffect(() => {
    if (textRef.current) {
      const element = textRef.current;
      // 判断内容是否溢出
      setIsOverflow(
        element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth,
      );
    }
  }, [text]);

  const textContent = (
    <div
      ref={textRef}
      style={{
        color: '#666',
        height: '36px',
        lineHeight: '18px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        margin: 0,
        cursor: isOverflow ? 'pointer' : 'default', // 仅在溢出时显示指针
        ...style,
      }}
    >
      {text || <span style={{ color: '#999' }}>暂无描述</span>}
    </div>
  );

  // 仅在溢出时显示 Tooltip
  return isOverflow ? (
    <Tooltip title={text} overlayStyle={{ maxWidth }} placement="topLeft" mouseEnterDelay={0.3}>
      {textContent}
    </Tooltip>
  ) : (
    textContent
  );
};
