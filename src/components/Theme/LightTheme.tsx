import { Check } from '@/pages/Guanli/Test';
import React from 'react';
import { theme } from 'antd';

const { useToken } = theme;
export const LightTheme = ({
  onClick,
  children,
  backgroundColor,
}: {
  onClick?: () => void;
  children?: any;
  backgroundColor?: string;
}) => {
  const { token } = useToken();
  return (
    <div
      onClick={onClick}
      style={{
        width: 44,
        height: 36,
        backgroundColor: backgroundColor || token.colorWhite,
        borderRadius: 4,
        boxShadow:
          '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
        color: token.colorPrimary,
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative', // 添加相对定位
      }}
    >
      {children}
    </div>
  );
};
