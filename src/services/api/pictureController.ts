// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET /picture/${param0}/${param1}/${param2} */
export async function getPictureUrl(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPictureUrlParams,
  options?: { [key: string]: any },
) {
  const { kind: param0, id: param1, name: param2, ...queryParams } = params;
  return request<any>(`/picture/${param0}/${param1}/${param2}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}
