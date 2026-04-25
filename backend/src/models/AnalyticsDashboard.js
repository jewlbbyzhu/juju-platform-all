const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AnalyticsDashboard = sequelize.define('AnalyticsDashboard', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '仪表盘名称'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '仪表盘描述'
  },
  layout: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
    comment: '仪表盘布局配置'
  },
  widgets: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    comment: '组件列表'
  },
  is_default: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '是否默认仪表盘：0-否，1-是'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '创建人ID'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：0-禁用，1-启用'
  }
}, {
  tableName: 'analytics_dashboards',
  comment: '自定义分析仪表盘表',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['created_by'] },
    { fields: ['is_default'] },
    { fields: ['status'] }
  ]
});

module.exports = AnalyticsDashboard;
