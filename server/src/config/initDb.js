/**
 * 数据库初始化脚本
 * 读取 init.sql 并执行，自动创建所有表
 *
 * 用法: node src/config/initDb.js
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  // 读取 SQL 文件
  const sqlFile = path.join(__dirname, 'init.sql');
  const sql = fs.readFileSync(sqlFile, 'utf-8');

  // 提取所有 CREATE TABLE 语句（去除注释行后匹配）
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => {
      // 去掉注释行后再判断是否包含 CREATE TABLE
      const cleaned = s.split('\n').filter(line => !line.trim().startsWith('--')).join('\n').trim();
      return cleaned.length > 0 && cleaned.includes('CREATE TABLE');
    });

  console.log(`📋 解析到 ${statements.length} 条建表语句\n`);

  // 创建连接（不指定 database，因为数据库可能还不存在）
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    // 确保数据库存在
    const dbName = process.env.DB_NAME || 'blog_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE \`${dbName}\``);
    console.log(`✅ 数据库 "${dbName}" 已就绪\n`);

    // 逐条执行建表
    for (const stmt of statements) {
      // 提取表名用于日志
      const match = stmt.match(/CREATE TABLE IF NOT EXISTS\s+(\w+)/i);
      const tableName = match ? match[1] : 'unknown';

      await connection.query(stmt);
      console.log(`✅ 表 "${tableName}" 创建成功`);
    }

    console.log('\n🎉 数据库初始化完成！');
  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initDatabase();
