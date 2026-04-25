/**
 * 日志脱敏工具 - 防止敏感信息泄露
 * 用于在记录日志时自动清理敏感数据
 */

// 敏感字段列表
const SENSITIVE_FIELDS = [
  // 身份信息
  'password', 'passwd', 'pwd', 'secret', 'token', 'key', 'auth',
  'authorization', 'bearer', 'session', 'cookie', 'csrf',
  
  // 个人信息
  'idcard', 'id_card', 'identity', 'ssn', 'social_security',
  'passport', 'license', 'phone', 'mobile', 'telephone', 'tel',
  'email', 'mail', 'address', 'location', 'gps', 'coordinate',
  
  // 金融信息
  'bankcard', 'bank_card', 'cardnumber', 'card_number', 'cvv', 'cvc',
  'pin', 'account', 'accountnumber', 'account_number', 'routing',
  'iban', 'swift', 'paypal', 'alipay', 'wechatpay', 'wechat_pay',
  
  // 业务敏感信息
  'apikey', 'api_key', 'privatekey', 'private_key', 'publickey', 'public_key',
  'signature', 'hash', 'salt', 'nonce', 'deviceid', 'device_id',
  
  // 微信相关
  'openid', 'unionid', 'access_token', 'refresh_token', 'app_secret',
  'mch_id', 'mch_key', 'cert_serial_no', 'wechatpay_serial',
  
  // 支付相关
  'out_trade_no', 'transaction_id', 'prepay_id', 'code_url', 'mweb_url'
];

/**
 * 脱敏配置
 */
const SANITIZATION_CONFIG = {
  // 完全隐藏
  HIDE: 'HIDE',
  // 部分隐藏（保留前后几位）
  PARTIAL: 'PARTIAL',
  // 替换为占位符
  PLACEHOLDER: 'PLACEHOLDER',
  // 哈希处理
  HASH: 'HASH'
};

/**
 * 字段脱敏规则
 */
const FIELD_SANITIZATION_RULES = {
  // 完全隐藏
  password: SANITIZATION_CONFIG.HIDE,
  secret: SANITIZATION_CONFIG.HIDE,
  token: SANITIZATION_CONFIG.PLACEHOLDER,
  key: SANITIZATION_CONFIG.HIDE,
  
  // 部分隐藏（保留前后几位）
  phone: { type: 'PARTIAL', keepStart: 3, keepEnd: 4, minAsterisks: 4 },
  mobile: { type: 'PARTIAL', keepStart: 3, keepEnd: 4, minAsterisks: 4 },
  telephone: { type: 'PARTIAL', keepStart: 3, keepEnd: 4, minAsterisks: 4 },
  tel: { type: 'PARTIAL', keepStart: 3, keepEnd: 4, minAsterisks: 4 },
  email: { type: 'PARTIAL', keepStart: 2, keepEnd: 1, minAsterisks: 3 },
  mail: { type: 'PARTIAL', keepStart: 2, keepEnd: 1, minAsterisks: 3 },
  idcard: { type: 'PARTIAL', keepStart: 6, keepEnd: 4, minAsterisks: 8 },
  id_card: { type: 'PARTIAL', keepStart: 6, keepEnd: 4, minAsterisks: 8 },
  identity: { type: 'PARTIAL', keepStart: 6, keepEnd: 4, minAsterisks: 8 },
  bankcard: { type: 'PARTIAL', keepStart: 6, keepEnd: 5, minAsterisks: 4 },
  bank_card: { type: 'PARTIAL', keepStart: 6, keepEnd: 5, minAsterisks: 4 },
  cardnumber: { type: 'PARTIAL', keepStart: 6, keepEnd: 5, minAsterisks: 4 },
  card_number: { type: 'PARTIAL', keepStart: 6, keepEnd: 5, minAsterisks: 4 },
  
  // 哈希处理
  openid: SANITIZATION_CONFIG.HASH,
  unionid: SANITIZATION_CONFIG.HASH,
  deviceid: SANITIZATION_CONFIG.HASH,
  device_id: SANITIZATION_CONFIG.HASH
};

/**
 * 生成简单哈希
 */
function simpleHash(str) {
  if (typeof str !== 'string') return str;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `hash_${Math.abs(hash).toString(16)}`;
}

/**
 * 部分隐藏字符串（带配置）
 */
function partialHideWithConfig(str, config) {
  if (typeof str !== 'string' || str.length <= (config.keepStart + config.keepEnd)) {
    return '*'.repeat(Math.max(str.length, 3));
  }
  
  const start = str.substring(0, config.keepStart);
  const end = str.substring(str.length - config.keepEnd);
  const minAsterisks = config.minAsterisks || 4;
  // 优先使用minAsterisks，但如果实际长度更长，也使用minAsterisks
  const middle = '*'.repeat(minAsterisks);
  
  return start + middle + end;
}

/**
 * 脱敏单个值
 */
