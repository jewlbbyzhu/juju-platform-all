const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Follow = sequelize.define('Follow', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  follower_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '关注者ID'
  },
  following_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '被关注者ID'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：0-取消关注，1-关注中'
  }
}, {
  tableName: 'follows',
  comment: '关注关系表',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['follower_id'] },
    { fields: ['following_id'] },
    { unique: true, fields: ['follower_id', 'following_id'] }
  ]
});

module.exports = Follow;
