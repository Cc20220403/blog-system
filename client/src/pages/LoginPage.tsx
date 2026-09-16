import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SEOHead from '../components/SEOHead'

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('请输入用户名和密码')
      return
    }

    setLoading(true)
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <SEOHead title="登录" url="/login" />
      <div style={styles.card}>
        <h1 style={styles.title}>登录</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          <div style={styles.field}>
            <label style={styles.label}>用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="请输入用户名"
              disabled={loading}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="请输入密码"
              disabled={loading}
            />
          </div>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        <p style={styles.footer}>
          还没有账号？<Link to="/register" style={styles.link}>去注册</Link>
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' },
  card: { width: 400, padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  title: { textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  label: { fontSize: '0.875rem', color: '#555' },
  input: { padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: 4, fontSize: '1rem' },
  button: { padding: '0.75rem', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 4, fontSize: '1rem', cursor: 'pointer' },
  error: { padding: '0.5rem', background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 4, color: '#ff4d4f', fontSize: '0.875rem' },
  footer: { textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: '#666' },
  link: { color: '#1677ff' },
}

export default LoginPage
