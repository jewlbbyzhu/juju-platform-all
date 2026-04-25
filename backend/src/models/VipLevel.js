const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VipLevel = sequelize.define('VipLevel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '等级'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '等级名称'
  },
  min_growth: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '最小成长值'
  },
  max_growth: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '最大成长值'
  },
  benefits: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '等级权益'
  },
  icon: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '等级图标'
  }
}, {
  tableName: 'vip_levels',
  comment: 'VIP等级表',
  timestamps: true,
  underscored: true
});

module.exports = VipLevel;
