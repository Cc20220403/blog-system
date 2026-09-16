const { pool } = require('../config/db');

const archiveController = {
  /**
   * 获取文章归档（按月分组）
   * GET /api/archives
   */
  async list(req, res, next) {
    try {
      const [rows] = await pool.query(
        `SELECT
           DATE_FORMAT(a.created_at, '%Y-%m') AS month,
           COUNT(*) AS count,
           JSON_ARRAYAGG(
             JSON_OBJECT(
               'id', a.id,
               'title', a.title,
               'created_at', a.created_at
             ) ORDER BY a.created_at ASC
           ) AS articles
         FROM articles a
         WHERE a.status = 'published'
         GROUP BY DATE_FORMAT(a.created_at, '%Y-%m')
         ORDER BY month DESC`
      );

      // 格式化月份标签
      const data = rows.map((row) => {
        const [year, month] = row.month.split('-');
        return {
          month: row.month,
          label: `${year} 年 ${parseInt(month)} 月`,
          count: row.count,
          articles: typeof row.articles === 'string' ? JSON.parse(row.articles) : row.articles,
        };
      });

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = archiveController;
