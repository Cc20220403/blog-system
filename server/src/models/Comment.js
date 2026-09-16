const { pool } = require('../config/db');

const Comment = {
  /**
   * 获取文章的评论列表（含用户信息和嵌套结构）
   * 支持分页，每次返回前 N 条顶级评论及其回复
   */
  async findByArticleId(articleId, { page = 1, pageSize = 20 } = {}) {
    const offset = (page - 1) * pageSize;

    // 先查总数（只计顶级评论）
    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS total FROM comments WHERE article_id = ? AND parent_id IS NULL',
      [articleId]
    );
    const total = countRows[0].total;

    // 查分页后的顶级评论 + 它们的所有回复
    const [rows] = await pool.query(
      `SELECT
         c.id, c.content, c.parent_id, c.created_at,
         c.user_id,
         u.username AS author_name,
         u.avatar   AS author_avatar
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.article_id = ?
         AND (c.parent_id IS NULL OR c.parent_id IN (
           SELECT sub.id FROM (
             SELECT id FROM comments
             WHERE article_id = ? AND parent_id IS NULL
             ORDER BY created_at ASC
             LIMIT ? OFFSET ?
           ) sub
         ))
       ORDER BY c.parent_id IS NULL DESC, c.created_at ASC`,
      [articleId, articleId, pageSize, offset]
    );

    return { rows, total };
  },

  /**
   * 将平铺评论列表转为嵌套树（最多 2 层）
   */
  buildTree(comments) {
    const map = new Map();
    const roots = [];

    // 先建立 id -> comment 映射
    for (const c of comments) {
      map.set(c.id, { ...c, replies: [] });
    }

    // 构建树
    for (const c of comments) {
      const node = map.get(c.id);
      if (c.parent_id && map.has(c.parent_id)) {
        map.get(c.parent_id).replies.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  },

  /**
   * 创建评论
   */
  async create({ articleId, userId, parentId, content }) {
    const [result] = await pool.query(
      `INSERT INTO comments (article_id, user_id, parent_id, content)
       VALUES (?, ?, ?, ?)`,
      [articleId, userId, parentId || null, content]
    );
    return result.insertId;
  },

  /**
   * 获取评论详情（用于权限校验）
   */
  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM comments WHERE id = ?', [id]);
    return rows[0] || null;
  },

  /**
   * 删除评论
   */
  async delete(id) {
    const [result] = await pool.query('DELETE FROM comments WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Comment;
