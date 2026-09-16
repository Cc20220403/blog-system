const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const postRoutes = require('./posts');
const categoryRoutes = require('./categories');
const uploadRoutes = require('./upload');
const commentRoutes = require('./comments');
const archiveRoutes = require('./archives');
const rssRoutes = require('./rss');

// 挂载各模块路由
router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/categories', categoryRoutes);
router.use('/upload', uploadRoutes);
router.use('/comments', commentRoutes);
router.use('/archives', archiveRoutes);
router.use('/rss', rssRoutes);

// 健康检查
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
