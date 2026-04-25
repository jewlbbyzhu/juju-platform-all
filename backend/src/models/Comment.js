const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '评论者ID'
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
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '评论内容'
  },
  reply_to: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '回复的评论ID'
  },
  like_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '点赞数'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：0-删除，1-正常'
  }
}, {
  tableName: 'comments',
  comment: '评论表',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['post_id'] },
    { fields: ['party_id'] },
    { fields: ['reply_to'] },
    { fields: ['status'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Comment;
