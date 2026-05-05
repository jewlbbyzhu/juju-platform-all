const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const Wallet = sequelize.define('Wallet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    comment: '用户ID'
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '余额'
  },
  frozen_balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '冻结余额'
  },
  total_income: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '总收入'
  },
  total_expense: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '总支出'
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '支付密码'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：0-禁用，1-正常'
  }
}, {
  tableName: 'wallets',
  comment: '钱包表',
  defaultScope: {
    attributes: { exclude: ['password'] }
  },
  indexes: [
    { fields: ['user_id'] },
    { fields: ['status'] }
  ],
  hooks: {
    beforeCreate: async (wallet) => {
      if (wallet.password) {
        wallet.password = await bcrypt.hash(wallet.password, 12);
      }
    },
    beforeUpdate: async (wallet) => {
      if (wallet.changed('password') && wallet.password) {
        wallet.password = await bcrypt.hash(wallet.password, 12);
      }
    }
  }
});

// 实例方法：验证支付密码
Wallet.prototype.verifyPassword = async function(password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

module.exports = Wallet;
