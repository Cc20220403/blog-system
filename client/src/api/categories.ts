import request from './request'
import type { Category } from '../types'

/** 获取分类列表 */
export function getCategoriesApi() {
  return request.get('/categories') as Promise<{ success: boolean; data: Category[] }>
}
