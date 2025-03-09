export const areColorsEqual = (color1: string, color2: string) => {
  // 去除可能存在的 '#' 前缀，并转换为小写
  const normalizeColor = (color: string) => color.replace('#', '').toLowerCase();

  // 标准化两个颜色值
  const normalizedColor1 = normalizeColor(color1);
  const normalizedColor2 = normalizeColor(color2);

  // 比较两个标准化后的颜色值
  return normalizedColor1 === normalizedColor2;
};
