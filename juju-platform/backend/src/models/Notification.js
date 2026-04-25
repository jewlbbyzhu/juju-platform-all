const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户ID'
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '类型：order, payment, refund, system, etc.'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '标题'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '内容'
  },
  data: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '附加数据'
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '是否已读'
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '阅读时间'
  }
}, {
  tableName: 'notifications',
  comment: '通知表',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['type'] },
    { fields: ['is_read'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Notification;
