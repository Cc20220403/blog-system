const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth');

// 上传独立限速：每个 IP 每分钟最多 10 次
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: '上传过于频繁，请稍后再试' },
});

// 上传图片（需要登录）
router.post('/', authenticate, uploadLimiter, uploadController.uploadImage);

module.exports = router;
