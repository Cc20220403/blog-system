const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const likeController = require('../controllers/likeController');
const commentController = require('../controllers/commentController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// 公开路由（带可选认证，用于识别用户身份）
router.get('/', optionalAuth, postController.list);           // 文章列表
router.get('/:id', optionalAuth, postController.detail);      // 文章详情
router.get('/:id/like-status', optionalAuth, likeController.getStatus); // 点赞状态
router.get('/:id/comments', commentController.list);                     // 评论列表

// 需要登录的路由
router.post('/', authenticate, postController.create);       // 创建文章
router.put('/:id', authenticate, postController.update);     // 更新文章
router.delete('/:id', authenticate, postController.delete);  // 删除文章
router.post('/:id/like', authenticate, likeController.toggle); // 点赞/取消点赞
router.post('/:id/comments', authenticate, commentController.create); // 发表评论

module.exports = router;
