import request from '@/plugins/globalRequest';

/** 此处后端没有提供注释 GET /series */
export async function getOne(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getOneParams,
  options?: { [key: string]: any },
) {
  return request<API.SeriesResp>('/series', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PUT /series */
export async function updateSeries(body: API.SeriesUpReq, options?: { [key: string]: any }) {
  return request<boolean>('/series', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function updateAnime(
  params: {
    animeId: number;
    sessionTitle: string;
  },
  options?: { [key: string]: any },
) {
  return request<boolean>('/series/updateAnime', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /series/addAnime */
export async function addAnime(body: API.SeriesAddAnimeReq, options?: { [key: string]: any }) {
  return request<boolean>('/series/addAnime', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /series/addSeries */
export async function addSeries(body: API.SeriesAddReq, options?: { [key: string]: any }) {
  return request<number>('/series/addSeries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /series/deleteAnime */
export async function deleteAnime(body: number[], options?: { [key: string]: any }) {
  return request<boolean>('/series/deleteAnime', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /series/deleteSeries */
export async function deleteSeries(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteSeriesParams,
  options?: { [key: string]: any },
) {
  return request<boolean>('/series/deleteSeries', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /series/page */
export async function pageQuery(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.pageQueryParams,
  options?: { [key: string]: any },
) {
  return request<API.PageSeriesResp>('/series/page', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function listQuery(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: { name: string },
  options?: { [key: string]: any },
) {
  return request<API.SeriesResp[]>('/series/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
