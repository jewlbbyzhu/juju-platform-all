class ResponseHelper {
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static created(res, data, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  static error(res, message, code = 'INTERNAL_SERVER_ERROR', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      code,
      errors
    });
  }

  static validationError(res, errors, message = 'Validation failed') {
    return this.error(res, message, 'VALIDATION_ERROR', 400, errors);
  }

  static unauthorized(res, message = 'Unauthorized', code = 'UNAUTHORIZED') {
    return this.error(res, message, code, 401);
  }

  static forbidden(res, message = 'Forbidden', code = 'FORBIDDEN') {
    return this.error(res, message, code, 403);
  }

  static notFound(res, message = 'Resource not found', code = 'NOT_FOUND') {
    return this.error(res, message, code, 404);
  }

  static conflict(res, message = 'Resource conflict', code = 'CONFLICT') {
    return this.error(res, message, code, 409);
  }

  static tooManyRequests(res, message = 'Too many requests', code = 'TOO_MANY_REQUESTS') {
    return this.error(res, message, code, 429);
  }

  static paginated(res, data, total, page, pageSize, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data: {
        total,
        page,
        pageSize,
        data
      }
    });
  }
}

module.exports = ResponseHelper;
