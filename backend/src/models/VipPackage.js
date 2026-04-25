const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VipPackage = sequelize.define('VipPackage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '套餐名称'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '套餐描述'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '价格'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '时长(月)'
  },
  benefits: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '权益列表'
  },
  is_recommended: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '是否推荐'
  },
  is_active: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '是否启用'
  }
}, {
  tableName: 'vip_packages',
  comment: 'VIP套餐表',
  timestamps: true,
  underscored: true
});

module.exports = VipPackage;
