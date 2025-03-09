import { ProFormSelect, StepsForm } from '@ant-design/pro-components';

import { ChAEn } from '@/common/CommodityType';
import { useModel } from '@@/exports';
import { Form, message, Modal } from 'antd';
import React, { SetStateAction, useEffect, useState } from 'react';

interface TestProps {
  stepTitle: ChAEn;
  addCommodity: (param: any) => Promise<boolean>;
  // dynamicComponent: React.ReactElement;
  dynamicComponent: React.ReactElement<{
    onResultChange: (result: any) => void;
    onAllChange: (all: any) => void;
  }>; // 更新 dynamicComponent 类型声明
  easyComponent: React.ReactElement;
  open: boolean;
  onCancel: any;
  onReload: any;
}

const StepForm: React.FC<TestProps> = ({
  stepTitle,
  addCommodity,
  dynamicComponent,
  open,
  onCancel,
  easyComponent,
  onReload,
}) => {
  const { initialState } = useModel('@@initialState');

  const [addType, setAddType] = useState('1'); // 'single' 表示详细添加，'multiple' 表示直接添加
  const [formData, setFormData] = useState({
    freightSpaceId: '',
    arrayNum: '',
  });
  const [openCompound, setOpenCompound] = useState(false);
  const [goodName, setGoodName] = useState<string>();
  const options = [{ value: '1', label: '详细添加' }];
  const [formDataFromBackend, setFormDataFromBackend] = useState({
    goodName: '',
    foundationCondition: '',
    model: '',
    viewModel: '',
  });
  const [form] = Form.useForm();
  const clear = () => {
    // 添加成功 清空数据
    setFormData({
      freightSpaceId: '',
      arrayNum: '',
    });
    setFormDataFromBackend({
      goodName: '',
      foundationCondition: '',
      model: '',
      viewModel: '',
    });
  };
  const cancelDo = () => {
    clear();
    onCancel();
  };
  const handleValuesChange = (changedValues: any, allValues: SetStateAction<any>) => {
    setFormData(allValues);
  };
  //formData发生变化时更新到formDataFromBackend
  useEffect(() => {
    // Combine values from formData and formDataFromBackend
    setFormDataFromBackend((prevData) => ({
      ...prevData,
      ...formData,
    }));
    // alert(3 + JSON.stringify(formDataFromBackend));
  }, [formData]);

  const handleFinish = async () => {
    let res;

    // 处理后的 formData 因为有个组件传的值有问题，所以需要处理下ProFormCascader这个组件
    const updatedFormData = {
      ...formDataFromBackend,
      freightSpaceId: formData.freightSpaceId?.[1], // 这个的formData可以不变
      arrayNum: formData.arrayNum?.[1],
      goodName: formDataFromBackend.goodName || undefined, // 不存在去除
      model: formDataFromBackend.model || undefined,
      foundationCondition: formDataFromBackend.foundationCondition || undefined,
      viewModel: formDataFromBackend.viewModel || undefined,
    };
    //执行 参数：addCommodity 的添加方法
    res = await addCommodity({
      ...updatedFormData,
    });
    if (res) {
      message.success('提交成功');
      form.resetFields();
      onReload(); // 刷新表格数据
      setAddType('1');
      onCancel();
      if (formDataFromBackend.goodName) {
        setGoodName(formDataFromBackend.goodName);
        setOpenCompound(true);
        // alert(formDataFromBackend.goodName);
      }
      // if (stepTitle.English === CommodityName.Display?.English) {
      //   if (formDataFromBackend.foundationCondition === '无底座') {
      //     if (formDataFromBackend.viewModel === '') {
      //       message.error('未填写型号！不支持添加入配件合成！');
      //       clear();
      //       return Promise.resolve(true);
      //     }
      //     setGoodName(formDataFromBackend.viewModel + '无底座');
      //     setOpenCompound(true);
      //   }
      // }
      clear();
      return Promise.resolve(true);
    } else {
      message.error('提交失败');
    }
  };

  const handleResultChange = (value: any) => {
    // 为了将后端传递过来的初始值显示在表单中，value通过子组件传递过来从后端获取的值
    setFormDataFromBackend((prevData) => ({
      ...prevData,
      ...value,
    }));
    //或者直接更新formData，便监听后更新setFormDataFromBackend
    // setFormData(value);
    // alert(3 + JSON.stringify(formDataFromBackend));
  };
  const handleAllChange = (value: string[]) => {
    // 为了将后端传递过来的初始值显示在表单中，value通过子组件传递过来从后端获取的值
    setFormDataFromBackend((prevData) => ({
      ...prevData,
      permissionIdList: value,
    }));
  };

  const renderAddForms = () => {
    let formContent = null;
    if (addType === '1') {
      formContent = (
        <StepsForm.StepForm name="single" title="详细添加">
          {React.cloneElement(dynamicComponent, {
            onResultChange: handleResultChange,
            onAllChange: handleAllChange,
          })}
        </StepsForm.StepForm>
      );
    } else if (addType === '2') {
      formContent = (
        <StepsForm.StepForm name="multiple" title="直接添加">
          {/* 直接添加的表单项 */}
          {easyComponent}
        </StepsForm.StepForm>
      );
    }
    return formContent;
  };

  return (
    <>
      {/*<Button type="primary" onClick={() => setVisible(true)}>*/}
      {/*  <PlusOutlined />*/}
      {/*  {stepTitle.Chinese + '添加'}*/}
      {/*</Button>*/}
      <StepsForm
        //@ts-ignore
        formRef={form}
        onFinish={handleFinish}
        formProps={{
          validateMessages: {
            required: '此项为必填项',
          },
          onValuesChange: handleValuesChange,
        }}
        stepsFormRender={(dom, submitter) => {
          // @ts-ignore
          return (
            <Modal
              title={stepTitle.Chinese + '添加'}
              width={800}
              onCancel={cancelDo}
              open={open}
              footer={submitter}
              destroyOnClose
            >
              {dom}
            </Modal>
          );
        }}
      >
        <StepsForm.StepForm
          name="base"
          title="选择添加方式"
          initialValues={{ remark2: '1' }}
          onFinish={async () => {
            return true;
          }}
        >
          <ProFormSelect
            label="添加方式"
            name="remark2"
            width="md"
            initialValue="1"
            options={options}
            allowClear={false} // 设置为 false，禁止清空
            onChange={(value) => {
              // @ts-ignore
              if (!isOptionVisible) {
                setAddType('1');
              } else {
                // @ts-ignore
                setAddType(value);
              }
            }} // 在选择发生变化时设置 addType
          />
        </StepsForm.StepForm>

        {/* 根据选择的添加方式渲染不同的表单 */}
        {renderAddForms()}
      </StepsForm>
    </>
  );
};

export default StepForm;
