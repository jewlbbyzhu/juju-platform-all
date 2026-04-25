const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Refund = sequelize.define('Refund', {
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
  payment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '支付ID'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户ID'
  },
  refund_no: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '退款单号'
  },
  refund_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '第三方退款号'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '退款金额'
  },
  reason: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '退款原因'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '状态：0-待处理，1-处理中，2-退款成功，3-退款失败'
  },
  refund_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '退款时间'
  }
}, {
  tableName: 'refunds',
  comment: '退款表',
  indexes: [
    { fields: ['order_id'] },
    { fields: ['payment_id'] },
    { fields: ['user_id'] },
    { fields: ['refund_no'] },
    { fields: ['status'] }
  ]
});

module.exports = Refund;
