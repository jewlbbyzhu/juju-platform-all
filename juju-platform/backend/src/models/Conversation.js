const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id_1: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户1ID'
  },
  user_id_2: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户2ID'
  },
  last_message: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '最后一条消息'
  },
  last_message_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '最后消息时间'
  }
}, {
  tableName: 'conversations',
  comment: '对话表',
  timestamps: true,
  underscored: true
});

module.exports = Conversation;
