import request from './request'
import type { PostListResponse, Post } from '../types'

interface PostListParams {
  page?: number
  pageSize?: number
  category?: number | null
  keyword?: string
  status?: 'draft' | 'published'
}

/** 获取文章列表 */
export function getPostsApi(params: PostListParams = {}) {
  return request.get('/posts', { params }) as Promise<PostListResponse>
}

/** 获取文章详情 */
export function getPostApi(id: number) {
  return request.get(`/posts/${id}`) as Promise<{ success: boolean; data: Post }>
}

/** 创建文章 */
export function createPostApi(data: {
  title: string
  content: string
  cover?: string
  category?: number
  tags?: string[]
  status?: 'draft' | 'published'
}) {
  return request.post('/posts', data) as Promise<{ success: boolean; message: string; data: { id: number } }>
}

/** 更新文章 */
export function updatePostApi(id: number, data: Record<string, unknown>) {
  return request.put(`/posts/${id}`, data) as Promise<{ success: boolean; message: string }>
}

/** 删除文章 */
export function deletePostApi(id: number) {
  return request.delete(`/posts/${id}`) as Promise<{ success: boolean; message: string }>
}
