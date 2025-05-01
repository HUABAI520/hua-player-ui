import {
  formatDateYMD,
  getFirstDayOfLastMonth,
  getFirstDayOfMonth,
  getMonthInfo,
  getYearAndMonthByDate,
} from '@/common/utils/DateUtils';
import { CommonFeature, CommonPlay } from '@/pages/User/My/components/CommonPlay';
import { DailysPlay } from '@/pages/User/My/components/DailysPlay';
import { getBetweenFeatures, getMonthlyFeatures } from '@/services/api/featuresController';
import { PageContainer } from '@ant-design/pro-components';
import { DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect, useState } from 'react';

const WeeklyTab: React.FC = () => {
  const [generateData, setGenerateData] = useState<CommonFeature | undefined>();
  const [dailysPlayData, setDailysPlayData] = useState<API.DailyUserFeatures[]>([]);
  // 获取上个月第一天
  const [startDay, setStartDay] = useState<string>(getFirstDayOfLastMonth(new Date()));
  const { days } = getMonthInfo(startDay);
  const getDateCount = async () => {
    const { lastDay } = getMonthInfo(startDay);
    const res = await getBetweenFeatures({
      startDate: startDay,
      endDate: lastDay,
    });
    const dateRange = [];
    let currentDate = new Date(startDay);
    const endDate = new Date(lastDay);
    while (currentDate <= endDate) {
      dateRange.push(formatDateYMD(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    const current = dateRange.map((date) => {
      const foundItem = res?.find((item) => item.activityDate === date);
      return {
        activityDate: date as string,
        activities: foundItem ? foundItem.avgDailyActivities : (0 as any),
        totalWatchDuration: foundItem ? foundItem.totalWatchDuration || 0 : (0 as any),
        commentCount: foundItem ? foundItem.commentCount : (0 as any),
        commentsPerHour: foundItem ? foundItem.commentsPerHour : (0 as any),
        collectionCount: foundItem ? foundItem.collectionCount : (0 as any),
        likeCount: foundItem ? foundItem.likeCount : (0 as any),
        effectivePlayCount: foundItem ? foundItem.effectivePlayCount : (0 as any),
        activeDays: foundItem ? foundItem.activeDays : (0 as any),
        avgDailyActivities: foundItem ? foundItem.avgDailyActivities : (0 as any),
        topType: foundItem ? foundItem.topType : ('' as any),
        activePeriod: foundItem ? foundItem.activePeriod : ('' as any),
        sentimentLabel: foundItem ? foundItem.sentimentLabel : ('' as any),
        avgSentiment: foundItem ? foundItem.avgSentiment : (0 as any),
      } as API.DailyUserFeatures;
    });
    setDailysPlayData(current);
  };
  const getAll = () => {
    getMonthlyFeatures({
      monthStartDate: startDay,
    }).then((res) => {
      setGenerateData({
        ...res,
        totalWatchDuration: Number((res?.totalWatchDuration || 0).toFixed(1)),
      } as CommonFeature);
    });
  };
  useEffect(() => {
    getAll();
    getDateCount();
  }, [startDay]);
  const disabledDate = (current: Dayjs) => {
    // 获取当前周数
    // @ts-ignore
    const curMonth = dayjs().month();
    // 获取当前年份
    const currentYear = dayjs().year();
    // 选中周是否在当前年
    const isSameYear = current.year() === currentYear;
    // 选中周是否与当前周相同
    // @ts-ignore
    const isSameMonth = current.month() === curMonth;
    // 禁用条件：同年且同周
    return isSameYear && isSameMonth;
  };
  return (
    <PageContainer title={false} className={'my-layout-pro'}>
      <CommonPlay
        generateData={generateData}
        title={getYearAndMonthByDate(startDay)}
        type={'week'}
        allDay={days}
        selectTime={
          <DatePicker
            value={dayjs(startDay)}
            onChange={(v, date) => {
              setStartDay(getFirstDayOfMonth(v));
            }}
            picker="month"
            maxDate={dayjs(getFirstDayOfLastMonth(new Date()))}
          />
        }
      />
      <DailysPlay data={dailysPlayData} lastDays={days} type={'month'} />
    </PageContainer>
  );
};

export default WeeklyTab;