function sanitizeValue(value, rule = SANITIZATION_CONFIG.PLACEHOLDER) {
  if (value === null || value === undefined) {
    return value;
  }

  const strValue = String(value);

  switch (rule) {
  case SANITIZATION_CONFIG.HIDE:
    return '[HIDDEN]';
      
  case SANITIZATION_CONFIG.HASH:
    return simpleHash(strValue);
      
  case SANITIZATION_CONFIG.PLACEHOLDER:
  default:
    return '[SANITIZED]';
  }
}

/**
 * 检查字段名是否为敏感字段
 */
function isSensitiveField(fieldName) {
  if (typeof fieldName !== 'string') return false;
  
  const lowerFieldName = fieldName.toLowerCase();
  return SENSITIVE_FIELDS.some(sensitiveField => 
    lowerFieldName === sensitiveField.toLowerCase()
  );
}

/**
 * 脱敏对象
 */
function sanitizeObject(obj, depth = 0, maxDepth = 10, seen = new WeakSet()) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1, maxDepth, seen));
  }

  // 处理基本类型
  if (typeof obj !== 'object') {
    return obj;
  }

  // 处理Date对象
  if (obj instanceof Date) {
    return obj;
  }

  // 处理Error对象
  if (obj instanceof Error) {
    return {
      name: obj.name,
      message: sanitizeString(obj.message),
      stack: process.env.NODE_ENV === 'development' ? obj.stack : '[STACK_HIDDEN]'
    };
  }

  // 处理普通对象
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // 检查字段名是否敏感
    if (isSensitiveField(key)) {
      const rule = FIELD_SANITIZATION_RULES[key.toLowerCase()] || SANITIZATION_CONFIG.PLACEHOLDER;
      
      if (typeof rule === 'string') {
        // 使用简单的规则（HIDE、HASH、PLACEHOLDER）
        sanitized[key] = sanitizeValue(value, rule);
      } else if (rule.type === 'PARTIAL') {
        // 使用配置化的部分隐藏规则
        if (value === null || value === undefined) {
          sanitized[key] = value;
        } else {
          // 对于email字段，特殊处理，保留域名部分
          if (key.toLowerCase() === 'email' && typeof value === 'string' && value.includes('@')) {
            const atIndex = value.indexOf('@');
            const localPart = value.substring(0, atIndex);
            const domainPart = value.substring(atIndex);
            sanitized[key] = partialHideWithConfig(localPart, rule) + domainPart;
          } else {
            sanitized[key] = partialHideWithConfig(String(value), rule);
          }
        }
      } else {
        sanitized[key] = sanitizeValue(value, rule);
      }
    } else {
      // 非敏感字段，递归处理
      if (typeof value === 'string') {
        // 字符串类型，检查是否包含敏感信息
        sanitized[key] = sanitizeString(value);
      } else if (value === null || value === undefined) {
        // null和undefined直接保留
        sanitized[key] = value;
      } else if (typeof value === 'object') {
        // 检查是否达到深度限制
        if (depth + 1 >= maxDepth) {
          sanitized[key] = '[MAX_DEPTH_REACHED]';
        } else if (seen.has(value)) {
          // 检测到循环引用，立即返回标记字符串
          sanitized[key] = '[MAX_DEPTH_REACHED]';
        } else {
          seen.add(value);
          sanitized[key] = sanitizeObject(value, depth + 1, maxDepth, seen);
        }
      } else {
        // 基本类型
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
}

/**
 * 脱敏字符串中的敏感信息
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  
  let sanitized = str;
  
  // 手机号：1[3-9]\d{9}
  sanitized = sanitized.replace(/\b1[3-9]\d{9}\b/g, (match) => {
    return partialHideWithConfig(match, { keepStart: 3, keepEnd: 4, minAsterisks: 4 });
  });
  
  // 身份证号：18位数字（使用word boundary）
  sanitized = sanitized.replace(/\b\d{17}[\dXx]\b/g, (match) => {
    if (match.length === 18) {
      return partialHideWithConfig(match, { keepStart: 6, keepEnd: 4, minAsterisks: 8 });
    }
    return match;
  });
  
  // 银行卡号：16-19位数字（使用word boundary）
  sanitized = sanitized.replace(/\b\d{16,19}\b/g, (match) => {
    if (match.length >= 16 && match.length <= 19) {
      return partialHideWithConfig(match, { keepStart: 6, keepEnd: 5, minAsterisks: 4 });
    }
    return match;
  });
  
  // 邮箱：[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (match) => {
    const atIndex = match.indexOf('@');
    if (atIndex > 0) {
      const localPart = match.substring(0, atIndex);
      const domainPart = match.substring(atIndex);
      return partialHideWithConfig(localPart, { keepStart: 2, keepEnd: 1, minAsterisks: 3 }) + domainPart;
    }
    return match;
  });
  
  // JWT Token：eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*
  sanitized = sanitized.replace(/\beyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g, () => {
    return 'ey***';
  });
  
  // 微信OpenID：o[a-zA-Z0-9_-]{26,}
  sanitized = sanitized.replace(/\bo[a-zA-Z0-9_-]{26,}\b/g, (match) => {
    return simpleHash(match);
  });
  
  // 支付订单号：20-32位数字（使用word boundary）
  sanitized = sanitized.replace(/\b\d{20,32}\b/g, (match) => {
    if (match.length >= 20 && match.length <= 32) {
      return partialHideWithConfig(match, { keepStart: 4, keepEnd: 4, minAsterisks: 4 });
    }
    return match;
  });
  
  // IP地址：\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b
  sanitized = sanitized.replace(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g, (match) => {
    const parts = match.split('.');
    if (parts.length === 4) {
      const firstPartHidden = parts[0].substring(0, 3);
      return `${firstPartHidden}***`;
    }
    return match;
  });
  
  // URL中的敏感参数：[?&](token|key|secret|password|auth)=[^&\s]*
  sanitized = sanitized.replace(/[?&](token|key|secret|password|auth)=[^&\s]*/gi, (match) => {
    return match.split('=')[0] + '=***';
  });
  
  return sanitized;
}

