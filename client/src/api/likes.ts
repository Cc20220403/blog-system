import request from './request'
import type { LikeStatus } from '../types'

/** 获取点赞状态 */
export function getLikeStatusApi(articleId: number) {
  return request.get(`/posts/${articleId}/like-status`) as Promise<{ success: boolean; data: LikeStatus }>
}

/** 点赞/取消点赞 */
export function toggleLikeApi(articleId: number) {
  return request.post(`/posts/${articleId}/like`) as Promise<{ success: boolean; message: string; data: LikeStatus }>
}
