const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PushSetting = sequelize.define('PushSetting', {
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
  order_notification: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '订单通知'
  },
  party_notification: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '聚会通知'
  },
  message_notification: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '消息通知'
  },
  system_notification: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '系统通知'
  }
}, {
  tableName: 'push_settings',
  comment: '推送设置表',
  timestamps: true,
  underscored: true
});

module.exports = PushSetting;
