/**
 * 格式化日期为中文本地格式
 */
export function formatDate(dateStr: string, options?: {
  year?: 'numeric'
  month?: 'numeric' | '2-digit' | 'long'
  day?: 'numeric' | '2-digit'
  hour?: '2-digit'
  minute?: '2-digit'
}): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  })
}

/**
 * 格式化日期为短格式（仅日期）
 */
export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
