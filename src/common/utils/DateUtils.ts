import dayjs, { Dayjs } from 'dayjs';

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
export const getLastSunday = () => {
  const today = new Date();
  // 计算从今天到上周末星期日的天数差
  const daysToSubtract = today.getDay();

  // 获取上周末的星期日
  const lastSunday = new Date(today);
  lastSunday.setDate(today.getDate() - daysToSubtract);

  return formatDateYMD(lastSunday);
};

// 格式化日期为 YYYY-MM-DD
export const formatDateYMD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，需要加 1
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
// 计算往前多少天的日期
export const getPreviousDate = (targetDate: string, daysAgo: number) => {
  // 将字符串日期转换为 Date 对象
  const date = new Date(targetDate);

  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return null; // 或者抛出错误
  }

  // 计算往前的日期
  const previousDate = new Date(date);
  previousDate.setDate(date.getDate() - daysAgo);

  // 返回格式化后的日期字符串
  return formatDateYMD(previousDate);
};
// 计算现在时间 与之前日期的天数差
export const getDaysDifferenceByStr = (targetDate: string | undefined) => {
  if (!targetDate) return;
  const now = new Date();
  const target = new Date(targetDate);
  const differenceInMilliseconds = now.getTime() - target.getTime();
  return Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
};
export const getDaysDifferenceByDate = (targetDate: Date) => {
  const now = new Date();
  const differenceInMilliseconds = now.getTime() - targetDate.getTime();
  return Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
};

export function getMonthInfo(date: Date | string | number | Dayjs): {
  days: number;
  lastDay: string;
} {
  // 转换为dayjs对象（兼容多种输入格式）
  const month = dayjs(date);

  // 获取当月天数
  const daysInMonth = month.daysInMonth();

  // 获取最后一天日期
  const lastDay = month.endOf('month').format('YYYY-MM-DD');

  return {
    days: daysInMonth,
    lastDay,
  };
}

// 获取提供时间这个月日期字符串
export const getFirstDayOfMonth = (date: Date | string | number | Dayjs) => {
  const month = dayjs(date);
  return month.startOf('month').format('YYYY-MM-DD');
};
// 获取提供时间第一天的日期字符串
export const getFirstDayOfLastMonth = (date: Date | string | number | Dayjs) => {
  const month = dayjs(date);
  return month.subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
};
// 获取某日日期年和月 个数 YYYY年MM月
export const getYearAndMonthByDate = (date: Date | string | number | Dayjs) => {
  const month = dayjs(date);
  return month.format('YYYY年MM月');
};
const seasons = ['春', '夏', '秋', '冬'];
// 获取当前日期的年和季节
export const getYearAndSeasonByDate = (date: Date | string | number | Dayjs) => {
  const month = dayjs(date);
  const season = Math.floor(month.month() / 3);
  return `${month.year()}年${seasons[season]}季`;
};
