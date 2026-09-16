const { pool } = require('../config/db');

const rssController = {
  /**
   * 生成 RSS 2.0 XML
   * GET /api/rss
   */
  async generate(req, res, next) {
    try {
      // 查询最近 20 篇已发布文章（只取前 300 字内容，减少数据传输）
      const [rows] = await pool.query(
        `SELECT a.id, a.title, LEFT(a.content, 300) AS content_excerpt, a.created_at, u.username AS author_name
         FROM articles a
         LEFT JOIN users u ON a.author_id = u.id
         WHERE a.status = 'published'
         ORDER BY a.created_at DESC
         LIMIT 20`
      );

      // 构建 RSS XML
      const siteUrl = process.env.SITE_URL || 'http://localhost:5173';
      const siteTitle = '个人博客';
      const siteDescription = '一个分享技术与生活的个人博客';

      const items = rows.map((row) => {
        const link = `${siteUrl}/post/${row.id}`;
        // 截取内容前 200 字作为描述
        const description = (row.content_excerpt || '')
          .replace(/[#*`>\[\]()!]/g, '') // 去除 Markdown 标记
          .slice(0, 200)
          .trim();
        const pubDate = new Date(row.created_at).toUTCString();

        return `
    <item>
      <title>${escapeXml(row.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description>${escapeXml(description)}</description>
      <author>${escapeXml(row.author_name || '')}</author>
      <pubDate>${pubDate}</pubDate>
    </item>`;
      }).join('');

      const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>zh-cn</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

      res.set('Content-Type', 'application/xml');
      res.send(rss);
    } catch (error) {
      next(error);
    }
  },
};

/**
 * 转义 XML 特殊字符
 */
function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = rssController;
