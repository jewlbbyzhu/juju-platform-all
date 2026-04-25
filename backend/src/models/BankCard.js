const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BankCard = sequelize.define('BankCard', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户ID'
  },
  bank_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '银行名称'
  },
  card_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '卡号（加密存储）'
  },
  card_holder: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '持卡人姓名'
  },
  card_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '卡类型：debit, credit'
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '是否默认'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：0-禁用，1-正常'
  }
}, {
  tableName: 'bank_cards',
  comment: '银行卡表',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['status'] }
  ]
});

module.exports = BankCard;
