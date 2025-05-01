import { CommonFeature, CommonPlay } from '@/pages/User/My/components/CommonPlay';
import { getBetweenFeatures } from '@/services/api/featuresController';
import { PageContainer } from '@ant-design/pro-components';
import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';

export const DailyModal: React.FC<{
  day: string | undefined;
  setDailyPlay: (day: string | undefined) => void;
}> = ({ day, setDailyPlay }) => {
  const [generateData, setGenerateData] = useState<CommonFeature | undefined>();
  const getAll = (day: string) => {
    getBetweenFeatures({
      startDate: day,
      endDate: day,
    }).then((res) => {
      setGenerateData({
        ...res[0],
        totalWatchDuration: Number((res?.[0]?.totalWatchDuration || 0).toFixed(1)),
      } as CommonFeature);
    });
  };
  useEffect(() => {
    if (!day) {
      setGenerateData({});
      return;
    }
    getAll(day);
    // Modal的内容滚动到顶部
    setTimeout(() => {
      const modalContent = document.querySelector('.shang-anime');
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    }, 0);
  }, [day]);
  return (
    <Modal
      open={!!day}
      classNames={{
        body: 'shang-anime',
      }}
      onCancel={() => setDailyPlay(undefined)}
      width={'80vw'}
      bodyStyle={{
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
      footer={null}
    >
      <PageContainer title={false} className={'my-layout-pro'}>
        {day && <CommonPlay generateData={generateData} title={day} type={'week'} allDay={1} />}
      </PageContainer>
    </Modal>
  );
};
