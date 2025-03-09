import React from 'react';
import { ConfigProvider, DatePicker, Radio } from 'antd'; // 确保引入正确的组件
interface ButtonSelector {
  label: string;
  onChange: (value: any) => void;
}

const RangeSelector = ({ label, onChange }: ButtonSelector) => {
  const { RangePicker } = DatePicker;
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
  };

  const radioGroupContainerStyle = {
    marginLeft: '14px',
    flexGrow: 1,
    minWidth: '0', // 防止容器宽度超过父容器
    display: 'flex',
    whiteSpace: 'wrap', // 允许选择项换行
  };
  return (
    <div style={containerStyle}>
      {/* Label 部分 */}
      <div style={divCss}>{label}</div>

      {/* Radio Group 部分 */}
      <div style={radioGroupContainerStyle}>
        <RangePicker picker="month" onChange={onChange} />
      </div>
    </div>
  );
};

export default RangeSelector;
