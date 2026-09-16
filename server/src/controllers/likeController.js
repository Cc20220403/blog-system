const Like = require('../models/Like');
const { pool } = require('../config/db');

const likeController = {
  /**
   * 切换点赞
   * POST /api/posts/:id/like
   */
  async toggle(req, res, next) {
    try {
      const articleId = parseInt(req.params.id);
      const userId = req.user.id;

      // 检查文章是否存在且已发布
      const [articles] = await pool.query(
        "SELECT id FROM articles WHERE id = ? AND status = 'published'",
        [articleId]
      );
      if (articles.length === 0) {
        return res.status(404).json({ message: '文章不存在' });
      }

      const result = await Like.toggle(userId, articleId);

      res.json({
        success: true,
        message: result.liked ? '点赞成功' : '已取消点赞',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 获取点赞状态
   * GET /api/posts/:id/like-status
   */
  async getStatus(req, res, next) {
    try {
      const articleId = parseInt(req.params.id);
      const userId = req.user ? req.user.id : null;

      const result = await Like.getStatus(articleId, userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = likeController;
