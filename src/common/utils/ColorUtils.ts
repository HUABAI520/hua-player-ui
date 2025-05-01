export const areColorsEqual = (color1: string, color2: string) => {
  // 去除可能存在的 '#' 前缀，并转换为小写
  const normalizeColor = (color: string) => color.replace('#', '').toLowerCase();

  // 标准化两个颜色值
  const normalizedColor1 = normalizeColor(color1);
  const normalizedColor2 = normalizeColor(color2);

  // 比较两个标准化后的颜色值
  return normalizedColor1 === normalizedColor2;
};
export const hexToRgba = (hex: string, alpha: number = 1) => {
  // 去除可能存在的#符号
  hex = hex.replace(/^#/, '');

  // 检查输入是否为有效的16进制颜色
  if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(hex)) {
    throw new Error('Invalid hex color');
  }

  // 如果是3位的16进制颜色，转换为6位
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  // 将16进制颜色转换为RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // 返回带有透明度的RGB字符串
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
