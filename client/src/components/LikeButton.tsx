import { useState, useEffect } from 'react'
import { getLikeStatusApi, toggleLikeApi } from '../api/likes'
import { useAuth } from '../context/AuthContext'

interface LikeButtonProps {
  articleId: number
  initialCount?: number
}

function LikeButton({ articleId, initialCount = 0 }: LikeButtonProps) {
  const { user } = useAuth()
  const [likesCount, setLikesCount] = useState(initialCount)
  const [isLiked, setIsLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  // 加载点赞状态
  useEffect(() => {
    getLikeStatusApi(articleId)
      .then((res) => {
        setLikesCount(res.data.likesCount)
        setIsLiked(res.data.isLiked)
      })
      .catch((err) => console.warn('加载点赞状态失败', err))
  }, [articleId])

  const handleToggle = async () => {
    if (!user) return
    if (loading) return

    setLoading(true)
    try {
      const res = await toggleLikeApi(articleId)
      setLikesCount(res.data.likesCount)
      setIsLiked(res.data.isLiked)
    } catch {
      // 失败时不更新状态
    } finally {
      setLoading(false)
    }
  }

  // 只要有人点赞或当前用户已赞，就显示红色
  const showRed = isLiked || likesCount > 0

  return (
    <button
      onClick={handleToggle}
      disabled={loading || !user}
      style={{
        ...styles.button,
        ...(showRed ? styles.liked : {}),
      }}
      title={user ? (isLiked ? '取消点赞' : '点赞') : '请先登录'}
    >
      <span style={styles.heart}>{showRed ? '❤️' : '🤍'}</span>
      <span style={styles.count}>{likesCount}</span>
    </button>
  )
}

const styles: Record<string, React.CSSProperties> = {
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.75rem',
    border: '1px solid #ddd',
    borderRadius: 20,
    background: '#fff',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.2s',
  },
  liked: {
    borderColor: '#ff4d4f',
    background: '#fff2f0',
  },
  heart: {
    fontSize: '1rem',
  },
  count: {
    fontWeight: 500,
    minWidth: '1rem',
    textAlign: 'center',
  },
}

export default LikeButton
