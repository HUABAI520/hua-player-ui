/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { message, notification } from 'antd';
// import NodeRSA from 'node-rsa';
import { loginPath } from '@/common/GlobalKey';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import 'nprogress/nprogress.css';
import { stringify } from 'qs';
import { extend } from 'umi-request';
/**
 * 解密
 */
/*const decryptData = (encryptedData: string, publicKey: string) => {
  try {
    const key = new NodeRSA();
    key.importKey(publicKey, 'pkcs8-public-pem');
    // 解密数据
    const decrypted = key.decryptPublic(Buffer.from(encryptedData, 'base64'), 'utf8');
    return decrypted;
  } catch (error) {
    console.error('解密出错：', error);
    return null;
  }
};*/

/**
 * 加密
 */
// export const encryptData = async (/*data: string, publicKey: string*/) => {
//   try {
//     const data = {
//       id: 1,
//       name: '张三',
//     };
//     const publicKey: string =
//       'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDwqW1tj9NoVhXjGjdl4STm9ZQAFaxCvY/VGQkbwCHw86XZjNZMtJCCJgEa+0BItw+SQSIQEjSvZcRjW9xcIJlY4SMXM51dRD2A8KYAR3uHcKOpNlmoKNlxF+xlFIJlLIhMgBhcvZ7/tyf9C37zOeeD1trMEbYTYMYGOWudweIExwIDAQAB';
//     const key = new NodeRSA();
//     key.importKey(publicKey, 'pkcs8-public-pem');
//     // 加密数据
//     const encrypted = key.encrypt(JSON.stringify(data), 'base64');
//     message.success('加密后的数据:' + encrypted);
//     const res = await requireKeyUsingGet({
//       e: encrypted,
//     });
//     message.success('解密后的数据:' + res);
//     return encrypted;
//   } catch (error) {
//     console.error('加密出错：', error);
//     return null;
//   }
// };

/**
 * 配置request请求时的默认参数
 */
const request = extend({
  credentials: 'include', // 默认请求是否带上cookie
  prefix:
    process.env.NODE_ENV === 'production'
      ? // ?
        'http://192.168.1.6:9999/api-player'
      : // 'http://192.168.2.2:9999/api-player'
        // ?  // 'http://localhost:8888'
        // ? 'https://l2.ac.cn/api-computer'
        'http://192.168.1.6:9999/api-player',
  // 'http://192.168.2.2:9999/api-player',
  // requestType: 'Form',
  errorHandler: (error: any) => {
    // 请求失败时停止进度条
    // NProgress.done();
    return Promise.reject(error);
  },
  responseInterceptors: [
    (response: any) => {
      // 在这里处理响应数据
      // NProgress.done(); // 请求成功时停止进度条
      return response;
    },
  ],
});
// 存储请求状态的类型
type RequestMap = {
  [key: string]: number;
};

// 存储请求状态
const requestMap: RequestMap = {};

// 防抖函数
const debounceRequest = (url: string): boolean => {
  return true;
  // const currentTime = Date.now();
  // const lastRequestTime = requestMap[url];
  // if (lastRequestTime && currentTime - lastRequestTime < 50) {
  //   // 如果在300毫秒内已经发送过请求，则不发送
  //   console.log(`Request debounced: ${url}`);
  //   return false;
  // }
  //
  // // 存储当前请求的发送时间
  // requestMap[url] = currentTime;
  // return true;
};
/**
 * 所有请求拦截器
 */
request.interceptors.request.use((url, options): any => {
  // 启动进度条
  // NProgress.start();
  // 防抖操作
  const can = debounceRequest(url);
  if (!can) {
    // NProgress.done(); // 请求被阻止时立即停止进度条
    if (url.includes('/noMsg')) {
    } else message.error('请求过于频繁了哟~，请稍后再试！');
    return Promise.reject({
      error: {
        message: '请求过于频繁了哟~，请稍后再试！',
      },
    });
  }
  // 设置超时提示
  console.log(url, options);
  return {
    url,
    options: {
      ...options,
      headers: {},
    },
  };
});
// 构建一个map key:string value:string
const map = new Map<string, string>();
const openNotification = (msg: string) => {
  // 查看 map中是否有msg
  if (map.has(msg)) {
    return;
  }
  // 添加到map中
  map.set(msg, msg);
  const msgs = msg.replace(':', '：').split('：');
  const msg0 = msgs[0]; //
  const msg1 = msgs[1];
  const msg1s = msg1.replace(',', '，').split('，');
  const msg2 = msg1s[0]; // *
  const msg3 = msg1s[1]; //
  notification.open({
    message: (
      <p style={{ color: 'red', fontSize: '16px' }}>
        <ExclamationCircleOutlined /> 警告：权限问题通知
      </p>
    ),
    description: (
      <span>
        {msg0}：<span style={{ color: 'red' }}>{msg2}</span>，{msg3}
      </span>
    ),
    duration: 0,
    onClick: () => {
      console.log('Notification Clicked!');
    },
    onClose: () => {
      // 删除map中的msg
      map.delete(msg);
    },
  });
};
/**
 * 所有响应拦截器
 */
request.interceptors.response.use(async (response, options): Promise<any> => {
  const contentType = response.headers.get('Content-Type');
  // 请求成功后停止进度条
  // NProgress.done();
  console.log(options);
  // const rsaKey = localStorage.getItem(rsa);
  if (contentType && contentType.includes('application/json')) {
    const res = await response.clone().json();
    if (res.code === 0) {
      // 后端返回的是加密的字符串数据，需要解密
      // 使用 rsaKey 公钥 解密rsa加密数据
      // 处理 base64 加密的数据, -生产环境生效-
      // todo 暂时不使用，因为数据一多，加密和解密时间过长
      // if (process.env.NODE_ENV === 'production') {
      //   const data = decryptData(res.data, rsaKey!);
      //   if (!data) {
      //     message.error('登录失效!请刷新浏览器！');
      //     // 删除公钥
      //     localStorage.removeItem(rsa);
      //     return;
      //   }
      //   // 将解密后的数据转为对象
      //   res.data = JSON.parse(data!);
      // }
      return res.data;
    }
    if (res.code === 1) {
      // 获取公钥，不需要解密
      return res.data;
    }
    if (res.code === 40101) {
      openNotification(res.message);
      return;
    }
    if (res.code === 51111) {
      return (res.data = '错误-' + res.message);
    }
    if (res.code === 40100) {
      const { location } = history;
      const { search, pathname } = location;
      // const urlParams = new URL(window.location.href).searchParams;
      /** 此方法会跳转到 redirect 参数所在的位置 */
      // const redirect = urlParams.get('redirect');
      if (location.pathname !== loginPath) {
        // history.push(loginPath);
        history.replace({
          pathname: loginPath,
          search: stringify({
            redirect: pathname + search,
          }),
        });
      }
      return;
    }
    message.error(res.message);
    return res.data;
  } else if (
    contentType &&
    contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  ) {
    // 处理二进制数据，例如 xlsx 文件
    const blob = await response.clone().blob();
    // 在这里可以根据需要处理 blob 数据
    console.log(blob);

    // 返回处理后的数据，或者直接返回 blob
    return blob;
  }

  // 如果不是以上两种类型，则直接返回响应对象
  return response;
});

export default request;
