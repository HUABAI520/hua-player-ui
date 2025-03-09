import { ReportTypeList } from '@/common/interaction/InteractionType';
import { addReport } from '@/services/api/contentReviewController';
import { useModel } from '@@/exports';
import { Avatar, Flex, Form, Input, message, Modal, Select, theme } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { FC } from 'react';

const { useToken } = theme;
export const ReportForm: FC<{
  item: any;
  isReportModalVisible: any;
  onClose: () => void;
  contentType: {
    type: number;
    name: string;
  };
}> = ({ item, isReportModalVisible, onClose, contentType }) => {
  const { initialState } = useModel('@@initialState');
  const { settings } = initialState || {};
  const [reportForm] = Form.useForm();
  const { token } = useToken();
  const handleCancelReport = () => {
    onClose();
    reportForm.resetFields();
  };
  const handleReportSubmit = () => {
    reportForm
      .validateFields()
      .then((values) => {
        const { type, reason, reasonDetail } = values;
        addReport({
          thirdType: contentType.type,
          thirdId: item.id,
          type: type,
          reason: reason,
          reasonDetail: reasonDetail,
        }).then((res) => {
          if (res) {
            message.success('举报已提交~');
            onClose();
            reportForm.resetFields();
          }
        });
      })
      .catch((error) => {
        message.error('请填写必填项');
      });
  };

  return (
    <Modal
      title={'举报' + contentType.name}
      open={isReportModalVisible}
      onOk={handleReportSubmit}
      onCancel={handleCancelReport}
    >
      <Form form={reportForm} layout="vertical">
        {/*举报类型 */}
        <Form.Item label={'举报的' + contentType.name + '内容'}>
          <Flex key={item.id} style={{ marginTop: '22px' }}>
            <Avatar size={40} src={item.user?.userAvatar} style={{ margin: '0 16px 0 0' }}></Avatar>
            <Flex flex={1} style={{ width: '100%', padding: '0 0 2px 0' }} align={'start'}>
              <Flex vertical style={{ width: '100%' }}>
                <div>
                  <Flex style={{ margin: '6.6px 0' }}>
                    <span style={{ color: token.colorPrimaryText, fontSize: '13px' }}>
                      {item.user?.username}
                    </span>
                  </Flex>
                  {/*{item.content}/{JSON.stringify(item)}*/}
                  <Flex style={{ width: '100%' }}>
                    <TextArea
                      style={{
                        padding: '0',
                        backgroundColor: 'transparent',
                        color: 'red',
                        // settings && settings.navTheme === 'light'
                        //   ? 'black'
                        //   : 'var(--text--white)',
                        // fontSize: '15px',
                        borderRadius: '0',
                      }}
                      variant="borderless"
                      disabled
                      value={item.content}
                      autoSize={{ minRows: 1 }}
                    />
                  </Flex>
                </div>
              </Flex>
            </Flex>
          </Flex>
        </Form.Item>
        <Form.Item
          name="type"
          label="举报类型"
          rules={[{ required: true, message: '请选择举报类型' }]}
        >
          <Select
            placeholder="请选择举报类型"
            options={ReportTypeList.map((item) => {
              return {
                value: item.type,
                label: item.name,
              };
            })}
          ></Select>
        </Form.Item>

        {/* 举报原因 */}
        <Form.Item
          name="reason"
          label="举报原因"
          rules={[{ required: true, message: '请填写举报原因' }]}
        >
          <Input placeholder="请输入举报原因" showCount maxLength={50} allowClear />
        </Form.Item>

        {/* 举报详细原因 */}
        <Form.Item name="reasonDetail" label="举报详细原因">
          <Input.TextArea
            placeholder="请输入举报详细原因（选填）"
            autoSize={{ minRows: 3, maxRows: 5 }}
            showCount
            maxLength={200}
            allowClear
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
