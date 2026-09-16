const { pool } = require('../config/db');

const Like = {
  /**
   * 切换点赞状态（已赞则取消，未赞则点赞）
   * 返回 { liked: boolean, likesCount: number }
   */
  async toggle(userId, articleId) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 在事务内检查是否已赞
      const [existing] = await conn.query(
        'SELECT 1 FROM likes WHERE user_id = ? AND article_id = ? FOR UPDATE',
        [userId, articleId]
      );

      if (existing.length > 0) {
        await conn.query(
          'DELETE FROM likes WHERE user_id = ? AND article_id = ?',
          [userId, articleId]
        );
      } else {
        await conn.query(
          'INSERT INTO likes (user_id, article_id) VALUES (?, ?)',
          [userId, articleId]
        );
      }

      // 返回最新点赞数
      const [countRows] = await conn.query(
        'SELECT COUNT(*) AS total FROM likes WHERE article_id = ?',
        [articleId]
      );

      await conn.commit();

      return {
        liked: existing.length === 0,
        likesCount: countRows[0].total,
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /**
   * 获取文章点赞状态
   * 返回 { likesCount: number, isLiked: boolean }
   */
  async getStatus(articleId, userId = null) {
    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS total FROM likes WHERE article_id = ?',
      [articleId]
    );

    let isLiked = false;
    if (userId) {
      const [userLike] = await pool.query(
        'SELECT 1 FROM likes WHERE user_id = ? AND article_id = ?',
        [userId, articleId]
      );
      isLiked = userLike.length > 0;
    }

    return {
      likesCount: countRows[0].total,
      isLiked,
    };
  },
};

module.exports = Like;
