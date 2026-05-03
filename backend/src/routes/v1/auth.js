const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken } = require('../../config/jwt');
const jwt = require('jsonwebtoken');
const { User } = require('../../models');
const { Op } = require('sequelize');

// 验证码存储：{ phone: { code, expiresAt } }
// TODO: 生产环境应迁移至 Redis，当前内存存储仅用于开发/测试
const mockVerifyCodes = {};
const CODE_EXPIRE_MS = 5 * 60 * 1000; // 5分钟过期

// 内存验证码清理：每10分钟清理过期验证码，防止内存无限增长
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  for (const phone of Object.keys(mockVerifyCodes)) {
    if (mockVerifyCodes[phone].expiresAt < now) {
      delete mockVerifyCodes[phone];
      cleaned++;
    }
  }
  if (cleaned > 0 && process.env.NODE_ENV === 'development') {
    console.log(`[CLEANUP] 清理 ${cleaned} 个过期验证码`);
  }
}, 10 * 60 * 1000);

// 生成6位随机验证码（加密安全）
function generateCode() {
  return crypto.randomInt(100000, 999999).toString();
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

// 统一验证码发送函数
async function sendVerificationCode(phone, type = 'register') {
  if (!phone) {
    throw new Error('Phone required');
  }
  if (!checkRateLimit(phone)) {
    throw new Error('请求过于频繁，请稍后再试');
  }
  const code = generateCode();
  mockVerifyCodes[phone] = { code, expiresAt: Date.now() + CODE_EXPIRE_MS };
  // 仅开发环境输出验证码到日志，生产环境禁止
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] 验证码 ${phone} -> ${code}`);
  }
  return { sent: true, type };
}

// 统一验证码发送路由处理器
async function handleSendCode(req, res) {
  try {
    const { phone, type } = req.body || {};
    const result = await sendVerificationCode(phone, type || 'verify');
    res.json({ success: true, message: 'Code sent', data: result });
  } catch (error) {
    const status = error.message.includes('频繁') ? 429 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
}

// 发送验证码 - 兼容前端 /auth/verification-code
router.post('/verify-code', handleSendCode);

// 前端兼容性路由 - /auth/send-code (别名)
router.post('/send-code', handleSendCode);

// 前端兼容性路由 - /auth/verification-code
router.post('/verification-code', handleSendCode);

// 手机号+验证码登录
router.post('/phone-login', async (req, res) => {
  try {
    const { phone, code } = req.body || {};
    if (!phone || !code) return res.status(400).json({ success: false, message: 'Phone and code required' });
    // 验证验证码
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
      
    let isValidPassword = false;
    if (!user.password) {
      return res.status(400).json({ success: false, message: '请先设置密码' });
    }
    if (user.password.startsWith('$2')) {
      // bcrypt哈希
      isValidPassword = await bcrypt.compare(password, user.password);
    } else {
      // 非bcrypt哈希密码（可能是旧明文或其他格式），一律拒绝并提示重置
      return res.status(401).json({ success: false, message: '密码格式已过期，请通过"忘记密码"重置密码' });
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
        // 生产环境：必须配置微信API才允许微信登录
        if (!process.env.WECHAT_APPID || !process.env.WECHAT_SECRET) {
          return res.status(500).json({ success: false, message: '微信登录暂未开放' });
        }
        // TODO: 替换为真实微信API调用: https://api.weixin.qq.com/sns/jscode2session
        // 临时返回错误，要求真实微信API集成完成前不可用
        return res.status(501).json({ success: false, message: '微信登录功能正在维护中' });
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
    logger.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' }); 
  }
});

// 手机号注册
router.post('/register', async (req, res) => {
  try {
    const { phone, password, code, nickname } = req.body || {};
    
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Phone and password required' });
    }
    
    // 验证验证码（必须提供）
    if (!code) {
      return res.status(400).json({ success: false, message: 'Verification code required' });
    }
    const stored = mockVerifyCodes[phone];
    if (!stored || Date.now() > stored.expiresAt) return res.status(400).json({ success: false, message: '验证码已过期，请重新获取' });
    if (code !== stored.code) return res.status(400).json({ success: false, message: 'Invalid verification code' });
    
    // 检查用户是否已存在
    let existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }
    
    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 12);
    
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
// 使用auth中间件复用JWT验证逻辑
const { auth: authMiddleware } = require('../../middleware/auth');

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
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
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
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
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const token = req.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const expiresIn = decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 3600;
        if (expiresIn > 0) {
          const TokenBlacklist = require('../../utils/tokenBlacklist');
          await TokenBlacklist.addToBlacklist(token, expiresIn, 'user_logout');
        }
      } catch (e) {
        // Token无效或已过期，无需加入黑名单
      }
    }
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
    const { phone, oldPassword, verificationCode, newPassword } = req.body || {};
    if (!phone || !newPassword) {
      return res.status(400).json({ success: false, message: 'Phone and new password required' });
    }
    // 验证短信验证码（必须提供且匹配）
    if (!verificationCode) {
      return res.status(400).json({ success: false, message: 'Verification code required' });
    }
    const stored = mockVerifyCodes[phone];
    if (!stored || Date.now() > stored.expiresAt) {
      return res.status(400).json({ success: false, message: '验证码已过期，请重新获取' });
    }
    if (verificationCode !== stored.code) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }
    // 验证通过后删除验证码，防止重放攻击
    delete mockVerifyCodes[phone];

    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 密码验证：仅支持bcrypt哈希，彻底废弃明文迁移通道
    let passwordValid = false;
    if (!oldPassword) {
      return res.status(400).json({ success: false, message: '原密码不能为空' });
    }
    if (user.password) {
      if (user.password.startsWith('$2')) {
        passwordValid = await bcrypt.compare(oldPassword, user.password);
      } else {
        // 非bcrypt密码视为格式错误，强制重置
        return res.status(401).json({ success: false, message: '密码格式已过期，请通过"忘记密码"重置密码' });
      }
    } else {
      // 无密码用户：允许通过验证码直接重置（仅开发环境）
      if (process.env.NODE_ENV === 'production') {
        return res.status(401).json({ success: false, message: '请先设置密码后再进行重置操作' });
      }
      passwordValid = true;
    }
    if (!passwordValid) {
      return res.status(401).json({ success: false, message: '原密码错误' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
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
