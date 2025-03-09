import React, { useState, useEffect, useRef } from 'react';
import { Tooltip } from 'antd';

interface CountdownProps {
  targetDate?: Date; // 倒计时目标日期
  s?: number; // 倒计时秒数 如果目标日期存在 默认使用目标日期
  onEnd?: () => void; // 倒计时结束时的回调函数
  onClick?: () => void;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate, onEnd, s = 10, onClick }) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(
    targetDate ? Math.floor((targetDate.getTime() - new Date().getTime()) / 1000) : s,
  );
  const [isActive, setIsActive] = useState(true); // 控制倒计时是否显示
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive) return; // 如果倒计时被禁用，则直接返回

    const tick = () => {
      setSecondsLeft((prevSecondsLeft) => {
        const remaining = targetDate
          ? Math.floor((targetDate.getTime() - new Date().getTime()) / 1000)
          : prevSecondsLeft - 1;

        if (remaining <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (onEnd) onEnd();
          return 0;
        }
        return remaining;
      });
    };

    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [targetDate, onEnd, isActive]);

  // 点击后禁用倒计时器
  const handleClick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsActive(false); // 禁用倒计时
    setSecondsLeft(0); // 将倒计时设置为0
    if (intervalRef.current) clearInterval(intervalRef.current); // 停止倒计时
    if (onClick) {
      onClick();
    }
  };

  return (
    <div>
      {isActive && secondsLeft > 0 && (
        <Tooltip title={'点击取消'}>
          <span style={{ cursor: 'pointer', color: 'red' }} onClick={handleClick}>
            {secondsLeft} s
          </span>
        </Tooltip>
      )}
    </div>
  );
};

export default Countdown;
