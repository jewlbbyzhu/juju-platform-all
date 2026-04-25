const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '角色名称'
  },
  description: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '角色描述'
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '权限列表'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：0-禁用，1-正常'
  }
}, {
  tableName: 'roles',
  comment: '角色表',
  indexes: [
    { fields: ['name'] },
    { fields: ['status'] }
  ]
});

module.exports = Role;
