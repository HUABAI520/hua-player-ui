import React, { useEffect, useRef, useState } from 'react';
import { Button, Flex, message, Rate } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { addRating, getRating, updateRating } from '@/services/api/ratingController';

interface props {
  animeId: number;
  defaultValue: number | undefined;
  setDefaultValue: (value: number) => void;
  old?: { id: number | undefined; score: number | undefined };
  onResult?: (data: { id: number; score: number }) => void;
}

export const UserRating: React.FC<props> = ({
  defaultValue,
  animeId,
  old,
  setDefaultValue,
  onResult,
}) => {
  const params = useRef<API.RatingUpdateReq>({
    animeId: animeId,
    score: defaultValue || 0,
    id: undefined,
    oldScore: undefined,
    comment: undefined,
  });
  const [comment, setComment] = useState<string>('');
  const get = async () => {
    const res = await getRating({ id: animeId });
    setComment(res?.comment);
  };
  useEffect(() => {
    get();
  }, [old?.id]);
  const addOrUpdate = async () => {
    params.current.comment = comment;
    params.current.score = (defaultValue || 0.5) * 2;
    if (old?.id) {
      params.current.id = old.id;
      params.current.oldScore = old.score;
      const id = await updateRating(params.current);
      if (id < 0) {
        message.error('评分失败了~');
      }
      if (onResult) {
        onResult({ id: id, score: params.current.score });
      }
    } else {
      const id = await addRating(params.current);
      if (id < 0) {
        message.error('评分失败了~');
      }
      if (onResult) {
        onResult({ id: id, score: params.current.score });
      }
    }
  };
  return (
    <Flex vertical gap={'12px'}>
      <Rate
        value={defaultValue}
        allowHalf
        onChange={(value) => {
          params.current.score = value;
          setDefaultValue(value);
        }}
      />
      <TextArea
        maxLength={100}
        value={comment}
        rows={7}
        autoFocus
        showCount
        onChange={(v) => {
          setComment(v.target.value);
        }}
      />
      <Flex justify={'center'}>
        <Button
          size={'large'}
          type={'primary'}
          onClick={addOrUpdate}
          disabled={params.current.score === 0}
        >
          {old ? '更新' : '提交'}
        </Button>
      </Flex>
    </Flex>
  );
};
