import { request } from '@umijs/max';

export async function scrape(params: { q: string }, options?: { [key: string]: any }) {
  return request<API.Scrape>('http://localhost:9998/api-player/scrape', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
export async function detail(params: { q: string }, options?: { [key: string]: any }) {
  return request<API.detail>('http://localhost:9998/api-player/detail', {
    method: 'GET',
    params: {
      q: params.q,
    },
    ...(options || {}),
  });
}
