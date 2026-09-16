const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const routes = require('./routes');
const { testConnection } = require('./config/db');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== 安全中间件 ==========
app.use(helmet()); // 安全 HTTP 头（X-Frame-Options, CSP 等）

// CORS：开发环境允许 localhost，生产环境应改为具体域名
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)
    : true,
}));

// 请求体大小限制
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 全局限速：每个 IP 每分钟最多 100 次请求
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { message: '请求过于频繁，请稍后再试' },
}));

// 请求日志（开发环境）
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ========== 静态文件托管 ==========
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ========== 路由 ==========
app.use('/api', routes);

// ========== 错误处理 ==========
app.use(notFoundHandler);
app.use(errorHandler);

// ========== 启动服务器 ==========
async function start() {
  // 测试数据库连接
  const dbOk = await testConnection();
  if (!dbOk) {
    console.error('❌ 数据库连接失败，进程退出');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📋 环境: ${process.env.NODE_ENV || 'development'}`);
  });
}

start();

module.exports = app;
