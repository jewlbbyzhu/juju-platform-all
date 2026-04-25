const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken } = require('../../config/jwt');
const { User } = require('../../models');
const { Op } = require('sequelize');

const mockVerifyCodes = {};

// 发送验证码 - 兼容前端 /auth/verification-code
router.post('/verify-code', async (req, res) => {
  try {
    const { phone } = req.body || {};
    if (!phone) return res.status(400).json({ success: false, message: 'Phone required' });
    mockVerifyCodes[phone] = '123456';
    res.json({ success: true, message: 'Code sent', data: { sent: true } });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed' }); }
});

// 前端兼容性路由 - /auth/verification-code
router.post('/verification-code', async (req, res) => {
  try {
    const { phone, type } = req.body || {};
    if (!phone) return res.status(400).json({ success: false, message: 'Phone required' });
    mockVerifyCodes[phone] = '123456';
    res.json({ success: true, message: 'Code sent', data: { sent: true, type: type || 'register' } });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed' }); }
});

// 手机号+验证码登录
router.post('/phone-login', async (req, res) => {
  try {
    const { phone, code } = req.body || {};
    if (!phone || !code) return res.status(400).json({ success: false, message: 'Phone and code required' });
    if (code !== '123456') return res.status(400).json({ success: false, message: 'Invalid code' });
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
      
      // 验证密码
      if (user.password) {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(400).json({ success: false, message: 'Invalid password' });
        }
      } else {
        // 如果没有设置密码，默认密码是 123456
        if (password !== '123456') {
          return res.status(400).json({ success: false, message: 'Invalid password' });
        }
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
      // 原有的微信code登录逻辑
      const { code } = req.body || {};
      if (!code) return res.status(400).json({ success: false, message: 'Code required' });
      let openid = 'smoke_openid_68713bff0761d19bdf351646';
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
    if (code && code !== '123456' && code !== '000000') {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
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
