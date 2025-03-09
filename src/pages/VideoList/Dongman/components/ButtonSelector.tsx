import React, { useEffect, useRef } from 'react';
import { ConfigProvider, Radio } from 'antd'; // 确保引入正确的组件

interface ButtonSelectorProps {
  label: string;
  options: { label: string; value: string | any }[];
  value: string | number | undefined;
  onChange: (value: any) => void;
  style?: React.CSSProperties;
}

const ButtonSelector = ({ label, options, value, onChange, style }: ButtonSelectorProps) => {
  const divCss = {
    fontWeight: 'bold',
    color: '#999',
    marginRight: '8px',
    lineHeight: '30px',
    fontSize: '14px',
    whiteSpace: 'nowrap',
  };

  const containerStyle = {
    display: 'flex',
    whiteSpace: 'wrap',
    alignItems: 'flex-start', // 垂直方向顶部对齐
    marginTop: '10px',
    width: 'auto',
    ...style,
  };

  const radioGroupContainerStyle = {
    flexGrow: 1,
    minWidth: '0', // 防止容器宽度超过父容器
    display: 'flex',
    whiteSpace: 'wrap', // 允许选择项换行
  };

  const radioGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (radioGroupRef.current) {
      radioGroupRef.current.style.setProperty('--button-count', options.length.toString());
    }
  }, [options.length]);

  return (
    <div style={containerStyle}>
      {/* Label 部分 */}
      <div style={divCss}>{label}</div>

      {/* Radio Group 部分 */}
      <div style={radioGroupContainerStyle} ref={radioGroupRef}>
        <ConfigProvider wave={{ disabled: true }}>
          <Radio.Group
            style={{ display: 'flex', flexWrap: 'wrap' }}
            value={value}
            onChange={onChange}
            options={options}
            optionType="button"
            buttonStyle="outline"
            className={'my-radio-button'}
          />
        </ConfigProvider>
      </div>
    </div>
  );
};

export default ButtonSelector;
