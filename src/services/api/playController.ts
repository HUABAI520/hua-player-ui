// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 此处后端没有提供注释 GET /api-player/play/video */
export async function video(options?: { [key: string]: any }) {
  return request<any>('/api-player/play/video', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api-player/play/video2/${param0} */
export async function video2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.video2Params,
  options?: { [key: string]: any },
) {
  const { videoId: param0, ...queryParams } = params;
  return request<any>(`/api-player/play/video2/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}
