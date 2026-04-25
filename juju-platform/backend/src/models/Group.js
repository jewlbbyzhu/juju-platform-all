const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '群组名称'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '群组描述'
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '群组头像'
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '群主ID'
  },
  max_members: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 500,
    comment: '最大成员数'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：0-禁用，1-正常'
  }
}, {
  tableName: 'groups',
  comment: '群组表',
  timestamps: true,
  underscored: true
});

module.exports = Group;
