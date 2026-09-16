const jwt = require('jsonwebtoken');

/**
 * JWT 认证中间件
 * 验证请求头中的 Bearer Token
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未提供认证令牌' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // 将用户信息挂载到 req
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '令牌已过期' });
    }
    return res.status(403).json({ message: '无效的认证令牌' });
  }
}

/**
 * 可选认证中间件
 * 尝试解析 Token，但不强制要求（用于公开接口需要识别用户身份的场景）
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch {
    // Token 无效时忽略，不阻断请求
  }
  next();
}

module.exports = { authenticate, optionalAuth };
