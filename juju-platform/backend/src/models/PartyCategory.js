const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PartyCategory = sequelize.define('PartyCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  slug: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '英文标识'
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '分类名称'
  },
  name_en: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '英文名称'
  },
  icon: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '图标'
  },
  color: {
    type: DataTypes.STRING(20),
    defaultValue: '#ff6b35',
    comment: '主题色'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '分类描述'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态: 0禁用 1启用'
  }
}, {
  tableName: 'ui_themes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = PartyCategory;
