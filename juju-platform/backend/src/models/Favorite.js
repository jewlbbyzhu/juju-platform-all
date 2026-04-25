const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户ID'
  },
  party_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '聚会ID'
  }
}, {
  tableName: 'favorites',
  comment: '收藏表',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['party_id'] },
    { unique: true, fields: ['user_id', 'party_id'] }
  ]
});

module.exports = Favorite;
