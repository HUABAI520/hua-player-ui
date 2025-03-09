import React from 'react';
import { Flex, theme, Typography } from 'antd';
import { Input, Tooltip } from 'antd';
import { useModel } from '@umijs/max';
import { CheckOutlined, HighlightOutlined } from '@ant-design/icons';

interface InfoDisplayProps {
  label: string;
  value: string | undefined;
  useTooltip?: boolean;
  onChange?: (value: string) => void;
  rows?: number;
}

const { useToken } = theme;
const { Paragraph } = Typography;
// 展示且修改组件
const UpInDisplay = ({
  label,
  value,
  useTooltip = false,
  onChange,
  rows = 1,
}: InfoDisplayProps) => {
  const { token } = useToken();
  const content = (
    <Paragraph
      ellipsis={{ tooltip: `${value}`, rows: rows }}
      style={{ margin: 0, width: '100%' }}
      editable={{
        icon: <HighlightOutlined style={{ color: token.colorPrimary }} />,
        onChange: (v) => {
          if (onChange) {
            onChange(v);
          }
        },
        tooltip: false,
        enterIcon: <CheckOutlined />,
      }}
    >
      {value}
    </Paragraph>
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

export default UpInDisplay;
