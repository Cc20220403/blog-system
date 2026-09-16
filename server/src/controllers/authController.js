const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 邮箱格式正则
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const authController = {
  /**
   * 用户注册
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { username, email, password } = req.body;

      // --- 参数校验 ---
      if (!username || !email || !password) {
        return res.status(400).json({ message: '请填写所有必填字段' });
      }
      if (username.length < 3 || username.length > 20) {
        return res.status(400).json({ message: '用户名长度需在 3-20 个字符之间' });
      }
      if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ message: '邮箱格式不正确' });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: '密码至少需要 6 个字符' });
      }

      // --- 重复检查 ---
      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return res.status(409).json({ message: '用户名已被占用' });
      }
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return res.status(409).json({ message: '该邮箱已被注册' });
      }

      // --- 创建用户 ---
      const userId = await User.create({ username, email, password });

      res.status(201).json({
        success: true,
        message: '注册成功',
        data: { id: userId, username, email },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 用户登录
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: '请输入用户名和密码' });
      }

      // 查找用户
      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(401).json({ message: '用户名或密码错误' });
      }

      // 验证密码
      const isMatch = await User.comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: '用户名或密码错误' });
      }

      // 生成 JWT（有效期 7 天）
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: '登录成功',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 获取当前用户信息
   * GET /api/auth/me
   */
  async getMe(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