/**
 * 主要的脱敏函数 - 用于日志记录
 */
function sanitizeForLog(data) {
  try {
    // 处理字符串
    if (typeof data === 'string') {
      return sanitizeString(data);
    }
    
    // 处理对象和数组
    if (typeof data === 'object' && data !== null) {
      // 检查对象是否有危险的toString方法
      if (data.toString && typeof data.toString === 'function') {
        try {
          data.toString();
        } catch (error) {
          return '[SANITIZATION_ERROR]';
        }
      }
      return sanitizeObject(data);
    }
    
    // 处理其他类型
    return data;
  } catch (error) {
    // 脱敏过程中出错，返回安全的占位符
    return '[SANITIZATION_ERROR]';
  }
}

/**
 * 脱敏HTTP请求数据
 */
function sanitizeRequest(req) {
  return {
    method: req.method,
    url: sanitizeString(req.url),
    headers: {
      'user-agent': req.headers?.['user-agent'],
      'content-type': req.headers?.['content-type'],
      'accept': req.headers?.['accept'],
      'origin': req.headers?.['origin'],
      'referer': sanitizeString(req.headers?.['referer']),
      // 不记录敏感头部
      authorization: req.headers?.['authorization'] ? '[HIDDEN]' : undefined,
      cookie: req.headers?.['cookie'] ? '[HIDDEN]' : undefined
    },
    body: sanitizeObject(req.body),
    query: sanitizeObject(req.query),
    params: sanitizeObject(req.params),
    ip: partialHideWithConfig(req.ip || '192.168.1.100', { keepStart: 3, keepEnd: 0, minAsterisks: 3 }),
    client: req.client
  };
}

/**
 * 脱敏HTTP响应数据
 */
function sanitizeResponse(res, data) {
  const headers = res.headers || {};
  const getHeader = res.getHeader || ((name) => headers[name]);
  const sanitizedHeaders = {};
  
  const contentType = getHeader('content-type');
  if (contentType) {
    sanitizedHeaders['content-type'] = contentType;
  }
  const contentLength = getHeader('content-length');
  if (contentLength) {
    sanitizedHeaders['content-length'] = contentLength;
  }
  const etag = getHeader('etag');
  if (etag) {
    sanitizedHeaders['etag'] = etag;
  }
  
  return {
    statusCode: res.statusCode,
    headers: sanitizedHeaders,
    data: sanitizeObject(data || res.data)
  };
}

/**
 * 创建脱敏中间件
 */
function createSanitizationMiddleware() {
  return (req, res, next) => {
    // 保存脱敏后的请求数据
    req.sanitizedLog = sanitizeRequest(req);
    
    // 保存脱敏后的响应数据
    res.sanitizedResponse = null;
    
    // 保存原始的 json 和 send 方法
    const originalJson = res.json;
    const originalSend = res.send;
    
    // 重写 json 方法
    res.json = function(data) {
      res.sanitizedResponse = sanitizeResponse({
        statusCode: res.statusCode,
        headers: res.getHeaders ? res.getHeaders() : {},
        data: data
      });
      return originalJson.call(res, data);
    };
    
    // 重写 send 方法
    res.send = function(data) {
      let parsedData = data;
      try {
        parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      } catch (e) {
        // 如果不是JSON，直接处理
      }
      res.sanitizedResponse = sanitizeResponse({
        statusCode: res.statusCode,
        headers: res.getHeaders ? res.getHeaders() : {},
        data: parsedData
      });
      return originalSend.call(res, data);
    };
    
    next();
  };
}

module.exports = {
  sanitizeForLog,
  sanitizeObject,
  sanitizeString,
  sanitizeRequest,
  sanitizeResponse,
  createSanitizationMiddleware,
  SENSITIVE_FIELDS
};
