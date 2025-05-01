import { formatDateYMD, getLastSunday, getPreviousDate } from '@/common/utils/DateUtils';
import { CommonFeature, CommonPlay } from '@/pages/User/My/components/CommonPlay';
import { DailysPlay } from '@/pages/User/My/components/DailysPlay';
import { getBetweenFeatures, getWeeklyFeatures } from '@/services/api/featuresController';
import { PageContainer } from '@ant-design/pro-components';
import { DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect, useState } from 'react';

const WeeklyTab: React.FC = () => {
  const [generateData, setGenerateData] = useState<CommonFeature | undefined>();
  const [dailysPlayData, setDailysPlayData] = useState<API.DailyUserFeatures[]>([]);
  const [lastSunday, setLastSunday] = useState<string>(getLastSunday());
  // 因为是一周，所有是前6天
  const [lastDays, setLastDays] = useState<number>(6);
  // const startDate = getPreviousDate(lastSunday, lastDays);
  const getDateCount = async (sunday: string | null) => {
    if (!sunday) return;
    const startDate = getPreviousDate(sunday, lastDays);
    if (!startDate) return;

    const res = await getBetweenFeatures({
      startDate: startDate,
      endDate: sunday,
    });
    const dateRange = [];
    let currentDate = new Date(startDate);
    const endDate = new Date(sunday);
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
  const getAll = (sunday: string) => {
    const startDate = getPreviousDate(sunday, lastDays);
    if (!startDate) return;
    getWeeklyFeatures({
      weekStartDate: startDate,
    }).then((res) => {
      setGenerateData({
        ...res,
        totalWatchDuration: Number((res?.totalWatchDuration || 0).toFixed(1)),
      } as CommonFeature);
    });
  };
  useEffect(() => {
    getAll(lastSunday);
    getDateCount(lastSunday);
  }, [lastSunday]);
  const disabledDate = (current: Dayjs) => {
    // 获取当前周数
    // @ts-ignore
    const currentWeek = dayjs().week();
    // 获取当前年份
    const currentYear = dayjs().year();
    // 选中周是否在当前年
    const isSameYear = current.year() === currentYear;
    // 选中周是否与当前周相同
    // @ts-ignore
    const isSameWeek = current.week() === currentWeek;
    // 禁用条件：同年且同周
    return isSameYear && isSameWeek;
  };
  return (
    <PageContainer title={false} className={'my-layout-pro'}>
      <CommonPlay
        generateData={generateData}
        title={'从' + getPreviousDate(lastSunday, lastDays) + '到' + lastSunday + '这一周'}
        type={'week'}
        allDay={7}
        selectTime={
          <DatePicker
            value={dayjs(lastSunday)}
            picker="week"
            disabledDate={disabledDate}
            // 自定义周显示格式
            format={(value) => {
              const start = value.startOf('week').format('YYYY-MM-DD');
              const end = value.endOf('week').format('YYYY-MM-DD');
              return `${start} ~ ${end}`;
            }}
            // 自定义弹出面板样式
            renderExtraFooter={() => (
              <div style={{ padding: 8, color: '#666' }}>提示：只能选择过去周次，本周不可选</div>
            )}
            onChange={(_, value) => {
              const bet = JSON.stringify(value).replace('"', '').replace('"', '').split('~');
              setLastSunday(bet[1].trim());
            }}
          />
        }
      />

      <DailysPlay
        data={dailysPlayData}
        lastDays={lastDays}
        type={'week'}
        setLastDays={setLastDays}
      />
    </PageContainer>
  );
};

export default WeeklyTab;
