import request from './request'
import type { Comment } from '../types'

/** 获取文章评论列表（支持分页） */
export function getCommentsApi(articleId: number, page = 1) {
  return request.get(`/posts/${articleId}/comments`, { params: { page } }) as Promise<{
    success: boolean
    data: {
      list: Comment[]
      total: number
      page: number
      pageSize: number
      totalPages: number
    }
  }>
}

/** 发表评论 */
export function createCommentApi(articleId: number, data: { content: string; parentId?: number }) {
  return request.post(`/posts/${articleId}/comments`, data) as Promise<{
    success: boolean
    message: string
    data: { id: number }
  }>
}

/** 删除评论 */
export function deleteCommentApi(commentId: number) {
  return request.delete(`/comments/${commentId}`) as Promise<{
    success: boolean
    message: string
  }>
}
