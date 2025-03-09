import { KindAdd } from '@/common/Edit/KindAdd';
import { addAnime, updateAnime } from '@/services/api/animeController';
import { getTypeAll } from '@/services/api/typeController';
import { PlusCircleOutlined } from '@ant-design/icons';
import { ProFormSelect, ProFormText } from '@ant-design/pro-components';
import ProForm, {
  ProFormDateTimePicker,
  ProFormRadio,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { Button, Flex, Form, message, Modal, Select } from 'antd';
import React, { useEffect, useState } from 'react';

interface AnimeAdOrUpProps {
  open: boolean;
  cancelDo: () => void;
  animeMsg?: API.AnimeIndexResp;
  reload?: () => void;
  reloadKinds?: (values: API.HuaType[]) => void;
}

export const AnimeAdOrUp: React.FC<AnimeAdOrUpProps> = ({
  open,
  cancelDo,
  animeMsg,
  reload,
  reloadKinds,
}) => {
  const [types, setTypes] = useState<API.HuaType[]>();
  const [form] = Form.useForm();
  const [typeAddOpen, setTypeAddOpen] = useState(false);

  const setAnimeData = async () => {
    form.setFieldValue('name', animeMsg?.name);
    form.setFieldValue('director', animeMsg?.director);
    form.setFieldValue('intro', animeMsg?.intro);
    form.setFieldValue('issueTime', animeMsg?.issueTime);
    form.setFieldValue('month', animeMsg?.month);
    form.setFieldValue('isNew', animeMsg?.isNew);
    form.setFieldValue('status', animeMsg?.status);
    form.setFieldValue('language', animeMsg?.language);
    form.setFieldValue('type', animeMsg?.type);
    form.setFieldValue('id', animeMsg?.id);
    form.setFieldValue('another', animeMsg?.another);
    form.setFieldValue('actRole', animeMsg?.actRole?.join(','));
  };
  useEffect(() => {
    if (animeMsg?.kind) {
      // kind 是 名称列表 找出每个对应的id组成的ids[]
      const ids = animeMsg?.kind.map((name) => types?.find((item) => item.type === name)?.id);
      form.setFieldValue('kindIds', ids);
    }
  }, [types]);
  const getTypes = async () => {
    const res = await getTypeAll();
    setTypes(res);
  };
  useEffect(() => {
    getTypes();
  }, []);
  useEffect(() => {
    setAnimeData();
  }, [animeMsg]);

  return (
    <>
      <ProForm
        form={form}
        onFinish={async (values) => {
          const act = values.actRole;
          let a: string[] | undefined;
          if (act) {
            act.replace('，', ',');
            act.replace('、', ',');
            act.replace('/', ',');
            act.replace(' ', '');
            act.replace(' ', '');
            a = act.split(',').map((item: string) => item.trim());
          }
          if (animeMsg?.id) {
            const res = await updateAnime({
              ...values,
              id: animeMsg?.id,
              actRole: (a && [...a]) || undefined,
            });
            if (res) {
              cancelDo();
              if (reload) {
                reload();
              }
              message.success('修改' + values.name + '成功~');
              // 清空表单数据
              form.resetFields();
            }
          } else {
            const res = await addAnime({
              ...values,
              actRole: (a && [...a]) || undefined,
            });

            if (res) {
              cancelDo();
              if (reload) {
                reload();
              }
              message.success('新增' + values.name + '成功~');
              // 清空表单数据
              form.resetFields();
            }
          }
        }}
        layout={'vertical'}
        style={{ marginBottom: '16px' }} // 添加样式设置底部间距为16px
      >
        <Flex gap={'large'} style={{ width: '100%' }} justify={'space-between'}>
          <ProFormText
            label={'名称'}
            name="name"
            placeholder="请输入名称"
            width={'sm'}
            rules={[{ required: true, message: '动漫名不能为空' }]}
          />
          <ProFormText
            label={'导演'}
            name="director"
            placeholder="请输入导演"
            width={'sm'}
            rules={[{ required: true, message: '导演不能为空' }]}
          />
        </Flex>

        <Flex gap={'large'} style={{ width: '100%' }} justify={'space-between'}>
          <ProFormText label={'状态'} name="status" placeholder="请输入状态" width={'sm'} />
          <ProFormDateTimePicker
            label={'发行日期'}
            name="issueTime"
            width={'sm'}
            placeholder={'请选择日期'}
          />
        </Flex>
        <Flex gap={'large'} style={{ width: '100%' }} justify={'space-between'}>
          <ProFormRadio.Group
            label={'新番？'}
            name="isNew"
            placeholder="请选择"
            width={'sm'}
            rules={[{ required: true, message: '必选' }]}
            options={[
              {
                label: '是',
                value: 1,
              },
              {
                label: '不是',
                value: 0,
              },
            ]}
          />
          <ProFormSelect
            label={'语言'}
            name="language"
            options={[
              { label: '全部', value: undefined },
              { label: '普通话', value: '普通话' },
              { label: '英语', value: '英语' },
              { label: '日语', value: '日语' },
              { label: '四川话', value: '四川话' },
              { label: '港语', value: '港语' },
              { label: '粤语', value: '粤语' },
            ]}
            placeholder="请输入语言"
            width={'sm'}
            rules={[{ required: true, message: '语言不能为空' }]}
          />
        </Flex>
        <Flex gap={'large'} style={{ width: '100%' }} justify={'space-between'}>
          <ProFormRadio.Group
            label={'类型'}
            name="type"
            placeholder="请选择"
            width={'sm'}
            rules={[{ required: true, message: '必选' }]}
            options={[
              {
                label: 'TV',
                value: 1,
              },
              {
                label: '剧场版',
                value: 0,
              },
            ]}
          />
          <ProFormText
            name="actRole"
            label="演员名称"
            width={'sm'}
            placeholder="请输入演员名称，用逗号分隔"
          />
        </Flex>
        <Flex gap={'large'} style={{ width: '100%' }} justify={'space-between'}>
          <ProFormRadio.Group
            label={'月份'}
            name="month"
            placeholder="请选择"
            width={'sm'}
            rules={[{ required: true, message: '必选' }]}
            options={[
              {
                label: '1月',
                value: 1,
              },
              {
                label: '4月',
                value: 4,
              },
              {
                label: '7月',
                value: 7,
              },
              {
                label: '10月',
                value: 10,
              },
            ]}
          />

          <Form.Item name="kindIds" label="类型" rules={[{ required: true, message: '必选' }]}>
            <Select
              style={{ width: '219px' }}
              mode="multiple"
              showSearch
              optionFilterProp="label"
              placeholder="请选择类型"
              dropdownRender={(menu) => (
                <div>
                  {menu}
                  <div style={{ display: 'grid', placeItems: 'center' }}>
                    <Button
                      style={{ marginTop: 10, width: '100%' }}
                      onClick={() => {
                        setTypeAddOpen(true);
                      }}
                      size="small"
                      type="text"
                      icon={<PlusCircleOutlined />}
                    ></Button>
                  </div>
                </div>
              )}
              options={types?.map((item) => ({
                label: item.type,
                value: item.id,
              }))}
            />
          </Form.Item>
        </Flex>
        <ProFormText label={'别名'} name="another" placeholder="请输入别名，用/分隔" />
        <ProFormTextArea label={'简介'} name="intro" placeholder="请输入简介" />
      </ProForm>
      <Modal
        title="添加类型"
        open={typeAddOpen}
        onCancel={() => setTypeAddOpen(false)}
        footer={null}
      >
        <KindAdd
          onCloseRefresh={(values) => {
            setTypeAddOpen(false);
            setTypes(values);
            if (reloadKinds) {
              reloadKinds(values);
            }
          }}
        />
      </Modal>
    </>
  );
};
