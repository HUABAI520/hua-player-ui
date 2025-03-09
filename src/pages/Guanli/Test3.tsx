import { Button } from 'antd';
import { useState } from 'react';
import { SeriesSet } from '@/common/Edit/SeriesSet';
import { getAnimeById } from '@/services/api/animeController';

const Test3 = () => {
  const [open, setOpen] = useState(false);
  const [animeMsg, setAnimeMsg] = useState<API.AnimeIndexResp>();
  const getAnimeData = async () => {
    const res = await getAnimeById({ id: 21 });
    if (res) {
      setAnimeMsg(res);
      return 1;
    }
    return undefined;
  };
  return (
    <>
      <Button
        onClick={() => {
          getAnimeData().then((r) => {
            if (r) setOpen(true);
          });
        }}
      >
        打开系列设置
      </Button>
      <SeriesSet
        msg={animeMsg}
        onClose={() => {
          setOpen(false);
          setAnimeMsg(undefined);
        }}
        open={open}
      />
    </>
  );
};
export default Test3;
