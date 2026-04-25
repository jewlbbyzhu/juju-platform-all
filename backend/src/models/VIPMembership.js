const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VIPMembership = sequelize.define('VIPMembership', {
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
  membership_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '会员类型：monthly, quarterly, yearly'
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '开始日期'
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '结束日期'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：0-已过期，1-生效中'
  },
  payment_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '支付ID'
  }
}, {
  tableName: 'vip_memberships',
  comment: 'VIP会员表',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['status'] },
    { fields: ['end_date'] }
  ]
});

module.exports = VIPMembership;
