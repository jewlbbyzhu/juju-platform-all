const jwt = require('jsonwebtoken');

const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

function parseExpiresInToSeconds(expiresIn) {
  if (!expiresIn) return 0;
  if (typeof expiresIn === 'number') return expiresIn;
  if (typeof expiresIn !== 'string') return 0;

  const trimmed = expiresIn.trim();
  if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10);

  const match = trimmed.match(/^(\d+)\s*([smhd])$/i);
  if (!match) return 0;

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  switch (unit) {
  case 's':
    return value;
  case 'm':
    return value * 60;
  case 'h':
    return value * 60 * 60;
  case 'd':
    return value * 24 * 60 * 60;
  default:
    return 0;
  }
}

const generateAccessToken = (payload) => {
  return jwt.sign({ ...payload, tokenType: 'access' }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign({ ...payload, tokenType: 'refresh' }, process.env.JWT_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN
  });
};

const generateToken = generateAccessToken;

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const verifyRefreshToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded || decoded.tokenType !== 'refresh') {
    const err = new Error('Invalid refresh token');
    err.name = 'JsonWebTokenError';
    throw err;
  }
  return decoded;
};

module.exports = {
  ACCESS_EXPIRES_IN,
  REFRESH_EXPIRES_IN,
  parseExpiresInToSeconds,
  generateToken,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken
};
