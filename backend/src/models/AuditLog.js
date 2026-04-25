const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '操作人ID'
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '操作类型'
  },
  entity_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '实体类型'
  },
  entity_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '实体ID'
  },
  old_value: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '旧值'
  },
  new_value: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '新值'
  },
  reason: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '操作原因'
  },
  ip_address: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'IP地址'
  },
  user_agent: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '用户代理'
  }
}, {
  tableName: 'audit_logs',
  comment: '审计日志表',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['entity_type'] },
    { fields: ['entity_id'] },
    { fields: ['action'] },
    { fields: ['created_at'] }
  ],
  updatedAt: false
});

module.exports = AuditLog;
