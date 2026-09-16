const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');

// 删除评论（需要登录）
router.delete('/:id', authenticate, commentController.delete);

module.exports = router;
