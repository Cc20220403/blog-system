const Post = require('../models/Post');

const postController = {
  /**
   * 创建文章
   * POST /api/posts
   */
  async create(req, res, next) {
    try {
      const { title, content, cover, category, tags, status } = req.body;

      if (!title || !content) {
        return res.status(400).json({ message: '标题和内容不能为空' });
      }

      if (tags && !Array.isArray(tags)) {
        return res.status(400).json({ message: 'tags 必须是数组格式' });
      }

      // status 只允许 draft 或 published
      const validStatus = (status === 'draft') ? 'draft' : 'published';

      const postId = await Post.create({
        title,
        content,
        cover: cover || null,
        category: category || null,
        tags: tags || null,
        authorId: req.user.id,
        status: validStatus,
      });

      res.status(201).json({
        success: true,
        message: validStatus === 'draft' ? '草稿保存成功' : '文章发布成功',
        data: { id: postId },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 获取文章列表
   * GET /api/posts?page=1&pageSize=10&category=1&keyword=xxx
   */
  async list(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 10));
      const category = req.query.category ? parseInt(req.query.category) : null;
      const keyword = req.query.keyword || null;
      const status = req.query.status === 'draft' ? 'draft' : 'published';

      // 查草稿时必须登录，且只能查自己的
      const authorId = (status === 'draft' && req.user) ? req.user.id : null;

      const { list, total } = await Post.findAll({ page, pageSize, category, keyword, status, authorId });

      res.json({
        success: true,
        data: {
          list,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 获取文章详情
   * GET /api/posts/:id
   */
  async detail(req, res, next) {
    try {
      const { id } = req.params;
      const post = await Post.findById(id);

      if (!post) {
        return res.status(404).json({ message: '文章不存在' });
      }

      // 草稿仅作者可见
      if (post.status === 'draft') {
        if (!req.user || req.user.id !== post.author_id) {
          return res.status(404).json({ message: '文章不存在' });
        }
      }

      // 浏览次数 +1（仅已发布文章计数）
      if (post.status === 'published') {
        await Post.incrementViews(id);
      }

      res.json({
        success: true,
        data: { ...post, views: post.status === 'published' ? post.views + 1 : post.views },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 更新文章
   * PUT /api/posts/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;

      // 检查文章是否存在
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ message: '文章不存在' });
      }

      // 只能编辑自己的文章
      if (post.author_id !== req.user.id) {
        return res.status(403).json({ message: '只能编辑自己的文章' });
      }

      const { title, content, cover, category, tags, status } = req.body;

      if (tags && !Array.isArray(tags)) {
        return res.status(400).json({ message: 'tags 必须是数组格式' });
      }

      const fields = {};
      if (title !== undefined) fields.title = title;
      if (content !== undefined) fields.content = content;
      if (cover !== undefined) fields.cover = cover;
      if (category !== undefined) fields.category = category;
      if (tags !== undefined) fields.tags = tags;
      if (status !== undefined) fields.status = (status === 'draft') ? 'draft' : 'published';

      await Post.update(id, fields);

      res.json({
        success: true,
        message: '文章更新成功',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 删除文章
   * DELETE /api/posts/:id
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      // 检查文章是否存在
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ message: '文章不存在' });
      }

      // 只能删除自己的文章
      if (post.author_id !== req.user.id) {
        return res.status(403).json({ message: '只能删除自己的文章' });
      }

      await Post.delete(id);

      res.json({
        success: true,
        message: '文章删除成功',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = postController;
