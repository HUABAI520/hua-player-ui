// @ts-ignore
/* eslint-disable */
import request from '@/plugins/globalRequest';

/** 此处后端没有提供注释 GET /contentReview/query */
export async function queryPage(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.queryPageParams,
  options?: { [key: string]: any },
) {
  return request<API.PageContentReviewQueryResp>('/contentReview/query', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /contentReview/query/record */
export async function queryRecordPage(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.queryRecordPageParams,
  options?: { [key: string]: any },
) {
  return request<API.PageReportRecordResp>('/contentReview/query/record', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /contentReview/report */
export async function addReport(body: API.ReportAddReq, options?: { [key: string]: any }) {
  return request<boolean>('/contentReview/report', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /contentReview/review */
export async function review(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.reviewParams,
  options?: { [key: string]: any },
) {
  return request<boolean>('/contentReview/review', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
