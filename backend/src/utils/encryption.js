/**
 * 敏感数据加密工具
 * 提供强化的加密机制保护敏感信息
 */

const crypto = require('crypto');
const bcrypt = require('bcrypt');

// 加密配置
const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  tagLength: 16,
  saltRounds: 12,
  keyDerivationIterations: 100000
};

/**
 * 生成加密密钥
 */
function generateEncryptionKey() {
  return crypto.randomBytes(ENCRYPTION_CONFIG.keyLength);
}

/**
 * 从密码派生密钥
 */
function deriveKeyFromPassword(password, salt) {
  return crypto.pbkdf2Sync(
    password,
    salt,
    ENCRYPTION_CONFIG.keyDerivationIterations,
    ENCRYPTION_CONFIG.keyLength,
    'sha256'
  );
}

/**
 * 生成随机盐值
 */
function generateSalt() {
  return crypto.randomBytes(16);
}

/**
 * AES-256-GCM 加密
 */
function encryptAES(plaintext, key) {
  try {
    const iv = crypto.randomBytes(ENCRYPTION_CONFIG.ivLength);
    const cipher = crypto.createCipher(ENCRYPTION_CONFIG.algorithm, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // 返回 iv + tag + encrypted 的组合
    return {
      encrypted: iv.toString('hex') + tag.toString('hex') + encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * AES-256-GCM 解密
 */
function decryptAES(encryptedData, key) {
  try {
    const ivLength = ENCRYPTION_CONFIG.ivLength * 2; // hex length
    const tagLength = ENCRYPTION_CONFIG.tagLength * 2; // hex length
    
    const iv = Buffer.from(encryptedData.slice(0, ivLength), 'hex');
    const tag = Buffer.from(encryptedData.slice(ivLength, ivLength + tagLength), 'hex');
    const encrypted = encryptedData.slice(ivLength + tagLength);
    
    const decipher = crypto.createDecipher(ENCRYPTION_CONFIG.algorithm, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * 密码哈希（使用bcrypt）
 */
async function hashPassword(password) {
  try {
    return await bcrypt.hash(password, ENCRYPTION_CONFIG.saltRounds);
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
}

/**
 * 验证密码
 */
async function verifyPassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error(`Password verification failed: ${error.message}`);
  }
}

/**
 * 敏感数据加密类
 */
class SensitiveDataEncryption {
  constructor(masterKey) {
    this.masterKey = masterKey || process.env.ENCRYPTION_MASTER_KEY;
    if (!this.masterKey) {
      throw new Error('Master encryption key is required');
    }
  }

  /**
   * 加密敏感字符串
   * 盐值与密文一起存储，确保可解密
   */
  encryptString(plaintext) {
    if (!plaintext || typeof plaintext !== 'string') {
      return plaintext;
    }

    try {
      const salt = generateSalt();
      const key = deriveKeyFromPassword(this.masterKey, salt);
      const result = encryptAES(plaintext, key);
      
      // 将盐值、IV、tag、密文全部编码存储，格式: salt:iv:tag:ciphertext
      const combined = [
        salt.toString('hex'),
        result.iv,
        result.tag,
        result.encrypted.slice((ENCRYPTION_CONFIG.ivLength + ENCRYPTION_CONFIG.tagLength) * 2)
      ].join(':');
      
      return {
        encrypted: combined,
        algorithm: ENCRYPTION_CONFIG.algorithm,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(`String encryption failed: ${error.message}`);
    }
  }

  /**
   * 解密敏感字符串
   * 从存储格式中提取盐值、IV、tag，重新派生密钥解密
   */
  decryptString(encryptedData) {
    if (!encryptedData || typeof encryptedData !== 'object') {
      return encryptedData;
    }

    try {
      const parts = encryptedData.encrypted.split(':');
      if (parts.length !== 4) {
        throw new Error('Invalid encrypted data format: expected salt:iv:tag:ciphertext');
      }
      const salt = Buffer.from(parts[0], 'hex');
      const iv = parts[1]; // hex string
      const tag = parts[2]; // hex string
      const encrypted = parts[3]; // hex string
      
      // 重新组合 iv + tag + ciphertext 供 decryptAES 使用
      const combinedEncrypted = iv + tag + encrypted;
      
      const key = deriveKeyFromPassword(this.masterKey, salt);
      return decryptAES(combinedEncrypted, key);
    } catch (error) {
      throw new Error(`String decryption failed: ${error.message}`);
    }
  }

  /**
   * 加密对象中的敏感字段
   */
  encryptSensitiveFields(obj, sensitiveFields = []) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const encrypted = { ...obj };
    
    sensitiveFields.forEach(field => {
      if (encrypted[field]) {
        encrypted[field] = this.encryptString(encrypted[field]);
      }
    });

    return encrypted;
  }

  /**
   * 解密对象中的敏感字段
   */
  decryptSensitiveFields(obj, sensitiveFields = []) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const decrypted = { ...obj };
    
    sensitiveFields.forEach(field => {
      if (decrypted[field] && typeof decrypted[field] === 'object') {
        try {
          decrypted[field] = this.decryptString(decrypted[field]);
        } catch (error) {
          // 解密失败，保持原值
          console.warn(`Failed to decrypt field ${field}:`, error.message);
        }
      }
    });

    return decrypted;
  }
}

/**
 * 数据库字段加密工具
 */
class DatabaseFieldEncryption {
  constructor() {
    this.encryption = new SensitiveDataEncryption();
  }

  /**
   * 加密用户敏感信息
   */
  encryptUserData(userData) {
    const sensitiveFields = ['phone', 'idCard', 'realName', 'address'];
    return this.encryption.encryptSensitiveFields(userData, sensitiveFields);
  }

  /**
   * 解密用户敏感信息
   */
  decryptUserData(userData) {
    const sensitiveFields = ['phone', 'idCard', 'realName', 'address'];
    return this.encryption.decryptSensitiveFields(userData, sensitiveFields);
  }

  /**
   * 加密银行卡信息
   */
  encryptBankCardData(bankCardData) {
    const sensitiveFields = ['cardNumber', 'holderName', 'bankName'];
    return this.encryption.encryptSensitiveFields(bankCardData, sensitiveFields);
  }

  /**
   * 解密银行卡信息
   */
  decryptBankCardData(bankCardData) {
    const sensitiveFields = ['cardNumber', 'holderName', 'bankName'];
    return this.encryption.decryptSensitiveFields(bankCardData, sensitiveFields);
  }

  /**
   * 加密支付信息
   */
  encryptPaymentData(paymentData) {
    const sensitiveFields = ['outTradeNo', 'transactionId', 'prepayId'];
    return this.encryption.encryptSensitiveFields(paymentData, sensitiveFields);
  }

  /**
   * 解密支付信息
   */
  decryptPaymentData(paymentData) {
    const sensitiveFields = ['outTradeNo', 'transactionId', 'prepayId'];
    return this.encryption.decryptSensitiveFields(paymentData, sensitiveFields);
  }
}

/**
 * JWT Token 增强安全
 */
class SecureTokenManager {
  constructor() {
    this.encryption = new SensitiveDataEncryption();
  }

  /**
   * 生成安全的JWT载荷
   */
  createSecurePayload(userData) {
    const payload = {
      id: userData.id,
      role: userData.role,
      clientType: userData.clientType,
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomUUID(), // JWT ID for tracking
      fingerprint: this.generateFingerprint(userData)
    };

    // 加密敏感信息
    if (userData.phone) {
      payload.phone = this.encryption.encryptString(userData.phone);
    }

    return payload;
  }

  /**
   * 验证JWT载荷
   */
  verifySecurePayload(payload, expectedFingerprint) {
    // 验证指纹
    if (payload.fingerprint !== expectedFingerprint) {
      throw new Error('Token fingerprint mismatch');
    }

    // 验证时间戳
    const now = Math.floor(Date.now() / 1000);
    if (payload.iat > now) {
      throw new Error('Token issued in the future');
    }

    return true;
  }

  /**
   * 生成用户指纹
   */
  generateFingerprint(userData) {
    const data = `${userData.id}:${userData.role}:${userData.clientType}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }
}

/**
 * 文件加密工具
 */
class FileEncryption {
  constructor() {
    this.encryption = new SensitiveDataEncryption();
  }

  /**
   * 加密文件内容
   */
  encryptFile(fileBuffer, metadata = {}) {
    try {
      const key = generateEncryptionKey();
      const encrypted = encryptAES(fileBuffer.toString('base64'), key);
      
      return {
        encryptedContent: encrypted.encrypted,
        encryptionKey: key.toString('hex'),
        metadata: {
          ...metadata,
          originalSize: fileBuffer.length,
          encryptedAt: new Date().toISOString(),
          algorithm: ENCRYPTION_CONFIG.algorithm
        }
      };
    } catch (error) {
      throw new Error(`File encryption failed: ${error.message}`);
    }
  }

  /**
   * 解密文件内容
   */
  decryptFile(encryptedContent, encryptionKey) {
    try {
      const key = Buffer.from(encryptionKey, 'hex');
      const decrypted = decryptAES(encryptedContent, key);
      return Buffer.from(decrypted, 'base64');
    } catch (error) {
      throw new Error(`File decryption failed: ${error.message}`);
    }
  }
}

/**
 * 创建加密中间件
 */
function createEncryptionMiddleware(options = {}) {
  const dbEncryption = new DatabaseFieldEncryption();
  
  return (req, res, next) => {
    // 为请求添加加密工具
    req.encryption = {
      user: dbEncryption,
      bankCard: dbEncryption,
      payment: dbEncryption,
      file: new FileEncryption(),
      token: new SecureTokenManager()
    };

    // 拦截响应进行加密处理
    const originalJson = res.json;
    res.json = function(data) {
      // 根据需要对响应数据进行加密处理
      if (options.encryptResponses && data.data) {
        // 这里可以添加响应数据加密逻辑
      }
      
      return originalJson.call(this, data);
    };

    next();
  };
}

/**
 * 简单加密函数（用于银行卡号等）
 */
function encrypt(plaintext) {
  if (!plaintext || typeof plaintext !== 'string') {
    return plaintext;
  }
  
  try {
    // 使用更简单的XOR加密+base64编码，确保输出长度可控
    const key = process.env.ENCRYPTION_MASTER_KEY;
    if (!key) {
      throw new Error('ENCRYPTION_MASTER_KEY environment variable is required');
    }
    let encrypted = '';
    
    for (let i = 0; i < plaintext.length; i++) {
      encrypted += String.fromCharCode(plaintext.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    
    // 使用base64编码，比hex更紧凑
    return Buffer.from(encrypted, 'binary').toString('base64');
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * 简单解密函数
 */
function decrypt(encryptedData) {
  if (!encryptedData || typeof encryptedData !== 'string') {
    return encryptedData;
  }
  
  try {
    if (!process.env.ENCRYPTION_MASTER_KEY) {
      throw new Error('ENCRYPTION_MASTER_KEY environment variable is required');
    }
    const key = deriveKeyFromPassword(process.env.ENCRYPTION_MASTER_KEY, generateSalt());
    return decryptAES(encryptedData, key);
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * 银行卡号掩码
 */
function maskCardNumber(cardNumber) {
  if (!cardNumber || typeof cardNumber !== 'string') {
    return cardNumber;
  }
  
  if (cardNumber.length < 8) {
    return cardNumber;
  }
  
  return cardNumber.substring(0, 4) + ' **** **** ' + cardNumber.substring(cardNumber.length - 4);
}

module.exports = {
  generateEncryptionKey,
  deriveKeyFromPassword,
  generateSalt,
  encryptAES,
  decryptAES,
  hashPassword,
  verifyPassword,
  encrypt,
  decrypt,
  maskCardNumber,
  SensitiveDataEncryption,
  DatabaseFieldEncryption,
  SecureTokenManager,
  FileEncryption,
  createEncryptionMiddleware,
  ENCRYPTION_CONFIG
};