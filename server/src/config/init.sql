-- ============================================
-- 个人博客系统 - 数据库初始化脚本
-- ============================================

-- 创建数据库（首次使用时取消注释执行）
-- CREATE DATABASE IF NOT EXISTS blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE blog_db;

-- ---------- 用户表 ----------
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL UNIQUE          COMMENT '用户名',
  email       VARCHAR(100) NOT NULL UNIQUE          COMMENT '邮箱',
  password    VARCHAR(255) NOT NULL                 COMMENT '密码（bcrypt 加密）',
  avatar      VARCHAR(500) DEFAULT NULL             COMMENT '头像 URL',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- 分类表 ----------
CREATE TABLE IF NOT EXISTS categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(50)  NOT NULL UNIQUE          COMMENT '分类名称',
  description VARCHAR(200) DEFAULT NULL             COMMENT '分类描述',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- 文章表 ----------
CREATE TABLE IF NOT EXISTS articles (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200) NOT NULL                 COMMENT '文章标题',
  content     LONGTEXT     DEFAULT NULL             COMMENT '文章内容（Markdown）',
  cover       VARCHAR(500) DEFAULT NULL             COMMENT '封面图 URL',
  category    INT          DEFAULT NULL             COMMENT '分类 ID',
  tags        JSON         DEFAULT NULL             COMMENT '标签（JSON 数组，如 ["JS","Node"]）',
  author_id   INT          NOT NULL                 COMMENT '作者 ID',
  status      ENUM('draft','published') DEFAULT 'published' COMMENT '状态：草稿/已发布',
  views       INT          DEFAULT 0                COMMENT '浏览次数',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  CONSTRAINT fk_articles_author   FOREIGN KEY (author_id) REFERENCES users(id)      ON DELETE CASCADE,
  CONSTRAINT fk_articles_category FOREIGN KEY (category)  REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_author   (author_id),
  INDEX idx_category (category),
  INDEX idx_status_author (status, author_id),
  INDEX idx_created  (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- 点赞表 ----------
CREATE TABLE IF NOT EXISTS likes (
  user_id     INT       NOT NULL                COMMENT '用户 ID',
  article_id  INT       NOT NULL                COMMENT '文章 ID',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
  PRIMARY KEY (user_id, article_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- 评论表 ----------
CREATE TABLE IF NOT EXISTS comments (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  article_id  INT           NOT NULL              COMMENT '文章 ID',
  user_id     INT           NOT NULL              COMMENT '评论者 ID',
  parent_id   INT           DEFAULT NULL          COMMENT '父评论 ID（NULL 为顶级评论）',
  content     VARCHAR(1000) NOT NULL              COMMENT '评论内容',
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (parent_id)  REFERENCES comments(id) ON DELETE CASCADE,
  INDEX idx_article (article_id),
  INDEX idx_parent  (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
