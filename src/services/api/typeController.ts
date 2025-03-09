import request from '@/plugins/globalRequest';

/** 此处后端没有提供注释 POST /type/add */
export async function add(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.addParams,
  options?: { [key: string]: any },
) {
  return request<API.HuaType[]>('/type/add', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getTypeAll(options?: { [key: string]: any }) {
  return request<API.HuaType[]>('/type/getAll', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function deleteType(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: {
    id: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.HuaType[]>('/type/delete', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
