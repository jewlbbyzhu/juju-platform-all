const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserTag = sequelize.define('UserTag', {
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
  tag_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '标签ID'
  }
}, {
  tableName: 'user_tags',
  comment: '用户标签关联表',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['tag_id'] },
    { fields: ['user_id', 'tag_id'], unique: true }
  ]
});

module.exports = UserTag;
