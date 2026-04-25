/**
 * 数据脱敏工具
 * 用于在API响应中自动脱敏敏感字段
 */

const { sanitizeForLog } = require('./logSanitizer');

// 脱敏规则类型
const MASKING_TYPES = {
  PHONE: 'phone',           // 手机号脱敏
  ID_CARD: 'idCard',        // 身份证脱敏
  BANK_CARD: 'bankCard',    // 银行卡脱敏
  EMAIL: 'email',           // 邮箱脱敏
  NAME: 'name',             // 姓名脱敏
  ADDRESS: 'address',       // 地址脱敏
  PARTIAL: 'partial',       // 部分脱敏
  HASH: 'hash',             // 哈希脱敏
  HIDE: 'hide',             // 完全隐藏
  CUSTOM: 'custom'          // 自定义脱敏
};

// 客户端脱敏级别
/* eslint-disable no-unused-vars */
const MASKING_LEVELS = {
  NONE: 0,      // 不脱敏（管理后台）
  LOW: 1,       // 低级脱敏（内部系统）
  MEDIUM: 2,    // 中级脱敏（移动端）
  HIGH: 3       // 高级脱敏（小程序、官网）
};

// 客户端脱敏配置
const CLIENT_MASKING_CONFIG = {
  web: MASKING_LEVELS.NONE,        // 管理后台不脱敏
  app: MASKING_LEVELS.MEDIUM,      // 移动端中级脱敏
  miniprogram: MASKING_LEVELS.HIGH, // 小程序高级脱敏
  website: MASKING_LEVELS.HIGH     // 官网高级脱敏
};

// 字段脱敏规则配置
const FIELD_MASKING_RULES = {
  // 用户信息
  phone: { type: MASKING_TYPES.PHONE, levels: [MASKING_LEVELS.MEDIUM, MASKING_LEVELS.HIGH] },
  mobile: { type: MASKING_TYPES.PHONE, levels: [MASKING_LEVELS.MEDIUM, MASKING_LEVELS.HIGH] },
  idCard: { type: MASKING_TYPES.ID_CARD, levels: [MASKING_LEVELS.LOW, MASKING_LEVELS.MEDIUM, MASKING_LEVELS.HIGH] },
  realName: { type: MASKING_TYPES.NAME, levels: [MASKING_LEVELS.MEDIUM, MASKING_LEVELS.HIGH] },
  email: { type: MASKING_TYPES.EMAIL, levels: [MASKING_LEVELS.MEDIUM, MASKING_LEVELS.HIGH] },
  address: { type: MASKING_TYPES.ADDRESS, levels: [MASKING_LEVELS.MEDIUM, MASKING_LEVELS.HIGH] },
  
  // 银行卡信息
  cardNumber: { type: MASKING_TYPES.BANK_CARD, levels: [MASKING_LEVELS.LOW, MASKING_LEVELS.MEDIUM, MASKING_LEVELS.HIGH] },
  bankCard: { type: MASKING_TYPES.BANK_CARD, levels: [MASKING_LEVELS.LOW, MASKING_LEVELS.MEDIUM, MASKING_LEVELS.HIGH] },
  holderName: { type: MASKING_TYPES.NAME, levels: [MASKING_LEVELS.MEDIUM, MASKING_LEVELS.HIGH] },
  
  // 支付信息
  outTradeNo: { type: MASKING_TYPES.PARTIAL, levels: [MASKING_LEVELS.HIGH] },
  transactionId: { type: MASKING_TYPES.PARTIAL, levels: [MASKING_LEVELS.HIGH] },
  prepayId: { type: MASKING_TYPES.HIDE, levels: [MASKING_LEVELS.MEDIUM, MASKING_LEVELS.HIGH] },
  
  // 微信信息
  openid: { type: MASKING_TYPES.HASH, levels: [MASKING_LEVELS.MEDIUM, MASKING_LEVELS.HIGH] },
  unionid: { type: MASKING_TYPES.HASH, levels: [MASKING_LEVELS.MEDIUM, MASKING_LEVELS.HIGH] },
  
  // 设备信息
  deviceId: { type: MASKING_TYPES.HASH, levels: [MASKING_LEVELS.HIGH] },
  ip: { type: MASKING_TYPES.PARTIAL, levels: [MASKING_LEVELS.MEDIUM, MASKING_LEVELS.HIGH] }
};

/**
 * 手机号脱敏
 */
