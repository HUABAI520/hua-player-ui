import { message } from 'antd';

const copy = (text: string, msg: string = text) => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      console.log('Copying successful!');
      message.success('复制' + msg + '成功');
    } else {
      console.error('Copying was unsuccessful');
      message.error('复制' + msg + '失败');
    }
  } catch (err) {
    console.error('Failed to copy text: ', err);
    message.error('复制' + msg + '失败');
  }
  document.body.removeChild(textarea);
};

export const copyToClipboard = async (text: string, msg: string = text) => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      message.success('复制' + msg + '成功');
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback to document.execCommand if the Clipboard API is not available
      copy(text, msg);
    }
  } else {
    copy(text, msg);
  }
};
