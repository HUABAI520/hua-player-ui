// @ts-ignore
/* eslint-disable */
import request from '@/plugins/globalRequest';

/** 此处后端没有提供注释 PUT /rating */
export async function updateRating(body: API.RatingUpdateReq, options?: { [key: string]: any }) {
  return request<number>('/rating', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /rating */
export async function addRating(body: API.RatingAddReq, options?: { [key: string]: any }) {
  return request<number>('/rating', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /rating */
export async function getRating(params: { id: number }, options?: { [key: string]: any }) {
  return request<API.UserRating>('/rating', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
