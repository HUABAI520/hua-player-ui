import request from '@/plugins/globalRequest';

/** 此处后端没有提供注释 GET /recommendation/getHotRecommendation */
export async function getHotRecommendation(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getHotRecommendationParams,
  options?: { [key: string]: any },
) {
  return request<API.PageAnimeIndexResp>('/recommendation/getHotRecommendation', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /recommendation/getRealTimeRecommendation */
export async function getRealTimeRecommendation(options?: { [key: string]: any }) {
  return request<API.AnimeIndexResp[]>('/recommendation/getRealTimeRecommendation', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /recommendation/getRecommendation */
export async function getRecommendation(options?: { [key: string]: any }) {
  return request<API.AnimeIndexResp[]>('/recommendation/getRecommendation', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /recommendation/topAnime */
export async function topAnime(options?: { [key: string]: any }) {
  return request<string>('/recommendation/topAnime', {
    method: 'GET',
    ...(options || {}),
  });
}
