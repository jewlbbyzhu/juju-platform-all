const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '权限名称'
  },
  code: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '权限代码'
  },
  description: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '权限描述'
  },
  module: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '所属模块'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：0-禁用，1-正常'
  }
}, {
  tableName: 'permissions',
  comment: '权限表',
  indexes: [
    { fields: ['name'] },
    { fields: ['code'] },
    { fields: ['module'] },
    { fields: ['status'] }
  ]
});

module.exports = Permission;
