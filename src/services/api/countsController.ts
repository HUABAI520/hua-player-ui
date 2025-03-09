// @ts-ignore
/* eslint-disable */
import request from '@/plugins/globalRequest';

/** 此处后端没有提供注释 POST /counts */
export async function addCount(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.addCountParams,
  options?: { [key: string]: any },
) {
  return request<null>('/counts', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
