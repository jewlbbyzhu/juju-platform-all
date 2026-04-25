const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserPreference = sequelize.define('UserPreference', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    comment: '用户ID'
  },
  preferences: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '用户偏好设置'
  },
  interests: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '用户兴趣标签'
  },
  notification_settings: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '通知设置'
  },
  privacy_settings: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '隐私设置'
  }
}, {
  tableName: 'user_preferences',
  comment: '用户偏好设置表',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'], unique: true }
  ]
});

module.exports = UserPreference;
