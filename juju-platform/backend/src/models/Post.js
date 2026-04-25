const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '发布者ID'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '动态内容'
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '图片列表JSON数组'
  },
  party_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '关联的聚会ID'
  },
  location: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '位置信息JSON{name, address, latitude, longitude}'
  },
  visibility: {
    type: DataTypes.ENUM('public', 'friends'),
    allowNull: false,
    defaultValue: 'public',
    comment: '可见性：public-公开，friends-仅好友'
  },
  like_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '点赞数'
  },
  comment_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '评论数'
  },
  share_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '分享数'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：0-删除，1-正常'
  }
}, {
  tableName: 'posts',
  comment: '动态表',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['party_id'] },
    { fields: ['visibility'] },
    { fields: ['status'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Post;
