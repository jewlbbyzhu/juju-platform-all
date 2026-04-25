const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '对话ID'
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '发送者ID'
  },
  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '接收者ID'
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
  tableName: 'messages',
  comment: '消息表',
  timestamps: true,
  underscored: true
});

module.exports = Message;
