import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getPostsApi } from '../api/posts'
import { getCategoriesApi } from '../api/categories'
import { formatDateShort } from '../utils/format'
import { useAuth } from '../context/AuthContext'
import SEOHead from '../components/SEOHead'
import type { PostListItem, Category } from '../types'

function HomePage() {
  const { user, logout } = useAuth()
  const [posts, setPosts] = useState<PostListItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // 从 URL 参数读取筛选状态
  const page = Number(searchParams.get('page')) || 1
  const category = searchParams.get('category') ? Number(searchParams.get('category')) : null
  const keyword = searchParams.get('keyword') || ''
  const [searchInput, setSearchInput] = useState(keyword)

  // 加载分类
  useEffect(() => {
    getCategoriesApi()
      .then((res) => setCategories(res.data))
      .catch((err) => console.warn('加载分类失败', err))
  }, [])

  // 加载文章列表
  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getPostsApi({ page, pageSize: 10, category, keyword: keyword || undefined })
      setPosts(res.data.list)
      setTotal(res.data.total)
      setTotalPages(res.data.totalPages)
    } catch {
      setPosts([])
      setError('加载文章失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [page, category, keyword])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // 更新 URL 参数
  const updateParams = (updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '' || value === undefined) {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
    }
    // 筛选变化时重置到第 1 页
    if (!('page' in updates)) {
      params.set('page', '1')
    }
    setSearchParams(params)
  }

  // 搜索提交
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams({ keyword: searchInput || null })
  }

  // 分类筛选
  const handleCategoryClick = (catId: number | null) => {
    updateParams({ category: catId })
  }

  return (
    <div style={styles.container}>
      <SEOHead title="首页" url="/" />
      {/* 顶部导航 */}
      <header style={styles.header}>
        <h1 style={styles.logo} onClick={() => navigate('/')}>
          个人博客
        </h1>
        <div style={styles.headerActions}>
          <Link to="/write" style={styles.headerLink}>写文章</Link>
          <Link to="/profile" style={styles.headerLink}>个人中心</Link>
          {user ? (
            <button onClick={logout} style={styles.logoutBtn}>退出</button>
          ) : (
            <Link to="/login" style={styles.headerLink}>登录</Link>
          )}
        </div>
      </header>

      {/* 搜索栏 */}
      <div style={styles.searchSection}>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="搜索文章..."
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchButton}>搜索</button>
        </form>
      </div>

      {/* 分类标签 */}
      <div style={styles.categoryBar}>
        <button
          onClick={() => handleCategoryClick(null)}
          style={category === null ? styles.categoryActive : styles.categoryTag}
        >
          全部
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            style={category === cat.id ? styles.categoryActive : styles.categoryTag}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 文章列表 */}
      <main style={styles.main}>
        {loading ? (
          <div style={styles.loading}>加载中...</div>
        ) : error ? (
          <div style={styles.error}>{error}</div>
        ) : posts.length === 0 ? (
          <div style={styles.empty}>暂无文章</div>
        ) : (
          <>
            <div style={styles.postList}>
              {posts.map((post) => (
                <article
                  key={post.id}
                  style={styles.postCard}
                  onClick={() => navigate(`/post/${post.id}`)}
                >
                  {post.cover && (
                    <img src={post.cover} alt={post.title} style={styles.postCover} />
                  )}
                  <div style={styles.postContent}>
                    <h2 style={styles.postTitle}>{post.title}</h2>
                    <div style={styles.postMeta}>
                      <span>{post.author_name}</span>
                      <span>·</span>
                      <span>{post.category_name || '未分类'}</span>
                      <span>·</span>
                      <span>{formatDateShort(post.created_at)}</span>
                      <span>·</span>
                      <span>{post.views} 阅读</span>
                      <span>·</span>
                      <span>❤ {post.likes_count || 0}</span>
                    </div>
                    {post.tags.length > 0 && (
                      <div style={styles.tagList}>
                        {post.tags.map((tag, i) => (
                          <span key={i} style={styles.tag}>#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  disabled={page <= 1}
                  onClick={() => updateParams({ page: page - 1 })}
                  style={styles.pageButton}
                >
                  上一页
                </button>
                <span style={styles.pageInfo}>
                  {page} / {totalPages}（共 {total} 篇）
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => updateParams({ page: page + 1 })}
                  style={styles.pageButton}
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 800, margin: '0 auto', padding: '0 1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #eee' },
  logo: { fontSize: '1.25rem', cursor: 'pointer' },
  headerActions: { display: 'flex', gap: '1rem' },
  headerLink: { color: '#1677ff', fontSize: '0.875rem', textDecoration: 'none' },
  logoutBtn: { color: '#ff4d4f', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 },
  searchSection: { padding: '1.5rem 0 1rem' },
  searchForm: { display: 'flex', gap: '0.5rem' },
  searchInput: { flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: 4, fontSize: '1rem' },
  searchButton: { padding: '0.5rem 1rem', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  categoryBar: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingBottom: '1rem', borderBottom: '1px solid #eee' },
  categoryTag: { padding: '0.25rem 0.75rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 16, cursor: 'pointer', fontSize: '0.875rem' },
  categoryActive: { padding: '0.25rem 0.75rem', background: '#1677ff', color: '#fff', border: '1px solid #1677ff', borderRadius: 16, cursor: 'pointer', fontSize: '0.875rem' },
  main: { padding: '1.5rem 0' },
  loading: { textAlign: 'center', padding: '3rem', color: '#999' },
  error: { textAlign: 'center', padding: '3rem', color: '#ff4d4f' },
  empty: { textAlign: 'center', padding: '3rem', color: '#999' },
  postList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  postCard: { display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid #eee', borderRadius: 8, cursor: 'pointer', transition: 'box-shadow 0.2s' },
  postCover: { width: 120, height: 80, objectFit: 'cover', borderRadius: 4, flexShrink: 0 },
  postContent: { flex: 1, minWidth: 0 },
  postTitle: { fontSize: '1.1rem', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  postMeta: { display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: '#888' },
  tagList: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem' },
  tag: { fontSize: '0.75rem', color: '#1677ff', background: '#e6f4ff', padding: '0.125rem 0.5rem', borderRadius: 4 },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #eee' },
  pageButton: { padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: 4, background: '#fff', cursor: 'pointer' },
  pageInfo: { fontSize: '0.875rem', color: '#666' },
}

export default HomePage
