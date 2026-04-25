const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Party = sequelize.define('Party', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '创建者ID'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '聚会标题'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '聚会描述'
  },
  cover_image: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '封面图片URL'
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '图片列表'
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '分类'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '标签列表（1-3个）'
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '城市'
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '开始时间'
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '结束时间'
  },
  registration_deadline: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '报名截止时间'
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '地点'
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '详细地址'
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
    comment: '纬度'
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
    comment: '经度'
  },
  max_participants: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '最大参与人数'
  },
  min_participants: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '最少参与人数（VIP专属，低于此人数自动取消聚会）'
  },
  min_age: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '最小年龄限制'
  },
  max_age: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '最大年龄限制'
  },
  gender_restriction: {
    type: DataTypes.TINYINT,
    allowNull: true,
    comment: '性别限制：0-不限，1-男，2-女'
  },
  current_participants: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '当前参与人数'
  },
  min_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '最低价格'
  },
  max_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '最高价格'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: -1,
    comment: '状态：-1-草稿，0-待审核，1-已发布，2-进行中，3-已结束，4-已取消'
  },
  draft_status: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: -1,
    comment: '草稿状态：-1-草稿，0-已提交审核'
  },
  audit_status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '审核状态：0-待审核，1-审核通过，2-审核拒绝'
  },
  audit_reason: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '审核拒绝原因'
  },
  view_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '浏览次数'
  },
  favorite_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '收藏次数'
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
  is_featured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '是否精选'
  },
  is_hot: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: '是否热门'
  }
}, {
  tableName: 'parties',
  comment: '聚会表',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['category'] },
    { fields: ['city'] },
    { fields: ['start_time'] },
    { fields: ['status'] },
    { fields: ['audit_status'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Party;
