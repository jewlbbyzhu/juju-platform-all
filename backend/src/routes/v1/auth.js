const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken } = require('../../config/jwt');
const { User } = require('../../models');
const { Op } = require('sequelize');

// 验证码存储：{ phone: { code, expiresAt } }
const mockVerifyCodes = {};
const CODE_EXPIRE_MS = 5 * 60 * 1000; // 5分钟过期

// 生成6位随机验证码
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 简单内存限速：{ phone: [timestamps] }
const rateLimitMap = {};
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 60秒内
const RATE_LIMIT_MAX = 5; // 最多5次

function checkRateLimit(identifier) {
  const now = Date.now();
  if (!rateLimitMap[identifier]) rateLimitMap[identifier] = [];
  rateLimitMap[identifier] = rateLimitMap[identifier].filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (rateLimitMap[identifier].length >= RATE_LIMIT_MAX) return false;
  rateLimitMap[identifier].push(now);
  return true;
}

// 发送验证码 - 兼容前端 /auth/verification-code
router.post('/verify-code', async (req, res) => {
  try {
    const { phone } = req.body || {};
    if (!phone) return res.status(400).json({ success: false, message: 'Phone required' });
    if (!checkRateLimit(phone)) return res.status(429).json({ success: false, message: '请求过于频繁，请稍后再试' });
    const code = generateCode();
    mockVerifyCodes[phone] = { code, expiresAt: Date.now() + CODE_EXPIRE_MS };
    console.log(`[DEV] 验证码 ${phone} -> ${code}`); // 开发环境日志，生产应替换为真实短信
    res.json({ success: true, message: 'Code sent', data: { sent: true } });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed' }); }
});

// 前端兼容性路由 - /auth/send-code (别名)
router.post('/send-code', async (req, res) => {
  try {
    const { phone } = req.body || {};
    if (!phone) return res.status(400).json({ success: false, message: 'Phone required' });
    if (!checkRateLimit(phone)) return res.status(429).json({ success: false, message: '请求过于频繁，请稍后再试' });
    const code = generateCode();
    mockVerifyCodes[phone] = { code, expiresAt: Date.now() + CODE_EXPIRE_MS };
    console.log(`[DEV] 验证码 ${phone} -> ${code}`); // 开发环境日志，生产应替换为真实短信
    res.json({ success: true, message: 'Code sent', data: { sent: true } });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed' }); }
});

// 前端兼容性路由 - /auth/verification-code
router.post('/verification-code', async (req, res) => {
  try {
    const { phone, type } = req.body || {};
    if (!phone) return res.status(400).json({ success: false, message: 'Phone required' });
    if (!checkRateLimit(phone)) return res.status(429).json({ success: false, message: '请求过于频繁，请稍后再试' });
    const code = generateCode();
    mockVerifyCodes[phone] = { code, expiresAt: Date.now() + CODE_EXPIRE_MS };
    console.log(`[DEV] 验证码 ${phone} -> ${code}`); // 开发环境日志，生产应替换为真实短信
    res.json({ success: true, message: 'Code sent', data: { sent: true, type: type || 'register' } });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed' }); }
});

// 手机号+验证码登录
router.post('/phone-login', async (req, res) => {
  try {
    const { phone, code } = req.body || {};
    if (!phone || !code) return res.status(400).json({ success: false, message: 'Phone and code required' });
    // 验证验证码（开发环境支持万能码 123456）
    const stored = mockVerifyCodes[phone];
    if (!stored || Date.now() > stored.expiresAt) return res.status(400).json({ success: false, message: '验证码已过期，请重新获取' });
    if (code !== stored.code) return res.status(400).json({ success: false, message: 'Invalid code' });
    let user = await User.findOne({ where: { phone } });
    if (!user) { user = await User.create({ phone, nickname: '用户' + phone.slice(-4), gender: 0, language: 'zh_CN', status: 1 }); }
    user.last_login_at = new Date(); await user.save();
    const accessPayload = { id: user.id, role: 'user' };
    const token = generateAccessToken(accessPayload);
    const refreshToken = generateRefreshToken(accessPayload);
    res.json({ success: true, message: 'Login successful', data: { token, refreshToken, userInfo: { id: user.id, nickname: user.nickname, avatar: user.avatar, phone: user.phone, gender: user.gender } } });
  } catch (error) { res.status(500).json({ success: false, message: 'Login failed' }); }
});

// 手机号+密码登录
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body || {};
    
    // 支持两种模式：手机号+密码 或 微信code登录
    if (phone && password) {
      // 手机号+密码登录
      if (!phone || !password) {
        return res.status(400).json({ success: false, message: 'Phone and password required' });
      }
      
      let user = await User.findOne({ where: { phone } });
      if (!user) {
        return res.status(400).json({ success: false, message: 'User not found' });
      }
      
      // 验证密码（双模式：支持bcrypt哈希和明文迁移）
      if (!user.password) {
        return res.status(400).json({ success: false, message: '请先设置密码' });
      }
      let isValidPassword = false;
      if (user.password.startsWith('$2')) {
        // bcrypt哈希
        isValidPassword = await bcrypt.compare(password, user.password);
      } else {
        // 明文密码（旧数据迁移）
        isValidPassword = (password === user.password);
        if (isValidPassword) {
          // 自动升级：明文密码迁移为bcrypt哈希
          user.password = await bcrypt.hash(password, 10);
          await user.save();
          console.log(`[MIGRATION] 用户 ${phone} 密码已从明文升级为bcrypt`);
        }
      }
      if (!isValidPassword) {
        return res.status(400).json({ success: false, message: 'Invalid password' });
      }
      
      user.last_login_at = new Date();
      await user.save();
      
      const accessPayload = { id: user.id, role: 'user', phone };
      const token = generateAccessToken(accessPayload);
      const refreshToken = generateRefreshToken(accessPayload);
      
      res.json({ 
        success: true, 
        message: 'Login successful', 
        data: { 
          token, 
          refreshToken, 
          user: { 
            id: user.id, 
            nickname: user.nickname, 
            name: user.nickname,
            avatar: user.avatar, 
            phone: user.phone,
            gender: user.gender,
            is_vip: user.is_vip,
            vip_level: user.vip_level
          } 
        } 
      });
    } else {
      // 微信code登录逻辑
      const { code } = req.body || {};
      if (!code) return res.status(400).json({ success: false, message: 'Code required' });
      
      // 生产环境应调用微信API获取真实openid
      // TODO: 替换为真实微信API调用: https://api.weixin.qq.com/sns/jscode2session
      let openid;
      if (process.env.NODE_ENV === 'production') {
        // 生产环境：调用微信API（此处需要配置 WECHAT_APPID 和 WECHAT_SECRET）
        if (!process.env.WECHAT_APPID || !process.env.WECHAT_SECRET) {
          return res.status(500).json({ success: false, message: '微信登录未配置' });
        }
        // 实际应调用微信接口，此处placeholder
        openid = `wechat_${code}_${Date.now()}`;
      } else {
        // 开发环境：使用模拟openid（仅供测试）
        openid = `dev_openid_${code}`;
      }
      
      let user = await User.findOne({ where: { openid } });
      if (!user) { user = await User.create({ openid, nickname: '微信用户', gender: 0, language: 'zh_CN', status: 1 }); }
      user.last_login_at = new Date(); await user.save();
      const accessPayload = { id: user.id, role: 'user', openid };
      const token = generateAccessToken(accessPayload);
      const refreshToken = generateRefreshToken(accessPayload);
      res.json({ success: true, message: 'Login successful', data: { token, refreshToken, userInfo: { id: user.id, nickname: user.nickname, avatar: user.avatar, phone: user.phone } } });
    }
  } catch (error) { 
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed: ' + error.message }); 
  }
});

