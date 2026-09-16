const { pool } = require('../config/db');

const categoryController = {
  /**
   * 获取所有分类
   * GET /api/categories
   */
  async list(req, res, next) {
    try {
      const [rows] = await pool.query(
        'SELECT id, name, description FROM categories ORDER BY id ASC'
      );
      res.json({ success: true, data: rows });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = categoryController;
