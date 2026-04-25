const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
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
  order_no: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '订单号'
  },
  party_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '聚会ID'
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '总金额'
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: '优惠金额'
  },
  final_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '实付金额'
  },
  payment_method: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '支付方式：wechat, alipay, wallet'
  },
  payment_status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '支付状态：0-待支付，1-已支付，2-已取消，3-已退款'
  },
  payment_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '支付时间'
  },
  payment_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '支付记录ID'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '订单状态：0-待支付，1-已支付，2-已完成，3-已取消，4-已退款'
  },
  cancel_reason: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '取消原因'
  },
  cancel_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '取消时间'
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '支付时间（别名）'
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '取消时间（别名）'
  },
  refunded_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '退款时间（别名）'
  },
  remark: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '备注'
  },
  participant_completed: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: '参与者是否点击完成按钮'
  },
  settlement_status: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 0,
    comment: '结算状态：0-未结算，1-已结算'
  }
}, {
  tableName: 'orders',
  comment: '订单表',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['party_id'] },
    { fields: ['order_no'] },
    { fields: ['payment_status'] },
    { fields: ['status'] },
    { fields: ['participant_completed'] },
    { fields: ['settlement_status'] },
    { fields: ['created_at'] }
  ],
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  freezeTableName: true
});

module.exports = Order;
