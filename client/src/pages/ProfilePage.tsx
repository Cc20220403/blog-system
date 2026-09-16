import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getPostsApi, deletePostApi } from '../api/posts'
import { formatDateShort } from '../utils/format'
import SEOHead from '../components/SEOHead'
import type { PostListItem } from '../types'

function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'info' | 'drafts'>('info')
  const [drafts, setDrafts] = useState<PostListItem[]>([])
  const [loading, setLoading] = useState(false)

  // 加载草稿列表
  useEffect(() => {
    if (tab !== 'drafts') return
    setLoading(true)
    getPostsApi({ status: 'draft' })
      .then((res) => setDrafts(res.data.list))
      .catch((err) => console.warn('加载草稿列表失败', err))
      .finally(() => setLoading(false))
  }, [tab])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleDeleteDraft = async (id: number) => {
    if (!confirm('确定删除这篇草稿吗？')) return
    try {
      await deletePostApi(id)
      setDrafts(drafts.filter((d) => d.id !== id))
    } catch {
      alert('删除失败')
    }
  }

  return (
    <div style={styles.container}>
      <SEOHead title="个人中心" url="/profile" />
      <h1 style={styles.title}>个人中心</h1>

      {/* 标签切换 */}
      <div style={styles.tabs}>
        <button
          onClick={() => setTab('info')}
          style={tab === 'info' ? styles.tabActive : styles.tab}
        >
          个人信息
        </button>
        <button
          onClick={() => setTab('drafts')}
          style={tab === 'drafts' ? styles.tabActive : styles.tab}
        >
          我的草稿
        </button>
      </div>

      {/* 个人信息 */}
      {tab === 'info' && user && (
        <div style={styles.section}>
          <p style={styles.infoRow}><strong>用户名：</strong>{user.username}</p>
          <p style={styles.infoRow}><strong>邮箱：</strong>{user.email}</p>
          <button onClick={handleLogout} style={styles.logoutButton}>退出登录</button>
        </div>
      )}

      {/* 草稿列表 */}
      {tab === 'drafts' && (
        <div style={styles.section}>
          {loading ? (
            <div style={styles.empty}>加载中...</div>
          ) : drafts.length === 0 ? (
            <div style={styles.empty}>
              暂无草稿
              <Link to="/write" style={styles.writeLink}>去写文章</Link>
            </div>
          ) : (
            <div style={styles.draftList}>
              {drafts.map((draft) => (
                <div key={draft.id} style={styles.draftCard}>
                  <div style={styles.draftInfo}>
                    <Link to={`/write?edit=${draft.id}`} style={styles.draftTitle}>
                      {draft.title}
                    </Link>
                    <span style={styles.draftMeta}>
                      {formatDateShort(draft.updated_at)}
                    </span>
                  </div>
                  <div style={styles.draftActions}>
                    <Link to={`/write?edit=${draft.id}`} style={styles.editLink}>编辑</Link>
                    <button onClick={() => handleDeleteDraft(draft.id)} style={styles.deleteBtn}>删除</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' },
  title: { fontSize: '1.5rem', marginBottom: '1.5rem' },
  tabs: { display: 'flex', gap: '0.5rem', borderBottom: '1px solid #eee', marginBottom: '1.5rem' },
  tab: { padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', color: '#666', fontSize: '0.95rem' },
  tabActive: { padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: '2px solid #1677ff', cursor: 'pointer', color: '#1677ff', fontWeight: 500, fontSize: '0.95rem' },
  section: { padding: '0.5rem 0' },
  infoRow: { margin: '0.75rem 0', fontSize: '0.95rem', color: '#333' },
  logoutButton: { marginTop: '1rem', padding: '0.5rem 1rem', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '3rem', color: '#999' },
  writeLink: { display: 'block', marginTop: '0.5rem', color: '#1677ff' },
  draftList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  draftCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', border: '1px solid #eee', borderRadius: 6 },
  draftInfo: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  draftTitle: { fontSize: '1rem', color: '#333', fontWeight: 500 },
  draftMeta: { fontSize: '0.8rem', color: '#999' },
  draftActions: { display: 'flex', gap: '0.5rem' },
  editLink: { padding: '0.25rem 0.75rem', color: '#1677ff', border: '1px solid #1677ff', borderRadius: 4, fontSize: '0.8rem' },
  deleteBtn: { padding: '0.25rem 0.75rem', color: '#ff4d4f', border: '1px solid #ff4d4f', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: '0.8rem' },
}

export default ProfilePage
