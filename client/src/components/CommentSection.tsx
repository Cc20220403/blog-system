import { useState, useEffect } from 'react'
import { getCommentsApi, createCommentApi, deleteCommentApi } from '../api/comments'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/format'
import type { Comment } from '../types'

interface CommentSectionProps {
  articleId: number
}

function CommentSection({ articleId }: CommentSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // 加载评论
  const fetchComments = async (p: number) => {
    setLoading(true)
    try {
      const res = await getCommentsApi(articleId, p)
      setComments(res.data.list)
      setTotal(res.data.total)
      setTotalPages(res.data.totalPages)
      setPage(p)
    } catch (err) {
      console.warn('加载评论失败', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments(1)
  }, [articleId])

  // 提交评论
  const handleSubmit = async () => {
    if (!content.trim()) return
    if (!user) return

    setSubmitting(true)
    try {
      await createCommentApi(articleId, {
        content: content.trim(),
        parentId: replyTo?.id,
      })
      setContent('')
      setReplyTo(null)
      // 重新加载当前页评论
      await fetchComments(page)
    } catch {
      alert('评论失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 删除评论
  const handleDelete = async (id: number, replyCount = 0) => {
    const hint = replyCount > 0
      ? `确定删除这条评论及其 ${replyCount} 条回复吗？`
      : '确定删除这条评论吗？'
    if (!confirm(hint)) return
    try {
      await deleteCommentApi(id)
      await fetchComments(page)
    } catch {
      alert('删除失败')
    }
  }

  // 渲染单条评论
  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} style={{ ...styles.comment, ...(isReply ? styles.reply : {}) }}>
      <div style={styles.avatar}>
        {comment.author_avatar ? (
          <img src={comment.author_avatar} alt="" style={styles.avatarImg} />
        ) : (
          <div style={styles.avatarPlaceholder}>{comment.author_name[0]}</div>
        )}
      </div>
      <div style={styles.commentBody}>
        <div style={styles.commentHeader}>
          <span style={styles.authorName}>{comment.author_name}</span>
          <span style={styles.commentTime}>{formatDate(comment.created_at)}</span>
        </div>
        <div style={styles.commentContent}>{comment.content}</div>
        <div style={styles.commentActions}>
          {!isReply && user && (
            <button
              onClick={() => setReplyTo({ id: comment.id, name: comment.author_name })}
              style={styles.actionBtn}
            >
              回复
            </button>
          )}
          {user && user.id === comment.user_id && (
            <button onClick={() => handleDelete(comment.id, comment.replies.length)} style={styles.deleteBtn}>
              删除
            </button>
          )}
        </div>
        {/* 嵌套回复 */}
        {comment.replies.length > 0 && (
          <div style={styles.replies}>
            {comment.replies.map((r) => renderComment(r, true))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>评论 ({total})</h3>

      {/* 评论输入框 */}
      {user ? (
        <div style={styles.inputSection}>
          {replyTo && (
            <div style={styles.replyHint}>
              回复 @{replyTo.name}
              <button onClick={() => setReplyTo(null)} style={styles.cancelReply}>×</button>
            </div>
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的评论..."
            maxLength={1000}
            style={styles.textarea}
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !content.trim()}
            style={styles.submitBtn}
          >
            {submitting ? '提交中...' : '发表评论'}
          </button>
        </div>
      ) : (
        <div style={styles.loginHint}>
          请先登录后再评论
        </div>
      )}

      {/* 评论列表 */}
      {loading ? (
        <div style={styles.loading}>加载中...</div>
      ) : comments.length === 0 ? (
        <div style={styles.empty}>暂无评论，来抢沙发吧！</div>
      ) : (
        <>
          <div style={styles.commentList}>
            {comments.map((c) => renderComment(c))}
          </div>
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                disabled={page <= 1}
                onClick={() => fetchComments(page - 1)}
                style={styles.pageBtn}
              >
                上一页
              </button>
              <span style={styles.pageInfo}>{page} / {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => fetchComments(page + 1)}
                style={styles.pageBtn}
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' },
  title: { fontSize: '1.25rem', marginBottom: '1rem' },
  inputSection: { marginBottom: '1.5rem' },
  replyHint: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: '#f5f5f5', borderRadius: 4, marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' },
  cancelReply: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#999' },
  textarea: { width: '100%', minHeight: 80, padding: '0.75rem', border: '1px solid #ddd', borderRadius: 6, resize: 'vertical', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box' },
  submitBtn: { marginTop: '0.5rem', padding: '0.5rem 1rem', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.875rem' },
  loginHint: { padding: '1rem', background: '#f5f5f5', borderRadius: 6, textAlign: 'center', color: '#666', marginBottom: '1.5rem' },
  loading: { textAlign: 'center', padding: '2rem', color: '#999' },
  empty: { textAlign: 'center', padding: '2rem', color: '#999' },
  commentList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  comment: { display: 'flex', gap: '0.75rem' },
  reply: { marginLeft: '2rem' },
  replies: { marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  avatar: { flexShrink: 0 },
  avatarImg: { width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: '50%', background: '#1677ff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 500 },
  commentBody: { flex: 1, minWidth: 0 },
  commentHeader: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' },
  authorName: { fontWeight: 500, fontSize: '0.875rem', color: '#333' },
  commentTime: { fontSize: '0.75rem', color: '#999' },
  commentContent: { fontSize: '0.9rem', lineHeight: 1.6, color: '#333', wordBreak: 'break-word' },
  commentActions: { display: 'flex', gap: '0.75rem', marginTop: '0.375rem' },
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#1677ff', padding: 0 },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#ff4d4f', padding: 0 },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #eee' },
  pageBtn: { padding: '0.375rem 0.75rem', border: '1px solid #ddd', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: '0.8rem' },
  pageInfo: { fontSize: '0.8rem', color: '#666' },
}

export default CommentSection
