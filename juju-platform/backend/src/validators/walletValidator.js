const Joi = require('joi');

const rechargeSchema = Joi.object({
  amount: Joi.number().positive().required(),
  payment_method: Joi.string().valid('wechat', 'alipay', 'bank').required(),
  transaction_id: Joi.string().max(100)
});

const withdrawSchema = Joi.object({
  amount: Joi.number().positive().required(),
  bank_card_id: Joi.number().integer().required(),
  password: Joi.string().min(6).max(20).required()
});

const transferSchema = Joi.object({
  to_user_id: Joi.number().integer().required(),
  amount: Joi.number().positive().required(),
  password: Joi.string().min(6).max(20).required()
});

const setPasswordSchema = Joi.object({
  old_password: Joi.string().min(6).max(20),
  new_password: Joi.string().min(6).max(20).required()
});

const freezeBalanceSchema = Joi.object({
  amount: Joi.number().positive().required()
});

const unfreezeBalanceSchema = Joi.object({
  amount: Joi.number().positive().required()
});

const validateRecharge = (req, res, next) => {
  const { error } = rechargeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateWithdraw = (req, res, next) => {
  const { error } = withdrawSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateTransfer = (req, res, next) => {
  const { error } = transferSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateSetPassword = (req, res, next) => {
  const { error } = setPasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateFreezeBalance = (req, res, next) => {
  const { error } = freezeBalanceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateUnfreezeBalance = (req, res, next) => {
  const { error } = unfreezeBalanceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateRecharge,
  validateWithdraw,
  validateTransfer,
  validateSetPassword,
  validateFreezeBalance,
  validateUnfreezeBalance
};
