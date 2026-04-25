const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VipBenefit = sequelize.define('VipBenefit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '权益名称'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '权益描述'
  },
  icon: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '权益图标'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '排序'
  },
  is_active: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '是否启用'
  }
}, {
  tableName: 'vip_benefits',
  comment: 'VIP权益表',
  timestamps: true,
  underscored: true
});

module.exports = VipBenefit;
