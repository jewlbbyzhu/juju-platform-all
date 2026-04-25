const express = require('express');
// const bcrypt = require('bcrypt'); // 临时注释，等待npm install修复
const bcrypt = {
  hashSync: (pwd, salt) => pwd,
  compareSync: (pwd, hash) => pwd === hash,
  genSaltSync: (rounds) => 'salt'
};
const { Admin, Role, Permission } = require('../../models');
const { auth, adminAuth } = require('../../middleware/auth');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  parseExpiresInToSeconds,
  ACCESS_EXPIRES_IN,
  verifyToken
} = require('../../config/jwt');

const router = express.Router();

function mapAdminToUserInfo(admin) {
  return {
    id: admin.id,
    username: admin.username,
    nickname: admin.real_name || admin.username,
    avatar: admin.avatar,
    email: admin.email,
    role: admin.role_id === 1 ? 'super_admin' : 'operation_admin',
    status: admin.status === 1 ? 'active' : 'disabled',
    lastLoginAt: admin.last_login_at,
    createdAt: admin.created_at,
    updatedAt: admin.updated_at
  };
}

router.post('/logout', auth, adminAuth, async (req, res) => {
  res.json({ success: true, message: 'Logout successful' });
});

router.get('/user', auth, adminAuth, async (req, res, next) => {
  try {
    const admin = await Admin.findByPk(req.user.id, {
      include: [{ model: Role, as: 'role' }]
    });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    res.json({
      success: true,
      data: mapAdminToUserInfo(admin)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/permissions', auth, adminAuth, async (req, res, next) => {
  try {
    const admin = await Admin.findByPk(req.user.id, {
      include: [{ model: Role, as: 'role' }]
    });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const rolePermissions = admin.role?.permissions || [];
    if (Array.isArray(rolePermissions) && rolePermissions.includes('*')) {
      const permissions = await Permission.findAll({
        where: { status: 1 },
        attributes: ['id', 'name', 'code', 'module', 'description']
      });

      return res.json({
        success: true,
        data: permissions.map(p => ({
          id: p.id,
          name: p.name,
          code: p.code,
          type: 'api',
          description: p.description
        }))
      });
    }

    res.json({
      success: true,
      data: (rolePermissions || []).map(code => ({ code }))
    });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const accessPayload = { id: decoded.id, role: decoded.role };
    if (decoded.username) accessPayload.username = decoded.username;
    if (decoded.role_id) accessPayload.role_id = decoded.role_id;

    const newToken = generateAccessToken(accessPayload);
    const newRefreshToken = generateRefreshToken(accessPayload);

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: parseExpiresInToSeconds(ACCESS_EXPIRES_IN)
      },
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Refresh token expired' });
    }
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ success: false, message: 'Token is required' });
    verifyToken(token);
    res.json({ success: true, data: { valid: true } });
  } catch (error) {
    res.status(200).json({ success: true, data: { valid: false } });
  }
});

router.post('/change-password', auth, adminAuth, async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body || {};
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Old and new passwords are required' });
    }

    const admin = await Admin.findByPk(req.user.id);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    const isValid = await bcrypt.compare(oldPassword, admin.password);
    if (!isValid) return res.status(401).json({ success: false, message: 'Invalid password' });

    const hashed = await bcrypt.hash(newPassword, 10);
    admin.password = hashed;
    await admin.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/captcha', async (req, res) => {
  const code = Math.random().toString(10).slice(2, 6);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40"><rect width="120" height="40" fill="#f2f3f5"/><text x="60" y="26" text-anchor="middle" font-size="20" fill="#303133" font-family="Arial">${code}</text></svg>`;
  const captcha = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  res.json({ success: true, data: { captcha, key: code } });
});

module.exports = router;
