// @ts-ignore
/* eslint-disable */
import request from '@/plugins/globalRequest';

/** 此处后端没有提供注释 GET /barrage */
export async function getBarrages(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getBarragesParams,
  options?: { [key: string]: any },
) {
  return request<API.CursorPageBarrageResp>('/barrage', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /barrage */
export async function addBarrage(body: API.BarrageAddReq, options?: { [key: string]: any }) {
  return request<boolean>('/barrage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
