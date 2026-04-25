const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ticket = sequelize.define('Ticket', {
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
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '订单ID'
  },
  ticket_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '票型ID'
  },
  party_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '聚会ID'
  },
  ticket_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '票码'
  },
  qr_code: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '二维码URL'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '状态：0-未使用，1-已使用，2-已过期，3-已退款'
  },
  used_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '使用时间'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '过期时间'
  }
}, {
  tableName: 'tickets',
  comment: '票券表',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['order_id'] },
    { fields: ['ticket_type_id'] },
    { fields: ['party_id'] },
    { fields: ['ticket_code'] },
    { fields: ['status'] },
    { fields: ['expires_at'] }
  ]
});

module.exports = Ticket;
