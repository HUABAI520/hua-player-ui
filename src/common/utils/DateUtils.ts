export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
export const formatDateByString = (date: string | undefined) => {
  if (!date) return '';
  const dateObj = new Date(date);
  return formatDate(dateObj);
};
export const calculateTimeDifference = (givenTime: string | undefined): string => {
  if (!givenTime) return '';
  // 将时间字符串转换为Date对象
  const now = new Date();
  const then = new Date(givenTime);

  // 计算时间差（以毫秒为单位）
  const differenceInMilliseconds = now.getTime() - then.getTime();

  // 将时间差转换为分钟
  const differenceInMinutes = Math.abs(differenceInMilliseconds) / 60000;

  // 将时间差转换为小时
  const differenceInHours = Math.abs(differenceInMilliseconds) / 3600000;

  // 将时间差转换为天
  const differenceInDays = Math.abs(differenceInMilliseconds) / 86400000;

  // 根据时间差显示结果
  if (differenceInMinutes < 60) {
    return `${Math.round(differenceInMinutes)} 分钟前`;
  } else if (differenceInHours < 23.9) {
    return `${Math.round(differenceInHours)} 小时前`;
  } else {
    // 如果给定的时间大于或等于一天，则直接显示时间
    return formatDate(then);
  }
};
