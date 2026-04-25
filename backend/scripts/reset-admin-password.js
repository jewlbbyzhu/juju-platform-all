#!/usr/bin/env node
/**
 * 管理员密码重置脚本
 * 用法: node reset-admin-password.js <username> <new_password>
 */

require('dotenv').config({ path: '.env.production' });
const bcrypt = require('bcrypt');
const { sequelize } = require('../src/config/database');
const Admin = require('../src/models/Admin');

async function resetPassword() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('用法: node reset-admin-password.js <username> <new_password>');
    console.log('示例: node reset-admin-password.js eros1101 newpassword123');
    process.exit(1);
  }
  
  const [username, newPassword] = args;
  
  try {
    // 连接数据库
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 查找管理员
    const admin = await Admin.findOne({ where: { username } });
    
    if (!admin) {
      console.error(`错误: 管理员 "${username}" 不存在`);
      process.exit(1);
    }
    
    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 更新密码
    await admin.update({ password: hashedPassword });
    
    console.log('✅ 密码重置成功！');
    console.log(`用户名: ${username}`);
    console.log(`新密码: ${newPassword}`);
    console.log('');
    console.log('请使用新密码登录系统。');
    
    process.exit(0);
  } catch (error) {
    console.error('密码重置失败:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

resetPassword();
