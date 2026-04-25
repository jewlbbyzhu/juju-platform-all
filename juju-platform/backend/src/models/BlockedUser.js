const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BlockedUser = sequelize.define('BlockedUser', {
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
  blocked_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '被拉黑用户ID'
  },
  blocked_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '拉黑时间'
  }
}, {
  tableName: 'blocked_users',
  comment: '用户拉黑表',
  timestamps: false,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['blocked_user_id'] },
    { fields: ['user_id', 'blocked_user_id'], unique: true }
  ]
});

module.exports = BlockedUser;
