// @ts-ignore
/* eslint-disable */
import request from '@/plugins/globalRequest';

/**
 * 获取该用户的收藏夹分页列表 默认分页大小20 GET /collection/collections
 */
export async function collections(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.collectionsParams,
  options?: { [key: string]: any },
) {
  return request<API.PageCollections>('/collection/collections', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/**
 * 添加收藏夹 POST /collection/collections/add
 */
export async function collectionsAdd(
  body: API.CollectionsAddReq,
  options?: { [key: string]: any },
) {
  return request<number>('/collection/collections/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/**
 * 分页查询收藏夹的内容 分页大小固定40 且可以根据关键词查询
 */
export async function collectionsAnime(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.collectionsAnimeParams,
  options?: { [key: string]: any },
) {
  return request<API.PageCollectionInResp>('/collection/collections/anime', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/**
 * 添加收藏夹内容 传递收藏夹id和动漫id
 */
export async function collectionsAnimeAdd(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.collectionsAnimeAddParams,
  options?: { [key: string]: any },
) {
  return request<number>('/collection/collections/anime/add', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 根据用户id + 动漫id 查询是否收藏和和被哪些收藏夹id 返回收藏夹id列表 有代表收藏 且后续可以知道哪些收藏夹收录了 */
export async function collectionsAnimeIs(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.collectionsAnimeIsParams,
  options?: { [key: string]: any },
) {
  return request<number[]>('/collection/collections/anime/is', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/**
 *  通过 aid + cid 进行取消收藏
 */
export async function collectionsAnimeRemove(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.collectionsAnimeRemoveParams,
  options?: { [key: string]: any },
) {
  return request<boolean>('/collection/collections/anime/remove', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/**
 * 删除收藏夹
 */
export async function collectionsRemove(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.collectionsRemoveParams,
  options?: { [key: string]: any },
) {
  return request<boolean>('/collection/collections/remove', {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/**
 * 传递用户所有的收藏夹id进行重新排序，但是默认收藏夹只能为第一个
 */
export async function collectionsSort(body: number[], options?: { [key: string]: any }) {
  return request<boolean>('/collection/collections/sort', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 收藏夹id 进行修改信息 （名称必填） */
export async function collectionsUpdate(
  body: API.CollectionsUpdateReq,
  options?: { [key: string]: any },
) {
  return request<boolean>('/collection/collections/update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
export async function collectionsCount(options?: { [key: string]: any }) {
  return request<number>('/collection/collections/count', {
    method: 'GET',
    ...(options || {}),
  });
}
