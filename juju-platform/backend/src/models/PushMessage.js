const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PushMessage = sequelize.define('PushMessage', {
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
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '推送标题'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '推送内容'
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '推送类型'
  },
  data: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '附加数据'
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'sent',
    comment: '状态：sent-已发送，read-已读'
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '发送时间'
  }
}, {
  tableName: 'push_messages',
  comment: '推送消息表',
  timestamps: true,
  underscored: true
});

module.exports = PushMessage;
