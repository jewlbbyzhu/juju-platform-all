const Joi = require('joi');

const registerSchema = Joi.object({
  openid: Joi.string().max(100),
  unionid: Joi.string().max(100),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/),
  email: Joi.string().email(),
  nickname: Joi.string().min(1).max(50).required(),
  avatar: Joi.string().uri().max(500),
  gender: Joi.number().valid(0, 1, 2).default(0),
  birthday: Joi.date(),
  province: Joi.string().max(50),
  city: Joi.string().max(50),
  country: Joi.string().max(50),
  language: Joi.string().max(20).default('zh_CN')
}).or('openid', 'unionid', 'phone', 'email');

const loginSchema = Joi.object({
  code: Joi.string().max(100),
  openid: Joi.string().max(100),
  unionid: Joi.string().max(100)
}).or('code', 'openid', 'unionid');

const updateProfileSchema = Joi.object({
  nickname: Joi.string().min(1).max(50),
  avatar: Joi.string().uri().max(500),
  gender: Joi.number().valid(0, 1, 2),
  birthday: Joi.date(),
  province: Joi.string().max(50),
  city: Joi.string().max(50),
  country: Joi.string().max(50),
  language: Joi.string().max(20)
});

const updateUserStatusSchema = Joi.object({
  status: Joi.number().valid(0, 1).required(),
  reason: Joi.string().max(500).optional()
});

const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
      code: 'VALIDATION_ERROR',
      errors: error.details.map(d => ({ field: d.path?.join('.'), message: d.message })),
      error: {
        code: 'VALIDATION_ERROR',
        message: error.details[0].message,
        details: error.details
      }
    });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
      code: 'VALIDATION_ERROR',
      errors: error.details.map(d => ({ field: d.path?.join('.'), message: d.message })),
      error: {
        code: 'VALIDATION_ERROR',
        message: error.details[0].message,
        details: error.details
      }
    });
  }
  next();
};

const validateUpdateProfile = (req, res, next) => {
  const { error } = updateProfileSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
      code: 'VALIDATION_ERROR',
      errors: error.details.map(d => ({ field: d.path?.join('.'), message: d.message })),
      error: {
        code: 'VALIDATION_ERROR',
        message: error.details[0].message,
        details: error.details
      }
    });
  }
  next();
};

const validateUpdateUserStatus = (req, res, next) => {
  const { error } = updateUserStatusSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
      code: 'VALIDATION_ERROR',
      errors: error.details.map(d => ({ field: d.path?.join('.'), message: d.message })),
      error: {
        code: 'VALIDATION_ERROR',
        message: error.details[0].message,
        details: error.details
      }
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateUpdateUserStatus
};
