import { theme } from 'antd';

const { useToken } = theme;
export const TabDisplay = ({
  title,
  is = true,
  className,
}: {
  title: string;
  is: boolean;
  className?: string;
}) => {
  const { token } = useToken();
  // #d5ebf3 #00aeec
  // colorPrimaryActive
  // colorPrimaryHover
  return (
    <div
      style={{
        cursor: is ? '' : 'pointer',
        backgroundColor: is ? token.colorPrimaryBgHover : '',
        textAlign: 'center', // 使内容水平居中
        whiteSpace: 'nowrap', // 防止内容换行
        display: 'inline', // 使div像行内元素一样显示
        padding: '7px 12px', // 根据需要添加上下内边距
        color: token.colorPrimaryText, // 文本颜色
        fontSize: '14px', // 字体大小
        borderRadius: '8px',
        transition: 'all 0.3s ease-in-out',
      }}
      className={className}
    >
      {title}
    </div>
  );
};
