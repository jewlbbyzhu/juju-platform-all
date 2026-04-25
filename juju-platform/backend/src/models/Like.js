const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '点赞者ID'
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '动态ID'
  },
  party_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '聚会ID'
  },
  comment_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '评论ID'
  }
}, {
  tableName: 'likes',
  comment: '点赞表',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['post_id'] },
    { fields: ['party_id'] },
    { fields: ['comment_id'] },
    { unique: true, fields: ['user_id', 'post_id'] },
    { unique: true, fields: ['user_id', 'party_id'] },
    { unique: true, fields: ['user_id', 'comment_id'] }
  ]
});

module.exports = Like;
