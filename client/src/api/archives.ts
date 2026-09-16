import request from './request'
import type { ArchiveGroup } from '../types'

/** 获取文章归档 */
export function getArchivesApi() {
  return request.get('/archives') as Promise<{ success: boolean; data: ArchiveGroup[] }>
}
