// @ts-ignore
/* eslint-disable */
import request from '@/plugins/globalRequest';

/** 此处后端没有提供注释 GET /comment */
export async function queryComment(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.queryCommentParams,
  options?: { [key: string]: any },
) {
  return request<API.PageCommentResp>('/comment', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /comment */
export async function addComment(body: API.CommentAddReq, options?: { [key: string]: any }) {
  return request<API.AddCommentResp>('/comment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /comment */
export async function deleteComment(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteCommentParams,
  options?: { [key: string]: any },
) {
  return request<boolean>('/comment', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
