const Joi = require('joi');
const logger = require('../utils/logger');
const { sanitizeForLog } = require('../utils/logSanitizer');
const { auditLog } = require('../utils/auditLogger');

/**
 * 安全验证中间件 - 增强版输入验证
 * 包含XSS防护、SQL注入防护、文件上传安全等
 */

// 安全验证规则
const securityRules = {
  // 防止XSS攻击的字符串验证
  safeString: Joi.string().pattern(/^[^<>'"&]*$/, 'no-html-chars'),
  
  // 防止SQL注入的字符串验证
  sqlSafeString: Joi.string().pattern(/^[^';/*-]*$/, 'no-sql-injection'),
  
  // 安全的用户名验证
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9_-]+$/, 'safe-username'),
  
  // 安全的密码验证
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'strong-password'),
  
  // 手机号验证
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/, 'chinese-mobile'),
  
  // 身份证号验证
  idCard: Joi.string().pattern(/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, 'chinese-id-card'),
  
  // 银行卡号验证
  bankCard: Joi.string().pattern(/^\d{16,19}$/, 'bank-card'),
  
  // 金额验证（分为单位）
  amount: Joi.number().integer().min(1).max(999999999),
  
  // 文件类型验证
  fileType: Joi.string().valid('jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'),
  
  // URL验证
  url: Joi.string().uri({ scheme: ['http', 'https'] }),
  
  // 经纬度验证
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
  
  // 时间戳验证
  timestamp: Joi.number().integer().min(0),
  
  // 分页参数验证
  page: Joi.number().integer().min(1).max(1000).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
  
  // 排序参数验证
  sortBy: Joi.string().valid('id', 'createdAt', 'updatedAt', 'name', 'title', 'price', 'distance'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  
  // 状态验证
  status: Joi.string().valid('active', 'inactive', 'pending', 'approved', 'rejected', 'cancelled'),
  
  // 客户端类型验证
  clientType: Joi.string().valid('miniprogram', 'app', 'web', 'website'),
  
  // 设备信息验证
  deviceId: Joi.string().alphanum().min(10).max(50),
  platform: Joi.string().valid('ios', 'android', 'web', 'miniprogram'),
  version: Joi.string().pattern(/^\d+\.\d+\.\d+$/, 'semantic-version')
};

/**
 * 创建安全验证中间件
 * @param {Object} schema - Joi验证模式
 * @param {string} target - 验证目标 ('body', 'query', 'params', 'headers')
 * @param {Object} options - 验证选项
 */
function createSecurityValidator(schema, target = 'body', options = {}) {
  const defaultOptions = {
    abortEarly: false, // 返回所有验证错误
    stripUnknown: true, // 移除未知字段
    allowUnknown: false, // 不允许未知字段
    convert: true, // 自动类型转换
    ...options
  };

  return async (req, res, next) => {
    try {
      if (!schema) {
        throw new Error('Validation schema is required');
      }

      const validator = Joi.isSchema(schema) ? schema : Joi.object(schema);
      const data = req[target];
      const { error, value } = validator.validate(data, defaultOptions);
      
      if (error) {
        // 记录验证失败的审计日志
        await auditLog({
          action: 'VALIDATION_FAILED',
          resource: req.path,
          method: req.method,
          clientType: req.client?.type,
          userId: req.user?.id,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          details: {
            target,
            errors: error.details.map(d => ({
              field: d.path.join('.'),
              message: d.message,
              value: sanitizeForLog(d.context?.value)
            }))
          },
          severity: 'medium',
          timestamp: new Date()
        });

        logger.warn('Security validation failed:', {
          url: req.url,
          method: req.method,
          target,
          client: req.client,
          errors: error.details.map(d => ({
            field: d.path.join('.'),
            message: d.message
          })),
          sanitizedData: sanitizeForLog(data)
        });
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map(d => ({
            field: d.path.join('.'),
            message: d.message.replace(/"/g, '\'') // 防止XSS
          }))
        });
      }
      
      // 验证成功，保存验证后的数据
      req[`validated${target.charAt(0).toUpperCase() + target.slice(1)}`] = value;
      
      // 记录成功的验证审计日志（仅在开发环境）
      if (process.env.NODE_ENV === 'development') {
        await auditLog({
          action: 'VALIDATION_SUCCESS',
          resource: req.path,
          method: req.method,
          clientType: req.client?.type,
          userId: req.user?.id,
          ip: req.ip,
          details: { target, fieldCount: Object.keys(value).length },
          severity: 'low',
          timestamp: new Date()
        });
      }
      
      next();
    } catch (validationError) {
      logger.error('Security validation error:', {
        error: validationError.message,
        stack: validationError.stack,
        url: req.url,
        method: req.method,
        target
      });
      
      // 记录系统错误审计日志
      await auditLog({
        action: 'VALIDATION_ERROR',
        resource: req.path,
        method: req.method,
        clientType: req.client?.type,
        userId: req.user?.id,
        ip: req.ip,
        details: { error: validationError.message, target },
        severity: 'high',
        timestamp: new Date()
      });
      
      return res.status(500).json({
        success: false,
        message: 'Validation system error'
      });
    }
  };
}

/**
 * 文件上传安全验证
 */
