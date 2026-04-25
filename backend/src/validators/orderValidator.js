const Joi = require('joi');

const createOrderSchema = Joi.object({
  party_id: Joi.number().integer().required(),
  // 兼容前端两种格式：
  // 格式1: items 数组 (后端原格式)
  items: Joi.array().items(
    Joi.object({
      ticket_type_id: Joi.number().integer().required(),
      quantity: Joi.number().integer().min(1).required()
    })
  ).min(1),
  // 格式2: 前端直接发送的字段 (ticket_id + quantity)
  ticket_id: Joi.number().integer(),
  quantity: Joi.number().integer().min(1),
  // 兼容前端字段名
  name: Joi.string().max(100),
  contact_name: Joi.string().max(100),
  phone: Joi.string().max(20),
  contact_phone: Joi.string().max(20),
  gender: Joi.number().integer().valid(0, 1, 2),
  remark: Joi.string().max(500)
}).custom((value, helpers) => {
  // 必须提供 items 数组 或 ticket_id + quantity 之一
  if (!value.items && (!value.ticket_id || !value.quantity)) {
    return helpers.error('order.format', { message: '必须提供 items 数组或 ticket_id + quantity' });
  }
  return value;
});

const cancelOrderSchema = Joi.object({
  reason: Joi.string().max(500),
  cancel_reason: Joi.string().max(500)
}).custom((value, helpers) => {
  // 兼容前端字段名：reason 或 cancel_reason 至少提供一个
  if (!value.reason && !value.cancel_reason) {
    return helpers.error('cancel.reason', { message: '必须提供取消原因' });
  }
  return value;
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
