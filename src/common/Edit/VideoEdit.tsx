import { updateVideoName } from '@/services/api/animeController';
import { Button, Flex, Form, Input, message } from 'antd';
import React from 'react';

interface VideoEditProps {
  video: API.AnimeVideosResp | undefined;
  reload: () => void;
  onCancel: () => void;
}

export const VideoEdit: React.FC<VideoEditProps> = ({ video, reload, onCancel }) => {
  const [form] = Form.useForm();
  return (
    <>
      <Form form={form} layout="horizontal">
        <Form.Item>
          <Form.Item name="rank" label="视频排序(表示第几集)" initialValue={video?.rank}>
            <Input disabled defaultValue={video?.rank} />
          </Form.Item>
          <Form.Item
            name="title"
            label="视频标题"
            initialValue={video?.title}
            rules={[
              { required: true, message: '请输入视频标题' },
              {
                max: 20,
                message: '视频标题不能超过20个字符',
              },
            ]}
          >
            <Input defaultValue={video?.title} />
          </Form.Item>
        </Form.Item>
        <Flex justify={'end'}>
          <Button
            type="primary"
            onClick={async () => {
              const { title } = await form.validateFields();
              if (!video?.id || !title) return;
              const res = await updateVideoName({
                videoId: video?.id,
                name: title,
              });
              if (res) {
                message.success('修改成功');
                reload();
                onCancel();
              }
            }}
          >
            修改
          </Button>
        </Flex>
      </Form>
    </>
  );
};