function validateFileUpload(options = {}) {
  const defaultOptions = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    maxFiles: 5,
    ...options
  };

  return async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return next();
      }

      const files = Array.isArray(req.files) ? req.files : [req.files];
      
      // 验证文件数量
      if (files.length > defaultOptions.maxFiles) {
        await auditLog({
          action: 'FILE_UPLOAD_REJECTED',
          resource: req.path,
          method: req.method,
          clientType: req.client?.type,
          userId: req.user?.id,
          ip: req.ip,
          details: { 
            reason: 'too_many_files',
            fileCount: files.length,
            maxAllowed: defaultOptions.maxFiles
          },
          severity: 'medium',
          timestamp: new Date()
        });

        return res.status(400).json({
          success: false,
          message: `Too many files. Maximum ${defaultOptions.maxFiles} files allowed.`
        });
      }

      // 验证每个文件
      for (const file of files) {
        // 验证文件大小
        if (file.size > defaultOptions.maxSize) {
          await auditLog({
            action: 'FILE_UPLOAD_REJECTED',
            resource: req.path,
            method: req.method,
            clientType: req.client?.type,
            userId: req.user?.id,
            ip: req.ip,
            details: { 
              reason: 'file_too_large',
              fileName: sanitizeForLog(file.originalname),
              fileSize: file.size,
              maxSize: defaultOptions.maxSize
            },
            severity: 'medium',
            timestamp: new Date()
          });

          return res.status(400).json({
            success: false,
            message: `File ${file.originalname} is too large. Maximum size is ${Math.round(defaultOptions.maxSize / 1024 / 1024)}MB.`
          });
        }

        // 验证文件类型
        if (!defaultOptions.allowedTypes.includes(file.mimetype)) {
          await auditLog({
            action: 'FILE_UPLOAD_REJECTED',
            resource: req.path,
            method: req.method,
            clientType: req.client?.type,
            userId: req.user?.id,
            ip: req.ip,
            details: { 
              reason: 'invalid_file_type',
              fileName: sanitizeForLog(file.originalname),
              fileType: file.mimetype,
              allowedTypes: defaultOptions.allowedTypes
            },
            severity: 'high',
            timestamp: new Date()
          });

          return res.status(400).json({
            success: false,
            message: `File type ${file.mimetype} is not allowed.`
          });
        }

        // 验证文件名安全性
        // eslint-disable-next-line no-control-regex
        const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
        if (dangerousChars.test(file.originalname)) {
          await auditLog({
            action: 'FILE_UPLOAD_REJECTED',
            resource: req.path,
            method: req.method,
            clientType: req.client?.type,
            userId: req.user?.id,
            ip: req.ip,
            details: { 
              reason: 'dangerous_filename',
              fileName: sanitizeForLog(file.originalname)
            },
            severity: 'high',
            timestamp: new Date()
          });

          return res.status(400).json({
            success: false,
            message: 'File name contains dangerous characters.'
          });
        }
      }

      // 记录成功的文件上传审计日志
      await auditLog({
        action: 'FILE_UPLOAD_VALIDATED',
        resource: req.path,
        method: req.method,
        clientType: req.client?.type,
        userId: req.user?.id,
        ip: req.ip,
        details: { 
          fileCount: files.length,
          totalSize: files.reduce((sum, file) => sum + file.size, 0),
          fileTypes: [...new Set(files.map(f => f.mimetype))]
        },
        severity: 'low',
        timestamp: new Date()
      });

      next();
    } catch (error) {
      logger.error('File upload validation error:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method
      });

      await auditLog({
        action: 'FILE_UPLOAD_ERROR',
        resource: req.path,
        method: req.method,
        clientType: req.client?.type,
        userId: req.user?.id,
        ip: req.ip,
        details: { error: error.message },
        severity: 'high',
        timestamp: new Date()
      });

      return res.status(500).json({
        success: false,
        message: 'File validation system error'
      });
    }
  };
}

/**
 * 速率限制验证
 */
function createRateLimitValidator(options = {}) {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 最大请求数
    keyGenerator: (req) => req.ip,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    ...options
  };

  const requests = new Map();

  return async (req, res, next) => {
    try {
      const key = defaultOptions.keyGenerator(req);
      const now = Date.now();
      const windowStart = now - defaultOptions.windowMs;

      // 清理过期记录
      if (requests.has(key)) {
        const userRequests = requests.get(key).filter(time => time > windowStart);
        requests.set(key, userRequests);
      } else {
        requests.set(key, []);
      }

      const userRequests = requests.get(key);
      
      // 检查是否超过限制
      if (userRequests.length >= defaultOptions.max) {
        await auditLog({
          action: 'RATE_LIMIT_EXCEEDED',
          resource: req.path,
          method: req.method,
          clientType: req.client?.type,
          userId: req.user?.id,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          details: { 
            requestCount: userRequests.length,
            limit: defaultOptions.max,
            windowMs: defaultOptions.windowMs
          },
          severity: 'high',
          timestamp: new Date()
        });

        return res.status(429).json({
          success: false,
          message: 'Too many requests, please try again later.',
          retryAfter: Math.ceil(defaultOptions.windowMs / 1000)
        });
      }

      // 记录当前请求
      userRequests.push(now);
      requests.set(key, userRequests);

      next();
    } catch (error) {
      logger.error('Rate limit validation error:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method
      });

      next(); // 发生错误时不阻止请求
    }
  };
}

module.exports = {
  securityRules,
  createSecurityValidator,
  validateFileUpload,
  createRateLimitValidator
};
