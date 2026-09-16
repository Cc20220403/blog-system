import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { createPostApi, updatePostApi, getPostApi } from '../api/posts'
import { getCategoriesApi } from '../api/categories'
import { uploadImageApi } from '../api/upload'
import type { Category } from '../types'

function WritePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [cover, setCover] = useState('')
  const [category, setCategory] = useState<number | ''>('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [previewContent, setPreviewContent] = useState('')
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)

  // 上传图片
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadImageApi(file)
      // 将图片 URL 插入到封面字段
      setCover(res.data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
    } finally {
      setUploading(false)
      // 清空 input 以便重复上传同一文件
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // 加载分类列表
  useEffect(() => {
    getCategoriesApi()
      .then((res) => setCategories(res.data))
      .catch((err) => console.warn('加载分类失败', err))
  }, [])

  // Markdown 预览防抖
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setPreviewContent(content)
    }, 300)
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [content])

  // 编辑模式：加载文章数据
  useEffect(() => {
    if (!editId) return
    setLoading(true)
    getPostApi(Number(editId))
      .then((res) => {
        const post = res.data
        setTitle(post.title)
        setContent(post.content || '')
        setCover(post.cover || '')
        setCategory(post.category ?? '')
        setTags(post.tags || [])
      })
      .catch(() => setError('加载文章失败'))
      .finally(() => setLoading(false))
  }, [editId])

  // 添加标签
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const tag = tagInput.trim()
      if (!tags.includes(tag)) {
        setTags([...tags, tag])
      }
      setTagInput('')
    }
  }

  // 移除标签
  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  // 保存文章
  const handleSave = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      setError('请输入标题')
      return
    }
    if (!content.trim()) {
      setError('请输入内容')
      return
    }

    setError('')
    setSaving(true)
    try {
      const data = {
        title: title.trim(),
        content,
        cover: cover.trim() || undefined,
        category: category || undefined,
        tags: tags.length > 0 ? tags : undefined,
        status,
      }

      if (editId) {
        await updatePostApi(Number(editId), data)
        navigate(status === 'published' ? `/post/${editId}` : '/profile')
      } else {
        const res = await createPostApi(data)
        navigate(status === 'published' ? `/post/${res.data.id}` : '/profile')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={styles.loading}>加载中...</div>
  }

  return (
    <div style={styles.container}>
      {/* 顶部工具栏 */}
      <header style={styles.toolbar}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入文章标题..."
          style={styles.titleInput}
        />
        <div style={styles.toolbarRight}>
          <button onClick={() => navigate(-1)} style={styles.cancelButton}>取消</button>
          <button onClick={() => handleSave('draft')} disabled={saving} style={styles.draftButton}>
            {saving ? '保存中...' : '保存草稿'}
          </button>
          <button onClick={() => handleSave('published')} disabled={saving} style={styles.saveButton}>
            {saving ? '发布中...' : editId ? '更新发布' : '发布'}
          </button>
        </div>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      {/* 元信息栏 */}
      <div style={styles.metaBar}>
        <div style={styles.metaItem}>
          <label style={styles.metaLabel}>分类</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value ? Number(e.target.value) : '')}
            style={styles.select}
          >
            <option value="">选择分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div style={styles.metaItem}>
          <label style={styles.metaLabel}>封面</label>
          <input
            type="text"
            value={cover}
            onChange={(e) => setCover(e.target.value)}
            placeholder="输入 URL 或点击上传"
            style={styles.metaInput}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUploadImage}
            accept="image/jpeg,image/png,image/gif,image/webp"
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={styles.uploadButton}
          >
            {uploading ? '上传中...' : '上传图片'}
          </button>
        </div>
        <div style={styles.metaItem}>
          <label style={styles.metaLabel}>标签</label>
          <div style={styles.tagContainer}>
            {tags.map((tag, i) => (
              <span key={i} style={styles.tagChip}>
                {tag}
                <span style={styles.tagRemove} onClick={() => handleRemoveTag(i)}>×</span>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="输入后回车添加"
              style={styles.tagInput}
            />
          </div>
        </div>
      </div>

      {/* 编辑器主体：左编辑右预览 */}
      <div style={styles.editorContainer}>
        <div style={styles.editorPane}>
          <div style={styles.paneHeader}>编辑</div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="使用 Markdown 格式撰写文章内容..."
            style={styles.textarea}
          />
        </div>
        <div style={styles.previewPane}>
          <div style={styles.paneHeader}>预览</div>
          <div className="markdown-body" style={styles.preview}>
            {previewContent ? (
              <ReactMarkdown>{previewContent}</ReactMarkdown>
            ) : (
              <p style={{ color: '#999' }}>预览区域</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#f5f5f5' },
  loading: { textAlign: 'center', padding: '4rem', color: '#999' },
  toolbar: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: '#fff', borderBottom: '1px solid #eee' },
  titleInput: { flex: 1, padding: '0.5rem', border: 'none', borderBottom: '2px solid #eee', fontSize: '1.25rem', outline: 'none' },
  toolbarRight: { display: 'flex', gap: '0.5rem' },
  cancelButton: { padding: '0.5rem 1rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' },
  draftButton: { padding: '0.5rem 1rem', background: '#fff', color: '#666', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' },
  saveButton: { padding: '0.5rem 1rem', background: '#1677ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
  error: { margin: '0.5rem 1rem', padding: '0.5rem', background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: 4, color: '#ff4d4f', fontSize: '0.875rem' },
  metaBar: { display: 'flex', flexWrap: 'wrap', gap: '1rem', padding: '0.75rem 1rem', background: '#fff', borderBottom: '1px solid #eee' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  metaLabel: { fontSize: '0.875rem', color: '#666', whiteSpace: 'nowrap' },
  select: { padding: '0.375rem 0.5rem', border: '1px solid #ddd', borderRadius: 4, fontSize: '0.875rem' },
  metaInput: { padding: '0.375rem 0.5rem', border: '1px solid #ddd', borderRadius: 4, fontSize: '0.875rem', width: 200 },
  uploadButton: { padding: '0.375rem 0.75rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' },
  tagContainer: { display: 'flex', flexWrap: 'wrap', gap: '0.375rem', alignItems: 'center' },
  tagChip: { display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.125rem 0.5rem', background: '#e6f4ff', color: '#1677ff', borderRadius: 4, fontSize: '0.8rem' },
  tagRemove: { cursor: 'pointer', fontWeight: 'bold', marginLeft: '0.125rem' },
  tagInput: { padding: '0.25rem 0.375rem', border: '1px solid #ddd', borderRadius: 4, fontSize: '0.8rem', width: 120 },
  editorContainer: { display: 'flex', flex: 1, overflow: 'hidden' },
  editorPane: { flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #eee' },
  previewPane: { flex: 1, display: 'flex', flexDirection: 'column' },
  paneHeader: { padding: '0.5rem 1rem', background: '#fafafa', borderBottom: '1px solid #eee', fontSize: '0.8rem', color: '#888', fontWeight: 500 },
  textarea: { flex: 1, padding: '1rem', border: 'none', resize: 'none', outline: 'none', fontSize: '0.95rem', lineHeight: 1.7, fontFamily: 'Menlo, Monaco, Consolas, monospace' },
  preview: { flex: 1, padding: '1rem', overflow: 'auto', fontSize: '0.95rem', lineHeight: 1.8 },
}

export default WritePage
