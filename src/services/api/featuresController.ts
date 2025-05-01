// @ts-ignore
/* eslint-disable */
import request from '@/plugins/globalRequest';

/** 此处后端没有提供注释 GET /features/getAll */
export async function getAllFeatures(options?: { [key: string]: any }) {
  return request<API.UserFeatures>('/features/getAll', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /features/getBetween */
export async function getBetweenFeatures(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getBetweenFeaturesParams,
  options?: { [key: string]: any },
) {
  return request<API.DailyUserFeatures[]>('/features/getBetween', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getBetweenCountFeatures(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getBetweenFeaturesParams,
  options?: { [key: string]: any },
) {
  return request<API.DailyUserFeatureCount[]>('/features/getBetweenCount', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /features/getMonthly */
export async function getMonthlyFeatures(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getMonthlyFeaturesParams,
  options?: { [key: string]: any },
) {
  return request<API.MonthlyUserFeatures>('/features/getMonthly', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /features/getWeekly */
export async function getWeeklyFeatures(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getWeeklyFeaturesParams,
  options?: { [key: string]: any },
) {
  return request<API.WeeklyUserFeatures>('/features/getWeekly', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
