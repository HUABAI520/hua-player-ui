import { CommonFeature, CommonPlay } from '@/pages/User/My/components/CommonPlay';

import {
  formatDateByString,
  formatDateYMD,
  getDaysDifferenceByStr,
  getLastSunday,
  getPreviousDate,
} from '@/common/utils/DateUtils';
import { DailysPlay } from '@/pages/User/My/components/DailysPlay';
import {
  getAllFeatures,
  getBetweenCountFeatures,
  getBetweenFeatures,
} from '@/services/api/featuresController';
import { useModel } from '@@/exports';
import { PageContainer } from '@ant-design/pro-components';
import React, { useEffect, useRef, useState } from 'react';

const OverviewTab: React.FC = () => {
  const [generateData, setGenerateData] = useState<CommonFeature | undefined>();
  const lastSunday = useRef<string>(getLastSunday());
  const [lastDays, setLastDays] = useState<number>(90);
  const [dailysPlayData, setDailysPlayData] = useState<API.DailyUserFeatures[]>([]);
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const getDateCount = async (last90Days: string | null) => {
    if (!last90Days) return;
    return await getBetweenCountFeatures({
      startDate: last90Days,
      endDate: lastSunday.current,
    });
  };
  const getDailyPlayData = () => {
    const last90Days = getPreviousDate(lastSunday.current, lastDays);
    if (!last90Days) return;
    getBetweenFeatures({
      startDate: last90Days,
      endDate: lastSunday.current,
    }).then((res) => {
      // 创建从 last90Days 到 lastSunday 的每一天的日期数组
      const dateRange = [];
      let currentDate = new Date(last90Days);
      const endDate = new Date(lastSunday.current);

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
    });
  };
  const getAll = () => {
    getAllFeatures().then(async (res1) => {
      // 计算上周末前90天的日期
      const last90Days = getPreviousDate(lastSunday.current, lastDays);
      if (lastSunday && last90Days) {
        setGenerateData({
          ...res1,
          // 根据,分割成列表
          top_10_types: res1.top10Types?.split(','),
          // 保留两位小数
          totalWatchDuration: Number((res1?.totalWatchDuration || 0).toFixed(1)),
        } as CommonFeature);
      }
    });
  };
  const getBet = () => {
    const last90Days = getPreviousDate(lastSunday.current, lastDays);
    if (!last90Days) return;
    getDateCount(last90Days).then((res) => {
      // 创建从 last90Days 到 lastSunday 的每一天的日期数组
      const dateRange = [];
      let currentDate = new Date(last90Days);
      const endDate = new Date(lastSunday.current);

      while (currentDate <= endDate) {
        dateRange.push(formatDateYMD(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      // 遍历日期范围数组，生成 current 数据
      const current = dateRange.map((date) => {
        const foundItem = res?.find((item) => item.activityDate === date);
        return {
          date: date as string,
          activities: foundItem ? foundItem.avgDailyActivities : (0 as any),
        };
      });
      setGenerateData((prevState) => {
        if (!prevState) return prevState;
        return {
          ...prevState,
          current: current,
        };
      });
    });
  };
  useEffect(() => {
    getAll();
  }, []);
  useEffect(() => {
    // 延时500ms
    setTimeout(() => {
      getBet();
      getDailyPlayData();
    }, 500);
  }, [lastDays]);

  return (
    <PageContainer title={false} className={'my-layout-pro'}>
      <CommonPlay
        generateData={generateData}
        title={'从' + formatDateByString(currentUser?.createTime) + '注册以来'}
        type={'all'}
        allDay={getDaysDifferenceByStr(currentUser?.createTime) || 0}
      />
      <DailysPlay
        data={dailysPlayData}
        lastDays={lastDays}
        type={'all'}
        setLastDays={setLastDays}
      />
    </PageContainer>
  );
};

export default OverviewTab;
