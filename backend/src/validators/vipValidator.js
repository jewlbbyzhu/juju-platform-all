const Joi = require('joi');

const purchaseVIPSchema = Joi.object({
  membership_type: Joi.string().valid('monthly', 'quarterly', 'yearly').required(),
  payment_method: Joi.string().valid('wechat', 'alipay', 'wallet').required()
});

const renewMembershipSchema = Joi.object({
  membership_type: Joi.string().valid('monthly', 'quarterly', 'yearly').required()
});

const validatePurchaseVIP = (req, res, next) => {
  const { error } = purchaseVIPSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateRenewMembership = (req, res, next) => {
  const { error } = renewMembershipSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validatePurchaseVIP,
  validateRenewMembership
};
