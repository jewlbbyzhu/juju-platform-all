const Joi = require('joi');

const addBankCardSchema = Joi.object({
  bank_name: Joi.string().min(1).max(50).required(),
  card_number: Joi.string().pattern(/^\d{16,19}$/).required(),
  card_holder: Joi.string().min(1).max(50).required(),
  card_type: Joi.string().valid('debit', 'credit').default('debit'),
  is_default: Joi.boolean().default(false)
});

const updateBankCardSchema = Joi.object({
  bank_name: Joi.string().min(1).max(50),
  card_number: Joi.string().pattern(/^\d{16,19}$/),
  card_holder: Joi.string().min(1).max(50),
  card_type: Joi.string().valid('debit', 'credit'),
  is_default: Joi.boolean()
});

const validateAddBankCard = (req, res, next) => {
  const { error } = addBankCardSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateUpdateBankCard = (req, res, next) => {
  const { error } = updateBankCardSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateAddBankCard,
  validateUpdateBankCard
};
