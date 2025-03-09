// @ts-ignore
/* eslint-disable */
import request from '@/plugins/globalRequest';

/** 此处后端没有提供注释 POST /anime/add */
export async function addAnime(body: API.AnimeAddReq, options?: { [key: string]: any }) {
  return request<number>('/anime/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /anime/addAPicture */
export async function addAnimeAndPicture(
  body: {
    animeAddReq?: API.AnimeAddReq;
  },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseLong>('/anime/addAPicture', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /anime/get */
export async function getAnimeById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAnimeByIdParams,
  options?: { [key: string]: any },
) {
  return request<API.AnimeIndexResp>('/anime/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /anime/query */
export async function queryAnime(body: API.AnimeQueryReq, options?: { [key: string]: any }) {
  return request<API.PageAnimeIndexResp>('/anime/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /anime/recommend */
export async function getRecommendAnime(options?: { [key: string]: any }) {
  return request<API.AnimeIndexResp[]>('/anime/recommend', {
    method: 'GET',

    ...(options || {}),
  });
}

export async function list(params: { name: string }, options?: { [key: string]: any }) {
  return request<API.AnimeIndexResp[]>('/anime/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PUT /anime/update */
export async function updateAnime(body: API.AnimeUpdateReq, options?: { [key: string]: any }) {
  return request<boolean>('/anime/update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /anime/video/add */
export async function addVideo(body: API.AnimeVideosReq, options?: { [key: string]: any }) {
  return request<number>('/anime/video/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function addOrUp(body: API.VideoRecordAddReq, options?: { [key: string]: any }) {
  return request<number>('/video/record/noMsg/addOrUp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /anime/video/get */
export async function get(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getParams,
  options?: { [key: string]: any },
) {
  return request<API.AnimeVideosResp>('/anime/video/get', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /anime/video/upload/${param0}/${param1} */
export async function uploadVideo(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.uploadVideoParams,
  file: File, // 改为直接接收文件对象
  options?: { [key: string]: any },
) {
  const { fileName: param0, partNumber: param1, total: param2, ...queryParams } = params;
  const formData = new FormData();
  formData.append('file', file); // 添加文件到表单数据
  return request<number>(`/anime/video/upload/${param0}/${param1}/${param2}`, {
    method: 'POST',
    params: {
      ...queryParams,
    },
    data: formData, // 发送 FormData 对象
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PUT /anime/update/picture/${param0} */
export async function updateAnimePicture(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateAnimePictureParams,
  file: File, // 改为直接接收文件对象
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  const formData = new FormData();
  formData.append('file', file); // 添加文件到表单数据
  return request<boolean>(`/anime/update/picture/${param0}`, {
    method: 'PUT',
    params: { ...queryParams },
    data: formData, // 发送 FormData 对象
    ...(options || {}),
  });
}

export async function uploadVideoPicture(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.uploadVideoPicture,
  file: File, // 改为直接接收文件对象
  options?: { [key: string]: any },
) {
  const { animeId: param0, videoId: param1, ...queryParams } = params;
  const formData = new FormData();
  formData.append('file', file); // 添加文件到表单数据
  return request<boolean>(`/anime/update/picture/${param0}/${param1}`, {
    method: 'PUT',
    params: { ...queryParams },
    data: formData, // 发送 FormData 对象
    ...(options || {}),
  });
}

export async function getUploadIndex(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.uploadIndexParams,
  options?: { [key: string]: any },
) {
  const { fileName: param0, ...queryParams } = params;
  return request<number>(`/anime/video/upload/${param0}`, {
    method: 'GET',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}

export async function deleteRecordById(
  params: { recordId: number },
  options?: { [key: string]: any },
) {
  return request<boolean>(`/video/record/${params.recordId}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function deleteRecordAll(options?: { [key: string]: any }) {
  return request<boolean>(`/video/record/all`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /video/record/list */
export async function listRecord(body: API.RecordRequest, options?: { [key: string]: any }) {
  return request<API.PageVideoRecordResp>('/video/record/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
