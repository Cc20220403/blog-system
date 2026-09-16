/**
 * 全局错误处理中间件
 */
function errorHandler(err, req, res, next) {
  console.error('错误:', err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * 404 处理中间件
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `找不到路由 ${req.originalUrl}`,
  });
}

module.exports = { errorHandler, notFoundHandler };
