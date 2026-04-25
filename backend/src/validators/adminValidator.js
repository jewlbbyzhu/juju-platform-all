const Joi = require('joi');

const loginSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).max(20).required()
});

const createAdminSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).max(20).required(),
  real_name: Joi.string().min(1).max(50).required(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/),
  email: Joi.string().email(),
  avatar: Joi.string().uri().max(500),
  role_id: Joi.number().integer().required()
});

const updateAdminSchema = Joi.object({
  real_name: Joi.string().min(1).max(50),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/),
  email: Joi.string().email(),
  avatar: Joi.string().uri().max(500),
  role_id: Joi.number().integer(),
  password: Joi.string().min(6).max(20),
  status: Joi.number().valid(0, 1)
});

const createRoleSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  description: Joi.string().max(200),
  permissions: Joi.array().items(Joi.string()),
  status: Joi.number().valid(0, 1).default(1)
});

const updateRoleSchema = Joi.object({
  name: Joi.string().min(1).max(50),
  description: Joi.string().max(200),
  permissions: Joi.array().items(Joi.string()),
  status: Joi.number().valid(0, 1)
});

const createPermissionSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  code: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(200),
  module: Joi.string().min(1).max(50).required(),
  status: Joi.number().valid(0, 1).default(1)
});

const updatePermissionSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  code: Joi.string().min(1).max(100),
  description: Joi.string().max(200),
  module: Joi.string().min(1).max(50),
  status: Joi.number().valid(0, 1)
});

const updateAdminStatusSchema = Joi.object({
  status: Joi.number().valid(0, 1).required()
});

const validateLogin = (req, res, next) => {
  const { error, value } = loginSchema.validate(req.body, { stripUnknown: true });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  req.body = value;
  next();
};

const validateCreateAdmin = (req, res, next) => {
  const { error } = createAdminSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateUpdateAdmin = (req, res, next) => {
  const { error } = updateAdminSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateCreateRole = (req, res, next) => {
  const { error } = createRoleSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateUpdateRole = (req, res, next) => {
  const { error } = updateRoleSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateCreatePermission = (req, res, next) => {
  const { error } = createPermissionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateUpdatePermission = (req, res, next) => {
  const { error } = updatePermissionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateUpdateAdminStatus = (req, res, next) => {
  const { error } = updateAdminStatusSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateLogin,
  validateCreateAdmin,
  validateUpdateAdmin,
  validateCreateRole,
  validateUpdateRole,
  validateCreatePermission,
  validateUpdatePermission,
  validateUpdateAdminStatus
};
