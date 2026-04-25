const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  openid: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    comment: '微信OpenID'
  },
  unionid: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    comment: '微信UnionID'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    comment: '手机号'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    comment: '邮箱'
  },
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '昵称'
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '头像URL'
  },
  gender: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 0,
    comment: '性别：0-未知，1-男，2-女'
  },
  birthday: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '生日'
  },
  province: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '省份'
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '城市'
  },
  country: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '国家'
  },
  language: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'zh_CN',
    comment: '语言'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：0-禁用，1-正常'
  },
  is_vip: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: 0,
    comment: '是否VIP'
  },
  vip_level: {
    type: DataTypes.ENUM('monthly', 'quarterly', 'yearly'),
    allowNull: true,
    comment: 'VIP等级：monthly-月卡, quarterly-季卡, yearly-年卡'
  },
  vip_expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'VIP过期时间'
  },
  participated_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '参与聚会次数'
  },
  created_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '创建聚会次数'
  },
  favorite_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '收藏聚会次数'
  },
  bio: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '个人简介'
  },
  following_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '关注数'
  },
  followers_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '粉丝数'
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '最后登录时间'
  },
  last_login_ip: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '最后登录IP'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '密码哈希'
  }
}, {
  tableName: 'users',
  comment: '用户表',
  // 使用 Sequelize 时间戳并采用下划线命名，保证 created_at / updated_at 与数据库规范一致
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['openid'] },
    { fields: ['unionid'] },
    { fields: ['phone'] },
    { fields: ['email'] },
    { fields: ['status'] },
    { fields: ['is_vip'] },
    { fields: ['vip_level'] }
  ]
});

module.exports = User;
