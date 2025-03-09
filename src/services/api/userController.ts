// @ts-ignore
/* eslint-disable */
import request from '@/plugins/globalRequest';

/** deleteUsers GET /user/delete */
export async function deleteUsersUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteUsersUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<boolean>('/user/delete', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** getUserLogin GET /user/get/login */
export async function getUserLoginUsingGet(options?: { [key: string]: any }) {
  return request<API.UserVO>('/user/get/login', {
    method: 'GET',
    ...(options || {}),
  });
}

/** userLogin POST /user/login */
export async function userLoginUsingPost(
  body: API.UserLoginRequest,
  options?: { [key: string]: any },
) {
  return request<API.LoginResult>('/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function userLoginMailUsingPost(
  params: {
    email: string;
    code: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.LoginResult>('/user/login/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** userLogout POST /user/logout */
export async function userLogoutUsingPost(options?: { [key: string]: any }) {
  return request<boolean>('/user/logout', {
    method: 'POST',
    ...(options || {}),
  });
}

/** userRegister POST /user/register */
export async function userRegisterUsingPost(
  body: API.UserRegisterRequest,
  options?: { [key: string]: any },
) {
  return request<number>('/user/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

// 获取登录验证码
export async function getLoginEmail(params: { email: string }, options?: { [key: string]: any }) {
  return request<boolean>('/user/login/email', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
export async function getRegisterEmail(
  params: { email: string },
  options?: { [key: string]: any },
) {
  return request<boolean>('/user/register/email', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
export async function getUpdateMailEmail(
  params: { email: string },
  options?: { [key: string]: any },
) {
  return request<boolean>('/user/update/email', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
/** updateUser POST /user/update */
export async function updateUserUsingPost(body: API.UserVO, options?: { [key: string]: any }) {
  return request<boolean>('/user/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
export async function updatePasswordUsingPut(
  body: API.UpdatePasswordRequest,
  options?: { [key: string]: any },
) {
  return request<boolean>('/user/update/password', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function uploadFile(
  file: File, // 改为直接接收文件对象,
  options?: { [key: string]: any },
) {
  const formData = new FormData();
  formData.append('file', file); // 添加文件到表单数据
  return request<string>('/user/upload', {
    method: 'POST',
    data: formData, // 发送 FormData 对象
    ...(options || {}),
  });
}
