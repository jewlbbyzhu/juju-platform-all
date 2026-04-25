const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '订单ID'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户ID'
  },
  bank_card_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '银行卡ID（银行卡支付时使用）'
  },
  payment_no: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '支付单号'
  },
  transaction_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '第三方交易号'
  },
  payment_method: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '支付方式：wechat, alipay, wallet, bankcard'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '支付金额'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '状态：0-待支付，1-支付成功，2-支付失败，3-已退款'
  },
  payment_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '支付时间'
  },
  callback_data: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '回调数据'
  }
}, {
  tableName: 'payments',
  comment: '支付表',
  indexes: [
    { fields: ['order_id'] },
    { fields: ['user_id'] },
    { fields: ['bank_card_id'] },
    { fields: ['payment_no'] },
    { fields: ['transaction_id'] },
    { fields: ['status'] }
  ],
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  freezeTableName: true,
  constraints: false
});

module.exports = Payment;
