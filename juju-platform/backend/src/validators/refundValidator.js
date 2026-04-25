const Joi = require('joi');

const auditRefundSchema = Joi.object({
  audit_status: Joi.number().valid(1, 2).required(),
  audit_reason: Joi.string().max(500).when('audit_status', {
    is: 2,
    then: Joi.required()
  })
});

const validateAuditRefund = (req, res, next) => {
  const { error } = auditRefundSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateAuditRefund
};
