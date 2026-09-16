const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

const SALT_ROUNDS = 10;

const User = {
  /**
   * 根据用户名查找用户
   */
  async findByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  },

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  /**
   * 根据 ID 查找用户（不返回密码）
   */
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, username, email, avatar, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * 创建新用户
   */
  async create({ username, email, password }) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    return result.insertId;
  },

  /**
   * 验证密码
   */
  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },
};

module.exports = User;
