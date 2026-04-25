const Joi = require('joi');

const createPartySchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(5000),
  cover_image: Joi.string().uri().max(500),
  images: Joi.array().items(Joi.string().uri().max(500)),
  category: Joi.string().max(50).required(),
  start_time: Joi.date().required(),
  end_time: Joi.date().greater(Joi.ref('start_time')).required(),
  location: Joi.string().min(1).max(200).required(),
  address: Joi.string().max(500),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
  max_participants: Joi.number().integer().min(1).required(),
  min_price: Joi.number().min(0).default(0),
  max_price: Joi.number().min(0).default(0),
  ticket_types: Joi.array().items(
    Joi.object({
      name: Joi.string().min(1).max(100).required(),
      description: Joi.string().max(1000),
      price: Joi.number().min(0).required(),
      original_price: Joi.number().min(0),
      quantity: Joi.number().integer().min(1).required(),
      max_per_user: Joi.number().integer().min(0).default(0),
      sale_start_time: Joi.date(),
      sale_end_time: Joi.date().greater(Joi.ref('sale_start_time')),
      sort_order: Joi.number().integer().default(0)
    })
  )
});

const updatePartySchema = Joi.object({
  title: Joi.string().min(1).max(200),
  description: Joi.string().max(5000),
  cover_image: Joi.string().uri().max(500),
  images: Joi.array().items(Joi.string().uri().max(500)),
  category: Joi.string().max(50),
  start_time: Joi.date(),
  end_time: Joi.date().greater(Joi.ref('start_time')),
  location: Joi.string().min(1).max(200),
  address: Joi.string().max(500),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
  max_participants: Joi.number().integer().min(1),
  min_price: Joi.number().min(0),
  max_price: Joi.number().min(0),
  ticket_types: Joi.array().items(
    Joi.object({
      name: Joi.string().min(1).max(100).required(),
      description: Joi.string().max(1000),
      price: Joi.number().min(0).required(),
      original_price: Joi.number().min(0),
      available_count: Joi.number().integer().min(1).required(),
      sold_count: Joi.number().integer().min(0).default(0),
      max_per_user: Joi.number().integer().min(0).default(0),
      sale_start_time: Joi.date(),
      sale_end_time: Joi.date().greater(Joi.ref('sale_start_time')),
      status: Joi.number().valid(0, 1).default(1),
      sort_order: Joi.number().integer().default(0)
    })
  )
});

const auditPartySchema = Joi.object({
  audit_status: Joi.number().valid(1, 2).required(),
  audit_reason: Joi.string().max(500).when('audit_status', {
    is: 2,
    then: Joi.required()
  })
});

const updatePartyStatusSchema = Joi.object({
  status: Joi.number().valid(0, 1, 2, 3, 4).required()
});

const validateCreateParty = (req, res, next) => {
  const { error } = createPartySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateUpdateParty = (req, res, next) => {
  const { error } = updatePartySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateAuditParty = (req, res, next) => {
  const { error } = auditPartySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateUpdatePartyStatus = (req, res, next) => {
  const { error } = updatePartyStatusSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateCreateParty,
  validateUpdateParty,
  validateAuditParty,
  validateUpdatePartyStatus
};
