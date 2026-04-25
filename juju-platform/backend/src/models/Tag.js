const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tag = sequelize.define('Tag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '标签名称'
  },
  icon: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '图标'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '标签描述'
  },
  usage_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '使用次数'
  },
  is_hot: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '是否热门'
  },
  is_recommended: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '是否推荐'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '排序'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：0-禁用，1-启用'
  }
}, {
  tableName: 'tags',
  comment: '标签表',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['name'], unique: true },
    { fields: ['is_hot'] },
    { fields: ['is_recommended'] },
    { fields: ['status'] },
    { fields: ['usage_count'] }
  ]
});

module.exports = Tag;
