// const Joi = require('joi'); // 由调用者传入已创建的 schema
const logger = require('../utils/logger');

function validateParams(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      logger.warn('Validation failed:', {
        url: req.url,
        method: req.method,
        errors: error.details.map(d => d.message)
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      });
    }
    
    req.validatedBody = value;
    next();
  };
}

function validateQueryParams(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      logger.warn('Query validation failed:', {
        url: req.url,
        method: req.method,
        errors: error.details.map(d => d.message)
      });
      
      return res.status(400).json({
        success: false,
        message: 'Query validation failed',
        errors: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      });
    }
    
    req.validatedQuery = value;
    next();
  };
}

function validatePathParams(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params);
    
    if (error) {
      logger.warn('Path params validation failed:', {
        url: req.url,
        method: req.method,
        errors: error.details.map(d => d.message)
      });
      
      return res.status(400).json({
        success: false,
        message: 'Path params validation failed',
        errors: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      });
    }
    
    req.validatedParams = value;
    next();
  };
}

module.exports = {
  validateParams,
  validateQueryParams,
  validatePathParams
};
