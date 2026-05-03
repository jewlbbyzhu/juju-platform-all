const { BankCard } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class BankCardService {
  async addBankCard(userId, bankCardData) {
    try {
      const bankCard = await BankCard.create({
        user_id: userId,
        bank_name: bankCardData.bank_name,
        card_number: this.encryptCardNumber(bankCardData.card_number),
        card_holder: bankCardData.card_holder,
        card_type: bankCardData.card_type || 'debit',
        is_default: bankCardData.is_default || false,
        status: 1
      });

      if (bankCardData.is_default) {
        await BankCard.update(
          { is_default: false },
          {
            where: {
              user_id: userId,
              id: { [Op.ne]: bankCard.id }
            }
          }
        );
      }

      return await this.getBankCardById(bankCard.id);
    } catch (error) {
      logger.error('Add bank card failed:', error);
      throw error;
    }
  }

  async getBankCardById(bankCardId) {
    try {
      const bankCard = await BankCard.findByPk(bankCardId);
      if (!bankCard) {
        throw new Error('Bank card not found');
      }

      return this.sanitizeBankCard(bankCard);
    } catch (error) {
      logger.error('Get bank card by ID failed:', error);
      throw error;
    }
  }

  async getBankCardList(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      const { count, rows } = await BankCard.findAndCountAll({
        where: { user_id: userId },
        offset,
        limit,
        order: [['created_at', 'DESC']]
      });

      return {
        total: count,
        page,
        limit,
        data: rows.map(card => this.sanitizeBankCard(card))
      };
    } catch (error) {
      logger.error('Get bank card list failed:', error);
      throw error;
    }
  }

  async updateBankCard(bankCardId, userId, updateData) {
    try {
      const bankCard = await BankCard.findByPk(bankCardId);
      if (!bankCard) {
        throw new Error('Bank card not found');
      }

      if (bankCard.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      const allowedFields = [
        'bank_name',
        'card_holder',
        'card_type',
        'is_default'
      ];

      const updates = {};
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      }

      if (updateData.card_number) {
        updates.card_number = this.encryptCardNumber(updateData.card_number);
      }

      if (updateData.is_default) {
        await BankCard.update(
          { is_default: false },
          {
            where: {
              user_id: userId,
              id: { [Op.ne]: bankCardId }
            }
          }
        );
      }

      await bankCard.update(updates);

      return await this.getBankCardById(bankCard.id);
    } catch (error) {
      logger.error('Update bank card failed:', error);
      throw error;
    }
  }

  async deleteBankCard(bankCardId, userId) {
    try {
      const bankCard = await BankCard.findByPk(bankCardId);
      if (!bankCard) {
        throw new Error('Bank card not found');
      }

      if (bankCard.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      await bankCard.destroy();
      return { message: 'Bank card deleted successfully' };
    } catch (error) {
      logger.error('Delete bank card failed:', error);
      throw error;
    }
  }

  async setDefaultBankCard(bankCardId, userId) {
    try {
      const bankCard = await BankCard.findByPk(bankCardId);
      if (!bankCard) {
        throw new Error('Bank card not found');
      }

      if (bankCard.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      await BankCard.update(
        { is_default: false },
        {
          where: { user_id: userId }
        }
      );

      bankCard.is_default = true;
      await bankCard.save();

      return await this.getBankCardById(bankCard.id);
    } catch (error) {
      logger.error('Set default bank card failed:', error);
      throw error;
    }
  }

  encryptCardNumber(cardNumber) {
    const crypto = require('crypto');
    const algorithm = 'aes-256-gcm';

    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('Encryption key must be set in environment variables');
    }

    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'utf8');
    // 使用随机IV（每次加密不同），GCM模式更安全
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(cardNumber, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    // 格式: iv:authTag:encrypted
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  decryptCardNumber(encryptedCardNumber) {
    const crypto = require('crypto');
    const algorithm = 'aes-256-gcm';

    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('Encryption key must be set in environment variables');
    }

    const parts = encryptedCardNumber.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted card number format');
    }

    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'utf8');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  sanitizeBankCard(bankCard) {
    const { dataValues } = bankCard;
    if (dataValues.card_number && dataValues.card_number.length > 8) {
      dataValues.card_number = dataValues.card_number.substring(0, 4) + '****' + dataValues.card_number.substring(dataValues.card_number.length - 4);
    }
    return dataValues;
  }
}

module.exports = new BankCardService();
