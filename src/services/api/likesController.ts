// @ts-ignore
/* eslint-disable */
import request from '@/plugins/globalRequest';
/** 此处后端没有提供注释 POST /likes/like */
export async function like(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.likeParams,
  options?: { [key: string]: any },
) {
  return request<boolean>('/likes/like', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /likes/unlike */
export async function unlike(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.unlikeParams,
  options?: { [key: string]: any },
) {
  return request<boolean>('/likes/unlike', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
