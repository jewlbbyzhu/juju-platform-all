const Joi = require('joi');

const createPaymentSchema = Joi.object({
  order_id: Joi.number().integer().required(),
  payment_method: Joi.string().valid('wechat', 'alipay', 'wallet').required()
});

const validateCreatePayment = (req, res, next) => {
  const { error } = createPaymentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateCreatePayment
};
