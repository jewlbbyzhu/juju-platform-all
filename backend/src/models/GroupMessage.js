const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GroupMessage = sequelize.define('GroupMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  group_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '群组ID'
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '发送者ID'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '消息内容'
  },
  type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'text',
    comment: '消息类型：text-文本，image-图片，voice-语音'
  }
}, {
  tableName: 'group_messages',
  comment: '群组消息表',
  timestamps: true,
  underscored: true
});

module.exports = GroupMessage;