function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return phone;
  
  if (phone.length === 11) {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }
  
  if (phone.length >= 5) {
    return phone.replace(/(\d{3})\d{4}(\d{2,})/, '$1****$2');
  }
  
  return phone;
}

/**
 * 身份证号脱敏
 */
function maskIdCard(idCard) {
  if (!idCard || typeof idCard !== 'string') return idCard;
  
  if (idCard.length === 18) {
    return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
  } else if (idCard.length === 15) {
    return idCard.replace(/(\d{6})\d{6}(\d{3})/, '$1******$2');
  }
  
  return idCard;
}

/**
 * 银行卡号脱敏
 */
function maskBankCard(cardNumber) {
  if (!cardNumber || typeof cardNumber !== 'string') return cardNumber;
  
  if (cardNumber.length >= 16) {
    return cardNumber.replace(/(\d{4})\d+(\d{4})/, '$1****$2');
  }
  
  return cardNumber.replace(/(\d{4})\d+(\d{2})/, '$1****$2');
}

/**
 * 邮箱脱敏
 */
function maskEmail(email) {
  if (!email || typeof email !== 'string') return email;
  
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) return email;
  
  const username = email.substring(0, atIndex);
  const domain = email.substring(atIndex);
  
  if (username.length <= 1) {
    return username + '***' + domain;
  } else if (username.length === 2) {
    return username.charAt(0) + '***' + domain;
  } else {
    return username.substring(0, 2) + '***' + username.substring(username.length - 1) + domain;
  }
}

/**
 * 姓名脱敏
 */
function maskName(name) {
  if (!name || typeof name !== 'string') return name;
  
  if (name.length === 1) {
    return '*';
  } else if (name.length === 2) {
    return name.charAt(0) + '*';
  } else {
    return name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1);
  }
}

/**
 * 地址脱敏
 */
function maskAddress(address) {
  if (!address || typeof address !== 'string') return address;
  
  // 保留前2个字符和后2个字符
  if (address.length <= 4) {
    return address.substring(0, 2) + '***' + address.substring(address.length - 2);
  }
  
  return address.substring(0, 6) + '***' + address.substring(address.length - 4);
}

/**
 * 部分脱敏（通用）
 */
function maskPartial(value, keepStart = 3, keepEnd = 3) {
  if (!value || typeof value !== 'string') return value;
  
  if (value.length <= keepStart + keepEnd) {
    return '*'.repeat(value.length);
  }
  
  const start = value.substring(0, keepStart);
  const end = value.substring(value.length - keepEnd);
  const middle = '*'.repeat(value.length - keepStart - keepEnd);
  
  return start + middle + end;
}

/**
 * 哈希脱敏
 */
function maskHash(value) {
  if (!value || typeof value !== 'string') return value;
  
  const crypto = require('crypto');
  const hash = crypto.createHash('md5').update(value).digest('hex');
  return `hash_${hash.substring(0, 8)}`;
}

/**
 * 根据类型脱敏
 */
function maskByType(value, type, options = {}) {
  switch (type) {
  case MASKING_TYPES.PHONE:
    return maskPhone(value);
  case MASKING_TYPES.ID_CARD:
    return maskIdCard(value);
  case MASKING_TYPES.BANK_CARD:
    return maskBankCard(value);
  case MASKING_TYPES.EMAIL:
    return maskEmail(value);
  case MASKING_TYPES.NAME:
    return maskName(value);
  case MASKING_TYPES.ADDRESS:
    return maskAddress(value);
  case MASKING_TYPES.PARTIAL:
    return maskPartial(value, options.keepStart, options.keepEnd);
  case MASKING_TYPES.HASH:
    return maskHash(value);
  case MASKING_TYPES.HIDE:
    return '[HIDDEN]';
  case MASKING_TYPES.CUSTOM:
    return options.customMask ? options.customMask(value) : value;
  default:
    return value;
  }
}

/**
 * 检查字段是否需要脱敏
 */
function shouldMaskField(fieldName, maskingLevel) {
  const rule = FIELD_MASKING_RULES[fieldName];
  return rule && rule.levels.includes(maskingLevel);
}

/**
 * 脱敏单个对象
 */
function maskObject(obj, maskingLevel = MASKING_LEVELS.MEDIUM, depth = 0, maxDepth = 10) {
  // 防止无限递归
  if (depth > maxDepth) {
    return obj;
  }

  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map(item => maskObject(item, maskingLevel, depth + 1, maxDepth));
  }

  // 处理Date对象
  if (obj instanceof Date) {
    return obj;
  }

  // 处理普通对象
  const masked = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (shouldMaskField(key, maskingLevel)) {
      const rule = FIELD_MASKING_RULES[key];
      masked[key] = maskByType(value, rule.type);
    } else if (typeof value === 'object') {
      masked[key] = maskObject(value, maskingLevel, depth + 1, maxDepth);
    } else {
      masked[key] = value;
    }
  }
  
  return masked;
}

