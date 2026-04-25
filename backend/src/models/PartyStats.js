const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PartyStats = sequelize.define('PartyStats', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  party_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    comment: '聚会ID'
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
  }
}, {
  tableName: 'party_stats',
  comment: '聚会统计表',
  indexes: [
    { fields: ['party_id'], unique: true }
  ]
});

module.exports = PartyStats;