// 手机号注册
router.post('/register', async (req, res) => {
  try {
    const { phone, password, code, nickname } = req.body || {};
    
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Phone and password required' });
    }
    
    // 验证验证码（如果提供了）
    if (code) {
      const stored = mockVerifyCodes[phone];
      if (!stored || Date.now() > stored.expiresAt) return res.status(400).json({ success: false, message: '验证码已过期，请重新获取' });
      if (code !== stored.code) return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }
    
    // 检查用户是否已存在
    let existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }
    
    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建新用户
    const user = await User.create({ 
      phone, 
      password: hashedPassword,
      nickname: nickname || ('用户' + phone.slice(-4)), 
      gender: 0, 
      language: 'zh_CN', 
      status: 1 
    });
    
    // 生成token
    const accessPayload = { id: user.id, role: 'user', phone };
    const token = generateAccessToken(accessPayload);
    const refreshToken = generateRefreshToken(accessPayload);
    
    res.json({ 
      success: true, 
      message: 'Registration successful', 
      data: { 
        token, 
        refreshToken, 
        user: { 
          id: user.id,
          nickname: user.nickname,
          name: user.nickname,
          avatar: user.avatar,
          phone: user.phone,
          gender: user.gender,
          is_vip: user.is_vip,
          vip_level: user.vip_level
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed: ' + error.message });
  }
});

// 前端兼容性路由 - GET /auth/me 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      data: {
        id: user.id,
        nickname: user.nickname,
        name: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
        email: user.email,
        gender: user.gender,
        is_vip: user.is_vip,
        vip_level: user.vip_level
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// 前端兼容性路由 - PATCH /auth/profile 更新用户信息
router.patch('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { nickname, avatar, gender } = req.body;
    if (nickname) user.nickname = nickname;
    if (avatar) user.avatar = avatar;
    if (gender !== undefined) user.gender = gender;
    await user.save();
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        nickname: user.nickname,
        name: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
        gender: user.gender,
        is_vip: user.is_vip,
        vip_level: user.vip_level
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Update failed: ' + error.message });
  }
});

// 前端兼容性路由 - POST /auth/logout 退出登录
router.post('/logout', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
});

// 前端兼容性路由 - POST /auth/reset-password 重置密码
router.post('/reset-password', async (req, res) => {
  try {
    const { phone, verificationCode, newPassword } = req.body || {};
    if (!phone || !newPassword) {
      return res.status(400).json({ success: false, message: 'Phone and new password required' });
    }
    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Reset failed: ' + error.message });
  }
});

module.exports = router;
