/**
 * API审计日志系统
 * 记录所有安全相关的操作和事件
 */
/* eslint-disable no-unused-vars */

const winston = require('winston');
const path = require('path');
const { sanitizeForLog } = require('./logSanitizer');

// 审计日志级别
const AUDIT_LEVELS = {
  LOW: 'low',       // 一般操作
  MEDIUM: 'medium', // 重要操作
  HIGH: 'high',     // 敏感操作
  CRITICAL: 'critical' // 关键安全事件
};

// 审计事件类型
const AUDIT_ACTIONS = {
  // 认证相关
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  TOKEN_REFRESH: 'TOKEN_REFRESH',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // 授权相关
  ACCESS_GRANTED: 'ACCESS_GRANTED',
  ACCESS_DENIED: 'ACCESS_DENIED',
  PERMISSION_CHECK: 'PERMISSION_CHECK',
  
  // 数据操作
  DATA_CREATE: 'DATA_CREATE',
  DATA_READ: 'DATA_READ',
  DATA_UPDATE: 'DATA_UPDATE',
  DATA_DELETE: 'DATA_DELETE',
  DATA_EXPORT: 'DATA_EXPORT',
  
  // 安全事件
  SECURITY_VIOLATION: 'SECURITY_VIOLATION',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  
  // 文件操作
  FILE_UPLOAD: 'FILE_UPLOAD',
  FILE_DOWNLOAD: 'FILE_DOWNLOAD',
  FILE_DELETE: 'FILE_DELETE',
  
  // 支付相关
  PAYMENT_INITIATED: 'PAYMENT_INITIATED',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  REFUND_INITIATED: 'REFUND_INITIATED',
  
  // 系统事件
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  CONFIG_CHANGE: 'CONFIG_CHANGE',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE'
};

// 创建审计日志记录器
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...meta
      });
    })
  ),
  transports: [
    // 审计日志文件
    new winston.transports.File({
      filename: path.join(process.env.LOG_FILE_PATH || './logs', 'audit.log'),
      maxsize: 50 * 1024 * 1024, // 50MB
      maxFiles: 10,
      tailable: true
    }),
    
    // 安全事件单独记录
    new winston.transports.File({
      filename: path.join(process.env.LOG_FILE_PATH || './logs', 'security.log'),
      level: 'warn',
      maxsize: 50 * 1024 * 1024, // 50MB
      maxFiles: 10,
      tailable: true
    })
  ]
});

// 开发环境添加控制台输出
if (process.env.NODE_ENV === 'development') {
  auditLogger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, action, resource, userId, ip }) => {
        return `${timestamp} [AUDIT] ${level}: ${action} - ${resource} (User: ${userId || 'anonymous'}, IP: ${ip})`;
      })
    )
  }));
}

/**
 * 记录审计日志
 * @param {Object} auditData - 审计数据
 */
async function auditLog(auditData) {
  try {
    const {
      action,
      resource,
      method,
      clientType,
      userId,
      ip,
      userAgent,
      details = {},
      severity = AUDIT_LEVELS.LOW,
      timestamp = new Date(),
      sessionId,
      requestId,
      ...additionalData
    } = auditData;

    // 验证必需字段
    if (!action || !resource) {
      throw new Error('Audit log requires action and resource fields');
    }

    // 构建审计记录
    const auditRecord = {
      // 基本信息
      action,
      resource: sanitizeForLog(resource),
      method,
      clientType,
      
      // 用户信息
      userId: userId || 'anonymous',
      ip: sanitizeForLog(ip),
      userAgent: sanitizeForLog(userAgent),
      sessionId,
      requestId,
      
      // 事件详情
      details: sanitizeForLog(details),
      severity,
      timestamp: timestamp.toISOString(),
      
      // 额外数据
      ...sanitizeForLog(additionalData)
    };

    // 根据严重程度选择日志级别
    let logLevel = 'info';
    switch (severity) {
    case AUDIT_LEVELS.CRITICAL:
      logLevel = 'error';
      break;
    case AUDIT_LEVELS.HIGH:
      logLevel = 'warn';
      break;
    case AUDIT_LEVELS.MEDIUM:
      logLevel = 'info';
      break;
    case AUDIT_LEVELS.LOW:
    default:
      logLevel = 'debug';
      break;
    }

    // 记录审计日志
    auditLogger.log(logLevel, `Audit: ${action}`, auditRecord);

    // 高危事件额外处理
    if (severity === AUDIT_LEVELS.CRITICAL || severity === AUDIT_LEVELS.HIGH) {
      await handleHighRiskEvent(auditRecord);
    }

    return true;
  } catch (error) {
    // 审计日志记录失败，记录到系统日志
    console.error('Failed to write audit log:', error);
    return false;
  }
}

