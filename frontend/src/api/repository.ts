import { AxiosRequestConfig } from 'axios'
import { request } from './request'

export function list(params?: {}, options?: AxiosRequestConfig) {
  return request.get<API.Repository[]>('/get_files', {
    ...options,
    params,
  })
}

export function upload(params: { files: File }, options?: AxiosRequestConfig) {
  const form = new FormData()
  form.append('files', params.files)
  return request.post<API.Result<{ file_id: string }>>(`/upload_files`, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...options,
  })
}

export function remove(
  params: { file_name: string },
  options?: AxiosRequestConfig,
) {
  const { file_name, ..._params } = params
  return request.delete(`/delete_file/${encodeURIComponent(file_name)}`, {
    ...options,
    params: _params,
  })
}
