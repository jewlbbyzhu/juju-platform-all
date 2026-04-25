const Joi = require('joi');

const createOrderSchema = Joi.object({
  party_id: Joi.number().integer().required(),
  items: Joi.array().items(
    Joi.object({
      ticket_type_id: Joi.number().integer().required(),
      quantity: Joi.number().integer().min(1).required()
    })
  ).min(1).required(),
  remark: Joi.string().max(500)
});

const cancelOrderSchema = Joi.object({
  reason: Joi.string().max(500).required()
});

const applyRefundSchema = Joi.object({
  reason: Joi.string().max(500).required()
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.number().valid(0, 1, 2, 3, 4).required()
});

const validateCreateOrder = (req, res, next) => {
  const { error } = createOrderSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateCancelOrder = (req, res, next) => {
  const { error } = cancelOrderSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateApplyRefund = (req, res, next) => {
  const { error } = applyRefundSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateUpdateOrderStatus = (req, res, next) => {
  const { error } = updateOrderStatusSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateCreateOrder,
  validateCancelOrder,
  validateApplyRefund,
  validateUpdateOrderStatus
};