/**
 * 处理高风险事件
 */
async function handleHighRiskEvent(auditRecord) {
  try {
    // 这里可以添加高风险事件的特殊处理逻辑
    // 例如：发送告警、通知管理员、触发安全响应等
    
    console.warn('HIGH RISK SECURITY EVENT:', {
      action: auditRecord.action,
      resource: auditRecord.resource,
      userId: auditRecord.userId,
      ip: auditRecord.ip,
      timestamp: auditRecord.timestamp
    });

    // TODO: 集成告警系统
    // await sendSecurityAlert(auditRecord);
    
    // TODO: 自动安全响应
    // await triggerSecurityResponse(auditRecord);
    
  } catch (error) {
    console.error('Failed to handle high risk event:', error);
  }
}

/**
 * 创建审计中间件
 */
function createAuditMiddleware(options = {}) {
  const config = {
    logAllRequests: false,
    logSensitiveOperations: true,
    excludePaths: ['/health', '/api-docs'],
    ...options
  };

  return async (req, res, next) => {
    const startTime = Date.now();
    
    // 跳过排除的路径
    if (config.excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // 生成请求ID
    req.requestId = req.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 记录请求开始
    if (config.logAllRequests) {
      await auditLog({
        action: 'REQUEST_START',
        resource: req.path,
        method: req.method,
        clientType: req.client?.type,
        userId: req.user?.id,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        requestId: req.requestId,
        details: {
          query: req.query,
          params: req.params,
          bodySize: req.headers['content-length'] || 0
        },
        severity: AUDIT_LEVELS.LOW
      });
    }

    // 拦截响应
    const originalSend = res.send;
    res.send = function(data) {
      const duration = Date.now() - startTime;
      
      // 记录响应
      if (config.logAllRequests || res.statusCode >= 400) {
        const severity = res.statusCode >= 500 ? AUDIT_LEVELS.HIGH : 
          res.statusCode >= 400 ? AUDIT_LEVELS.MEDIUM : 
            AUDIT_LEVELS.LOW;

        auditLog({
          action: 'REQUEST_COMPLETE',
          resource: req.path,
          method: req.method,
          clientType: req.client?.type,
          userId: req.user?.id,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          requestId: req.requestId,
          details: {
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            responseSize: typeof data === 'string' ? data.length : 0
          },
          severity
        });
      }

      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * 记录认证事件
 */
async function logAuthEvent(action, req, additionalData = {}) {
  const severity = action.includes('FAILED') || action.includes('DENIED') ? 
    AUDIT_LEVELS.HIGH : AUDIT_LEVELS.MEDIUM;

  return await auditLog({
    action,
    resource: req.path,
    method: req.method,
    clientType: req.client?.type,
    userId: req.user?.id || additionalData.userId,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    details: additionalData,
    severity
  });
}

/**
 * 记录数据操作事件
 */
async function logDataEvent(action, resource, req, additionalData = {}) {
  const severity = action === 'DATA_DELETE' || action === 'DATA_EXPORT' ? 
    AUDIT_LEVELS.HIGH : AUDIT_LEVELS.MEDIUM;

  return await auditLog({
    action,
    resource,
    method: req.method,
    clientType: req.client?.type,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    details: additionalData,
    severity
  });
}

/**
 * 记录安全事件
 */
async function logSecurityEvent(action, req, additionalData = {}) {
  return await auditLog({
    action,
    resource: req.path,
    method: req.method,
    clientType: req.client?.type,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    details: additionalData,
    severity: AUDIT_LEVELS.HIGH
  });
}

/**
 * 记录支付事件
 */
async function logPaymentEvent(action, req, additionalData = {}) {
  return await auditLog({
    action,
    resource: req.path,
    method: req.method,
    clientType: req.client?.type,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    details: additionalData,
    severity: AUDIT_LEVELS.HIGH
  });
}

/**
 * 查询审计日志
 */
async function queryAuditLogs(filters = {}) {
  // TODO: 实现审计日志查询功能
  // 可以集成到管理后台，提供审计日志查询界面
  throw new Error('Audit log query not implemented yet');
}

module.exports = {
  auditLog,
  logAuthEvent,
  logDataEvent,
  logSecurityEvent,
  logPaymentEvent,
  queryAuditLogs,
  createAuditMiddleware,
  AUDIT_LEVELS,
  AUDIT_ACTIONS
};