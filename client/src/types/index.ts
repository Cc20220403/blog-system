export interface User {
  id: number
  username: string
  email: string
  avatar: string | null
}

export interface Post {
  id: number
  title: string
  content: string
  cover: string | null
  category: number | null
  category_name: string | null
  tags: string[]
  author_id: number
  author_name: string
  author_avatar: string | null
  status: 'draft' | 'published'
  views: number
  created_at: string
  updated_at: string
}

export interface PostListItem {
  id: number
  title: string
  cover: string | null
  category_name: string | null
  author_name: string
  tags: string[]
  status: 'draft' | 'published'
  views: number
  likes_count: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  description: string | null
}

export interface PostListResponse {
  success: boolean
  data: {
    list: PostListItem[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: User
  }
}

export interface RegisterResponse {
  success: boolean
  message: string
  data: {
    id: number
    username: string
    email: string
  }
}

export interface LikeStatus {
  likesCount: number
  isLiked: boolean
}

export interface Comment {
  id: number
  content: string
  user_id: number
  author_name: string
  author_avatar: string | null
  parent_id: number | null
  created_at: string
  replies: Comment[]
}

export interface ArchiveArticle {
  id: number
  title: string
  created_at: string
}

export interface ArchiveGroup {
  month: string
  label: string
  count: number
  articles: ArchiveArticle[]
}
