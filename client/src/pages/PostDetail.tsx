import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { getPostApi, deletePostApi } from '../api/posts'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/format'
import LikeButton from '../components/LikeButton'
import CommentSection from '../components/CommentSection'
import SEOHead from '../components/SEOHead'
import type { Post } from '../types'

function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    const numId = Number(id)
    if (!Number.isInteger(numId) || numId <= 0) {
      setError('无效的文章 ID')
      setLoading(false)
      return
    }
    setLoading(true)
    getPostApi(numId)
      .then((res) => setPost(res.data))
      .catch(() => setError('文章不存在'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!post || !confirm('确定要删除这篇文章吗？')) return
    try {
      await deletePostApi(post.id)
      navigate('/')
    } catch {
      alert('删除失败')
    }
  }

  if (loading) {
    return <div style={styles.loading}>加载中...</div>
  }

  if (error || !post) {
    return (
      <div style={styles.error}>
        <p>{error || '文章不存在'}</p>
        <Link to="/" style={styles.backLink}>返回首页</Link>
      </div>
    )
  }

  const isOwner = user && user.id === post.author_id

  return (
    <div style={styles.container}>
      <SEOHead
        title={post.title}
        description={post.content?.slice(0, 150).replace(/[#*`>\[\]()!]/g, '')}
        url={`/post/${post.id}`}
        type="article"
      />
      <article style={styles.article}>
        {/* 文章头部 */}
        <header style={styles.header}>
          <h1 style={styles.title}>{post.title}</h1>
          <div style={styles.meta}>
            <span style={styles.author}>{post.author_name}</span>
            <span style={styles.separator}>·</span>
            <span>{formatDate(post.created_at, { hour: '2-digit', minute: '2-digit' })}</span>
            <span style={styles.separator}>·</span>
            <span>{post.views} 次阅读</span>
            {post.category_name && (
              <>
                <span style={styles.separator}>·</span>
                <span style={styles.category}>{post.category_name}</span>
              </>
            )}
          </div>
          {post.tags.length > 0 && (
            <div style={styles.tags}>
              {post.tags.map((tag, i) => (
                <span key={i} style={styles.tag}>#{tag}</span>
              ))}
            </div>
          )}
          {/* 点赞按钮 */}
          <div style={styles.likeSection}>
            <LikeButton articleId={post.id} />
          </div>
        </header>

        {/* 封面图 */}
        {post.cover && (
          <div style={styles.coverWrapper}>
            <img src={post.cover} alt={post.title} style={styles.cover} />
          </div>
        )}

        {/* 文章内容 */}
        <div className="markdown-body" style={styles.content}>
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {/* 操作按钮（仅作者可见） */}
        {isOwner && (
          <div style={styles.actions}>
            <button onClick={() => navigate(`/write?edit=${post.id}`)} style={styles.editButton}>
              编辑文章
            </button>
            <button onClick={handleDelete} style={styles.deleteButton}>
              删除文章
            </button>
          </div>
        )}
      </article>

      {/* 评论区 */}
      {post.status === 'published' && <CommentSection articleId={post.id} />}

      {/* 返回按钮 */}
      <div style={styles.footer}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          ← 返回
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' },
  loading: { textAlign: 'center', padding: '4rem', color: '#999' },
  error: { textAlign: 'center', padding: '4rem' },
  backLink: { color: '#1677ff', marginTop: '1rem', display: 'inline-block' },
  article: { background: '#fff' },
  header: { marginBottom: '1.5rem' },
  title: { fontSize: '2rem', lineHeight: 1.3, marginBottom: '1rem' },
  meta: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.875rem', color: '#666' },
  separator: { color: '#ccc' },
  author: { fontWeight: 500, color: '#333' },
  category: { color: '#1677ff', background: '#e6f4ff', padding: '0.125rem 0.5rem', borderRadius: 4 },
  tags: { display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' },
  tag: { fontSize: '0.8rem', color: '#1677ff', background: '#e6f4ff', padding: '0.125rem 0.5rem', borderRadius: 4 },
  likeSection: { marginTop: '1rem' },
  coverWrapper: { marginBottom: '1.5rem', borderRadius: 8, overflow: 'hidden' },
  cover: { width: '100%', display: 'block' },
  content: { lineHeight: 1.8, fontSize: '1rem', color: '#333' },
  actions: { display: 'flex', gap: '0.75rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' },
  editButton: { padding: '0.5rem 1rem', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  deleteButton: { padding: '0.5rem 1rem', background: '#fff', color: '#ff4d4f', border: '1px solid #ff4d4f', borderRadius: 4, cursor: 'pointer' },
  footer: { marginTop: '2rem' },
  backButton: { padding: '0.5rem 1rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' },
}

export default PostDetail
