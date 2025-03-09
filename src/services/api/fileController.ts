import request from '@/plugins/globalRequest';

/** 此处后端没有提供注释 GET /file */
export async function list(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listParams,
  options?: { [key: string]: any },
) {
  return request<API.FileResp[]>('/file', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getFileById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: { fileId: number | string },
  options?: { [key: string]: any },
) {
  return request<API.FileNodes>('/file/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
