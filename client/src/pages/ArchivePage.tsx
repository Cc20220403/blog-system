import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getArchivesApi } from '../api/archives'
import { formatDateShort } from '../utils/format'
import SEOHead from '../components/SEOHead'
import type { ArchiveGroup } from '../types'

function ArchivePage() {
  const [archives, setArchives] = useState<ArchiveGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getArchivesApi()
      .then((res) => setArchives(res.data))
      .catch(() => setError('加载归档失败'))
      .finally(() => setLoading(false))
  }, [])

  const totalCount = archives.reduce((sum, g) => sum + g.count, 0)

  if (loading) {
    return <div style={styles.loading}>加载中...</div>
  }

  if (error) {
    return <div style={styles.error}>{error}</div>
  }

  return (
    <div style={styles.container}>
      <SEOHead title="文章归档" url="/archive" />
      <h1 style={styles.title}>文章归档</h1>
      <p style={styles.summary}>共 {totalCount} 篇文章，{archives.length} 个月份</p>

      {archives.length === 0 ? (
        <div style={styles.empty}>暂无文章</div>
      ) : (
        <div style={styles.timeline}>
          {archives.map((group) => (
            <div key={group.month} style={styles.group}>
              <div style={styles.groupHeader}>
                <span style={styles.groupLabel}>{group.label}</span>
                <span style={styles.groupCount}>{group.count} 篇</span>
              </div>
              <div style={styles.articleList}>
                {group.articles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/post/${article.id}`}
                    style={styles.articleItem}
                  >
                    <span style={styles.articleDate}>{formatDateShort(article.created_at)}</span>
                    <span style={styles.articleTitle}>{article.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' },
  title: { fontSize: '1.5rem', marginBottom: '0.5rem' },
  summary: { fontSize: '0.875rem', color: '#666', marginBottom: '2rem' },
  loading: { textAlign: 'center', padding: '4rem', color: '#999' },
  error: { textAlign: 'center', padding: '4rem', color: '#ff4d4f' },
  empty: { textAlign: 'center', padding: '4rem', color: '#999' },
  timeline: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  group: { borderLeft: '3px solid #1677ff', paddingLeft: '1rem' },
  groupHeader: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' },
  groupLabel: { fontSize: '1.1rem', fontWeight: 600, color: '#333' },
  groupCount: { fontSize: '0.8rem', color: '#999', background: '#f5f5f5', padding: '0.125rem 0.5rem', borderRadius: 10 },
  articleList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  articleItem: { display: 'flex', gap: '1rem', alignItems: 'baseline', padding: '0.375rem 0', textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' },
  articleDate: { fontSize: '0.8rem', color: '#999', flexShrink: 0, width: 80 },
  articleTitle: { fontSize: '0.95rem', color: '#333' },
}

export default ArchivePage