/**
 * 根据客户端类型脱敏数据
 */
function maskDataForClient(data, clientType) {
  const maskingLevel = CLIENT_MASKING_CONFIG[clientType] || MASKING_LEVELS.MEDIUM;
  
  // 如果不需要脱敏，直接返回
  if (maskingLevel === MASKING_LEVELS.NONE) {
    return data;
  }
  
  return maskObject(data, maskingLevel);
}

/**
 * 创建数据脱敏中间件
 */
function createDataMaskingMiddleware(options = {}) {
  const config = {
    enableMasking: true,
    customRules: {},
    excludePaths: ['/health', '/api-docs'],
    ...options
  };

  return (req, res, next) => {
    // 跳过排除的路径
    if (config.excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // 如果禁用脱敏，直接跳过
    if (!config.enableMasking) {
      return next();
    }

    // 拦截响应进行脱敏
    const originalJson = res.json;
    res.json = function(data) {
      try {
        // 获取客户端类型
        const clientType = req.client?.type || 'app';
        
        // 脱敏响应数据
        if (data && typeof data === 'object' && data.data) {
          data.data = maskDataForClient(data.data, clientType);
        }
        
        return originalJson.call(this, data);
      } catch (error) {
        console.error('Data masking error:', error);
        // 脱敏失败时返回原数据
        return originalJson.call(this, data);
      }
    };

    next();
  };
}

/**
 * 用户数据脱敏器
 */
class UserDataMasker {
  constructor(clientType = 'app') {
    this.maskingLevel = CLIENT_MASKING_CONFIG[clientType] || MASKING_LEVELS.MEDIUM;
  }

  /**
   * 脱敏用户基本信息
   */
  maskUserProfile(user) {
    return maskObject(user, this.maskingLevel);
  }

  /**
   * 脱敏用户列表
   */
  maskUserList(users) {
    if (!Array.isArray(users)) return users;
    
    return users.map(user => this.maskUserProfile(user));
  }

  /**
   * 脱敏银行卡信息
   */
  maskBankCardInfo(bankCard) {
    return maskObject(bankCard, this.maskingLevel);
  }

  /**
   * 脱敏订单信息
   */
  maskOrderInfo(order) {
    return maskObject(order, this.maskingLevel);
  }
}

/**
 * 管理员数据脱敏器（用于管理后台）
 */
class AdminDataMasker {
  constructor() {
    this.maskingLevel = MASKING_LEVELS.LOW; // 管理后台使用低级脱敏
  }

  /**
   * 脱敏用户详情（管理后台查看）
   */
  maskUserDetails(user) {
    // 管理后台需要看到更多信息，但仍需要部分脱敏
    const masked = { ...user };
    
    if (masked.idCard) {
      masked.idCard = maskIdCard(masked.idCard);
    }
    
    if (masked.phone) {
      masked.phone = maskPhone(masked.phone);
    }
    
    return masked;
  }

  /**
   * 脱敏敏感操作日志
   */
  maskAuditLogs(logs) {
    if (!Array.isArray(logs)) return logs;
    
    return logs.map(log => ({
      ...log,
      details: sanitizeForLog(log.details),
      ip: maskPartial(log.ip, 3, 0)
    }));
  }
}

/**
 * 导出脱敏数据（用于数据导出功能）
 */
function maskDataForExport(data, exportType = 'csv') {
  // 导出数据使用高级脱敏
  const maskingLevel = MASKING_LEVELS.HIGH;
  
  if (Array.isArray(data)) {
    return data.map(item => maskObject(item, maskingLevel));
  }
  
  return maskObject(data, maskingLevel);
}

module.exports = {
  MASKING_TYPES,
  MASKING_LEVELS,
  CLIENT_MASKING_CONFIG,
  FIELD_MASKING_RULES,
  maskPhone,
  maskIdCard,
  maskBankCard,
  maskEmail,
  maskName,
  maskAddress,
  maskPartial,
  maskHash,
  maskByType,
  maskObject,
  maskDataForClient,
  createDataMaskingMiddleware,
  UserDataMasker,
  AdminDataMasker,
  maskDataForExport
};