const Comment = require('../models/Comment');
const { pool } = require('../config/db');

const commentController = {
  /**
   * 获取文章评论列表
   * GET /api/posts/:id/comments
   */
  async list(req, res, next) {
    try {
      const articleId = parseInt(req.params.id);
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 20));

      const { rows, total } = await Comment.findByArticleId(articleId, { page, pageSize });
      const tree = Comment.buildTree(rows);

      res.json({
        success: true,
        data: {
          list: tree,
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
   * 发表评论
   * POST /api/posts/:id/comments
   */
  async create(req, res, next) {
    try {
      const articleId = parseInt(req.params.id);
      const { content, parentId } = req.body;

      // 检查文章是否存在且已发布
      const [articles] = await pool.query(
        "SELECT id FROM articles WHERE id = ? AND status = 'published'",
        [articleId]
      );
      if (articles.length === 0) {
        return res.status(404).json({ message: '文章不存在' });
      }

      if (!content || !content.trim()) {
        return res.status(400).json({ message: '评论内容不能为空' });
      }

      if (content.length > 1000) {
        return res.status(400).json({ message: '评论内容不能超过 1000 字' });
      }

      // 如果指定了父评论，检查父评论是否存在且属于同一文章
      if (parentId) {
        const parent = await Comment.findById(parentId);
        if (!parent || parent.article_id !== articleId) {
          return res.status(400).json({ message: '父评论不存在' });
        }
      }

      const commentId = await Comment.create({
        articleId,
        userId: req.user.id,
        parentId: parentId || null,
        content: content.trim(),
      });

      res.status(201).json({
        success: true,
        message: '评论发表成功',
        data: { id: commentId },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 删除评论
   * DELETE /api/comments/:id
   */
  async delete(req, res, next) {
    try {
      const commentId = parseInt(req.params.id);

      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ message: '评论不存在' });
      }

      // 只能删除自己的评论
      if (comment.user_id !== req.user.id) {
        return res.status(403).json({ message: '只能删除自己的评论' });
      }

      // 检查是否有子回复（级联删除提示）
      const [children] = await pool.query(
        'SELECT COUNT(*) AS total FROM comments WHERE parent_id = ?',
        [commentId]
      );
      const childCount = children[0].total;

      await Comment.delete(commentId);

      res.json({
        success: true,
        message: childCount > 0
          ? `评论及其 ${childCount} 条回复已删除`
          : '评论删除成功',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = commentController;
