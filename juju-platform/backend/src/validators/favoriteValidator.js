const Joi = require('joi');

const addFavoriteSchema = Joi.object({
  party_id: Joi.number().integer().required()
});

const validateAddFavorite = (req, res, next) => {
  const { error } = addFavoriteSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateAddFavorite
};
