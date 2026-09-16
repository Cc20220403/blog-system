import request from './request'

/** 上传图片 */
export function uploadImageApi(file: File) {
  const formData = new FormData()
  formData.append('image', file)
  return request.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }) as Promise<{ success: boolean; message: string; data: { url: string } }>
}
