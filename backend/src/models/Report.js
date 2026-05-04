const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reporter_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '举报人ID'
  },
  target_type: {
    type: DataTypes.ENUM('user', 'party', 'post', 'comment', 'message'),
    allowNull: false,
    comment: '举报目标类型'
  },
  target_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '举报目标ID'
  },
  reason: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '举报原因: spam-垃圾信息, harassment-骚扰, fraud-欺诈, inappropriate-不当内容, other-其他'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '详细描述'
  },
  evidence: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '证据截图/链接列表'
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'resolved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
    comment: '处理状态'
  },
  result: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '处理结果: warning-警告, ban-封禁, dismiss-驳回, delete-删除内容'
  },
  result_note: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '处理备注'
  },
  handled_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '处理人ID(管理员)'
  },
  handled_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '处理时间'
  }
}, {
  tableName: 'reports',
  comment: '举报/投诉表',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['reporter_id'] },
    { fields: ['target_type', 'target_id'] },
    { fields: ['status'] },
    { fields: ['created_at'] },
    { fields: ['reporter_id', 'target_type', 'target_id'], unique: true, name: 'unique_report' }
  ]
});

module.exports = Report;