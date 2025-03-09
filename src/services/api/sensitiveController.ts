// @ts-ignore
/* eslint-disable */
import request from '@/plugins/globalRequest';

/** 此处后端没有提供注释 POST /sensitive/add */
export async function addSensitiveWord(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.addSensitiveWordParams,
  options?: { [key: string]: any },
) {
  return request<string>('/sensitive/add', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /sensitive/query */
export async function getSensitiveWords(
  body: API.SensitiveQueryReq,
  options?: { [key: string]: any },
) {
  return request<API.SensitiveQueryResp>('/sensitive/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PUT /sensitive/update */
export async function updateSensitiveWord(
  body: API.SensitiveUpdateReq,
  options?: { [key: string]: any },
) {
  return request<string>('/sensitive/update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
