/**
 * 迁移脚本：为 articles 表添加 status 索引
 * 优化列表查询 WHERE status = 'published' 和 WHERE status = 'draft' AND author_id = ?
 */
const { pool } = require('../config/db');

async function migrate() {
  try {
    // 检查索引是否已存在
    const [indexes] = await pool.query(
      "SHOW INDEX FROM articles WHERE Key_name = 'idx_status_author'"
    );
    if (indexes.length > 0) {
      console.log('✅ 索引 idx_status_author 已存在，跳过');
      return;
    }

    await pool.query(
      'ALTER TABLE articles ADD INDEX idx_status_author (status, author_id)'
    );
    console.log('✅ 索引 idx_status_author 添加成功');
  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
  }
}

migrate();
