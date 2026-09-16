const { pool } = require('../config/db');

const Post = {
  /**
   * 创建文章
   */
  async create({ title, content, cover, category, tags, authorId, status = 'published' }) {
    const tagsJson = tags ? JSON.stringify(tags) : null;
    const [result] = await pool.query(
      `INSERT INTO articles (title, content, cover, category, tags, author_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, content, cover, category, tagsJson, authorId, status]
    );
    return result.insertId;
  },

  /**
   * 获取文章列表（分页 + 分类筛选 + 搜索）
   * 返回 { list, total }
   */
  async findAll({ page = 1, pageSize = 10, category, keyword, status = 'published', authorId }) {
    const conditions = [];
    const params = [];

    // 状态过滤
    conditions.push('a.status = ?');
    params.push(status);

    // 查草稿时限定作者
    if (status === 'draft' && authorId) {
      conditions.push('a.author_id = ?');
      params.push(authorId);
    }

    if (category) {
      conditions.push('a.category = ?');
      params.push(category);
    }
    if (keyword) {
      conditions.push('(a.title LIKE ? OR a.content LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 查总数
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM articles a ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    // 查列表（关联作者名和分类名）
    const offset = (page - 1) * pageSize;
    const [rows] = await pool.query(
      `SELECT
         a.id, a.title, a.cover, a.tags, a.views, a.status,
         a.created_at, a.updated_at,
         u.username AS author_name,
         c.name     AS category_name,
         (SELECT COUNT(*) FROM likes l WHERE l.article_id = a.id) AS likes_count
       FROM articles a
       LEFT JOIN users      u ON a.author_id = u.id
       LEFT JOIN categories c ON a.category  = c.id
       ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    // 解析 tags JSON
    const list = rows.map(row => ({
      ...row,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags || [],
    }));

    return { list, total };
  },

  /**
   * 获取文章详情（含作者信息）
   */
  async findById(id) {
    const [rows] = await pool.query(
      `SELECT
         a.*,
         u.username AS author_name,
         u.avatar   AS author_avatar,
         c.name     AS category_name
       FROM articles a
       LEFT JOIN users      u ON a.author_id = u.id
       LEFT JOIN categories c ON a.category  = c.id
       WHERE a.id = ?`,
      [id]
    );
    if (!rows[0]) return null;

    return {
      ...rows[0],
      tags: typeof rows[0].tags === 'string' ? JSON.parse(rows[0].tags) : rows[0].tags || [],
    };
  },

  /**
   * 获取用户的草稿数量
   */
  async countDrafts(authorId) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS total FROM articles WHERE author_id = ? AND status = ?',
      [authorId, 'draft']
    );
    return rows[0].total;
  },

  /**
   * 浏览次数 +1
   */
  async incrementViews(id) {
    await pool.query('UPDATE articles SET views = views + 1 WHERE id = ?', [id]);
  },

  /**
   * 更新文章（动态更新指定字段）
   */
  async update(id, fields) {
    const allowed = ['title', 'content', 'cover', 'category', 'tags', 'status'];
    const keys = Object.keys(fields).filter(k => allowed.includes(k));
    if (keys.length === 0) return false;

    const sets = [];
    const values = [];
    for (const key of keys) {
      if (key === 'tags') {
        sets.push('tags = ?');
        values.push(JSON.stringify(fields.tags));
      } else {
        sets.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }
    values.push(id);

    await pool.query(
      `UPDATE articles SET ${sets.join(', ')} WHERE id = ?`,
      values
    );
    return true;
  },

  /**
   * 删除文章
   */
  async delete(id) {
    const [result] = await pool.query('DELETE FROM articles WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Post;
