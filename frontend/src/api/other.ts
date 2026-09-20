import { AxiosRequestConfig } from 'axios'
import { request } from './request'

export function getVolcToken(
  params: {
    appid: string
    accessKey: string
  },
  options?: AxiosRequestConfig,
) {
  const { appid, accessKey } = params
  return request.post<{
    jwt_token?: string
  }>(
    '/sts-token',
    {
      appid,
      accessKey,
    },
    options,
  )
}
