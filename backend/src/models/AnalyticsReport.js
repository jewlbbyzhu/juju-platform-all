const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AnalyticsReport = sequelize.define('AnalyticsReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '报表名称'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '报表描述'
  },
  type: {
    type: DataTypes.ENUM('orders', 'revenue', 'users', 'parties', 'custom'),
    allowNull: false,
    defaultValue: 'custom',
    comment: '报表类型'
  },
  config: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
    comment: '报表配置（维度、指标、筛选条件等）'
  },
  filters: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: '默认筛选条件'
  },
  dimensions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: '分析维度'
  },
  metrics: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: '分析指标'
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
  tableName: 'analytics_reports',
  comment: '自定义分析报表表',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['type'] },
    { fields: ['created_by'] },
    { fields: ['status'] }
  ]
});

module.exports = AnalyticsReport;
