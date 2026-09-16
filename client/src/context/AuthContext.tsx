import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { loginApi, registerApi, getMeApi } from '../api/auth'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  // 初始化：如果有 token，尝试获取用户信息
  useEffect(() => {
    const init = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const res = await getMeApi()
        setUser(res.data)
        localStorage.setItem(USER_KEY, JSON.stringify(res.data))
      } catch {
        // token 失效，清除
        handleLogout()
      } finally {
        setLoading(false)
      }
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (username: string, password: string) => {
    const res = await loginApi(username, password)
    const { token: newToken, user: newUser } = res.data
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
  }

  const register = async (username: string, email: string, password: string) => {
    await registerApi(username, email, password)
  }

  const handleLogout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
