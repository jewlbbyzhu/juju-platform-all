const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GroupMember = sequelize.define('GroupMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  group_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '群组ID'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户ID'
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'member',
    comment: '角色：owner-群主，admin-管理员，member-成员'
  }
}, {
  tableName: 'group_members',
  comment: '群组成员表',
  timestamps: true,
  underscored: true
});

module.exports = GroupMember;
