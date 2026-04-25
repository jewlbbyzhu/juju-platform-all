const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Announcement = sequelize.define('Announcement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(200), allowNull: false, comment: '标题' },
  content: { type: DataTypes.TEXT, allowNull: false, comment: '内容' },
  // 帮助文档分类：快速入门、账户管理、聚会活动、支付问题、VIP服务
  category: { 
    type: DataTypes.ENUM('getting-started', 'account', 'parties', 'payments', 'vip'), 
    allowNull: true, 
    comment: '帮助文档分类' 
  },
  // 保留type字段用于区分公告类型
  type: { 
    type: DataTypes.ENUM('system', 'activity', 'maintenance', 'update', 'help'), 
    allowNull: false, 
    defaultValue: 'system', 
    comment: '类型：system-系统公告, activity-活动公告, maintenance-维护公告, update-更新公告, help-帮助文档' 
  },
  status: { type: DataTypes.ENUM('draft', 'published', 'archived'), allowNull: false, defaultValue: 'draft', comment: '状态' },
  published_at: { type: DataTypes.DATE, allowNull: true, comment: '发布时间' }
}, {
  tableName: 'announcements',
  comment: '内容管理-公告和帮助文档',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['type'] },
    { fields: ['category'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Announcement;
