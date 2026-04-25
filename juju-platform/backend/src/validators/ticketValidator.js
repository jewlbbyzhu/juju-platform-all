const Joi = require('joi');

const verifyTicketSchema = Joi.object({
  code: Joi.string().required()
});

const useTicketSchema = Joi.object({
  code: Joi.string().required()
});

const invalidateTicketSchema = Joi.object({
  reason: Joi.string().max(500)
});

const validateVerifyTicket = (req, res, next) => {
  const { error } = verifyTicketSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateUseTicket = (req, res, next) => {
  const { error } = useTicketSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateInvalidateTicket = (req, res, next) => {
  const { error } = invalidateTicketSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateVerifyTicket,
  validateUseTicket,
  validateInvalidateTicket
};
