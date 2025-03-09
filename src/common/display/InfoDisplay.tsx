import React from 'react';
import { Flex, theme } from 'antd';
import { Input, Tooltip } from 'antd';
import { useModel } from '@umijs/max';

interface InfoDisplayProps {
  label: string;
  value: string | undefined;
  useTooltip?: boolean;
}
const { useToken } = theme;
const InfoDisplay = ({ label, value, useTooltip = false }: InfoDisplayProps) => {
  const { initialState } = useModel('@@initialState');
  const { settings } = initialState || {};
  const { token } = useToken();
  const content = (
    <Input
      value={value}
      disabled
      variant="borderless"
      style={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        color: settings && settings.navTheme === 'light' ? 'black' : 'var(--text--white)',
        textOverflow: 'ellipsis',
        padding: 0,
        backgroundColor: 'transparent',
        fontSize: '16px',
        flex: 1, // 占据剩余空间
      }}
    />
  );

  return (
    <Flex align={'center'} justify="start" style={{ fontSize: '16px', width: '100%' }}>
      <div
        style={{
          fontWeight: 'bold',
          color: token.colorPrimaryText,
          marginRight: '8px',
          whiteSpace: 'nowrap',
          flexShrink: 0, // 防止换行
        }}
      >
        {label}
      </div>
      {useTooltip ? <Tooltip title={value}>{content}</Tooltip> : content}
    </Flex>
  );
};

export default InfoDisplay;
