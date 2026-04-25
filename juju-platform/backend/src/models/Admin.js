const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '用户名'
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '密码（加密）'
  },
  real_name: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '真实姓名'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '手机号'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '邮箱'
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '头像URL'
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '角色ID'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：0-禁用，1-正常'
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
  }
}, {
  tableName: 'admins',
  comment: '管理员表',
  indexes: [
    { fields: ['username'] },
    { fields: ['role_id'] },
    { fields: ['status'] }
  ]
});

module.exports = Admin;
