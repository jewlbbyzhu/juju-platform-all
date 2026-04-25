const { BankCard } = require('../models');
const logger = require('../utils/logger');
const { encrypt, maskCardNumber } = require('../utils/encryption');
const { validateCardNumber, validatePhone, validateString } = require('../utils/validator');

class BankCardController {
  async getBankCards(req, res, next) {
    try {
      const bankCards = await BankCard.findAll({
        where: { user_id: req.user.id },
        order: [['created_at', 'DESC']]
      });

      const maskedCards = bankCards.map(card => ({
        ...card.dataValues,
        card_number: maskCardNumber(card.card_number)
      }));

      res.json({
        success: true,
        data: maskedCards
      });
    } catch (error) {
      logger.error('Get bank cards error:', error);
      next(error);
    }
  }

  async addBankCard(req, res, next) {
    try {
      const { bankName, cardNumber, cardHolder, phone } = req.body;
      
      const bankNameValidation = validateString(bankName, 'Bank name', 2, 50);
      if (!bankNameValidation.valid) {
        return res.status(400).json({
          success: false,
          message: bankNameValidation.message
        });
      }
      
      const cardNumberValidation = validateCardNumber(cardNumber);
      if (!cardNumberValidation.valid) {
        return res.status(400).json({
          success: false,
          message: cardNumberValidation.message
        });
      }
      
      const cardHolderValidation = validateString(cardHolder, 'Card holder name', 2, 50);
      if (!cardHolderValidation.valid) {
        return res.status(400).json({
          success: false,
          message: cardHolderValidation.message
        });
      }
      
      const phoneValidation = validatePhone(phone);
      if (!phoneValidation.valid) {
        return res.status(400).json({
          success: false,
          message: phoneValidation.message
        });
      }

      const encryptedCardNumber = encrypt(cardNumber);
      const bankCard = await BankCard.create({
        user_id: req.user.id,
        bank_name: bankName,
        card_number: encryptedCardNumber,
        card_holder: cardHolder,
        card_type: 'debit',
        phone: phone,
        is_default: false,
        status: 1
      });

      res.json({
        success: true,
        message: 'Bank card added successfully',
        data: {
          ...bankCard.dataValues,
          card_number: maskCardNumber(cardNumber)
        }
      });
    } catch (error) {
      logger.error('Add bank card error:', error);
      next(error);
    }
  }

  async deleteBankCard(req, res, next) {
    try {
      const bankCard = await BankCard.findOne({
        where: {
          id: req.params.id,
          user_id: req.user.id
        }
      });

      if (!bankCard) {
        throw new Error('Bank card not found');
      }

      await bankCard.destroy();

      res.json({
        success: true,
        message: 'Bank card deleted successfully'
      });
    } catch (error) {
      logger.error('Delete bank card error:', error);
      next(error);
    }
  }

  async setDefaultBankCard(req, res, next) {
    try {
      const bankCard = await BankCard.findOne({
        where: {
          id: req.params.id,
          user_id: req.user.id
        }
      });

      if (!bankCard) {
        throw new Error('Bank card not found');
      }

      await BankCard.update(
        { is_default: false },
        { where: { user_id: req.user.id } }
      );

      bankCard.is_default = true;
      await bankCard.save();

      res.json({
        success: true,
        message: 'Default bank card set successfully'
      });
    } catch (error) {
      logger.error('Set default bank card error:', error);
      next(error);
    }
  }
}

module.exports = new BankCardController();
