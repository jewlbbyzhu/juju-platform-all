const ResponseHelper = require('./responseHelper');

/**
 * 响应工具函数
 * 为了兼容旧代码，提供直接的 success 和 error 函数
 */

function success(res, data, message = 'Success', statusCode = 200) {
  return ResponseHelper.success(res, data, message, statusCode);
}

function error(res, message, code = 'INTERNAL_SERVER_ERROR', statusCode = 500, errors = null) {
  return ResponseHelper.error(res, message, code, statusCode, errors);
}

module.exports = {
  success,
  error
};
