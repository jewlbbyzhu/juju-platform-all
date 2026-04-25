const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WalletTransaction = sequelize.define('WalletTransaction', {
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
  wallet_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '钱包ID'
  },
  type: {
    type: DataTypes.ENUM('recharge', 'withdraw', 'payment', 'refund', 'income'),
    allowNull: false,
    comment: '类型：recharge-充值, withdraw-提现, payment-支付, refund-退款, income-收入'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '金额'
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '余额'
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '描述'
  },
  related_order_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '关联订单ID'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：0-失败，1-成功'
  }
}, {
  tableName: 'wallet_transactions',
  comment: '钱包交易记录表',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['wallet_id'] },
    { fields: ['type'] },
    { fields: ['related_order_id'] },
    { fields: ['created_at'] }
  ]
});

module.exports = WalletTransaction;
