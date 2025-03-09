export const highlightKeyword = (text: string, keyword: string, highlightColor = 'red') => {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(
    regex,
    (match) => `<span style={{ color: '${highlightColor}' }}>${match}</span>`,
  );
};
