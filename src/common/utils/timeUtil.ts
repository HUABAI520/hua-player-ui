export const formatSeekTime = (seconds: any) => {
  const totalSeconds = Math.floor(seconds); // 将秒数取整
  const minutes = Math.floor(totalSeconds / 60); // 计算分钟数
  const remainingSeconds = totalSeconds % 60; // 计算剩余的秒数
  // 计算小时数
  const hours = Math.floor(minutes / 60);
  // 0小时则返回分钟和秒数
  if (hours === 0) {
    // 格式化分钟和秒数为两位数
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
  }
  // 大于0小时则返回小时、分钟和秒数
  else {
    // 格式化小时、分钟和秒数为两位数
    // 计算剩余的分钟数
    const remainingMinutes = minutes % 60;
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(remainingMinutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }
};
// 用中文展示 比如120s 为2分钟 3600s 为1小时
export const formatSeekTimeToCHEN = (seconds: any) => {
  const totalSeconds = Math.floor(seconds);
  if (totalSeconds < 60) {
    return `${totalSeconds} 秒`;
  } else if (totalSeconds < 3600) {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes} 分钟 ${remainingSeconds} 秒`;
  } else {
    const hours = Math.floor(totalSeconds / 3600);
    const remainingMinutes = Math.floor((totalSeconds % 3600) / 60);
    // 还有s
    const remainingSeconds = totalSeconds % 60;
    return `${hours} 小时 ${remainingMinutes} 分钟 ${remainingSeconds} 秒`;
  }
};
