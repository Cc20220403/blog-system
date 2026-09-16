import request from './request'
import type { LoginResponse, RegisterResponse } from '../types'

/** 用户登录 */
export function loginApi(username: string, password: string) {
  return request.post('/auth/login', { username, password }) as Promise<LoginResponse>
}

/** 用户注册 */
export function registerApi(username: string, email: string, password: string) {
  return request.post('/auth/register', { username, email, password }) as Promise<RegisterResponse>
}

/** 获取当前用户信息 */
export function getMeApi() {
  return request.get('/auth/me') as Promise<{ success: boolean; data: import('../types').User }>
}
