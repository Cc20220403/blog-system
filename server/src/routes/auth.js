const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// 登录/注册限速：每个 IP 每分钟最多 5 次
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { message: '操作过于频繁，请稍后再试' },
});

// 公开路由
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);

// 需要认证的路由
router.get('/me', authenticate, authController.getMe);

module.exports = router;
