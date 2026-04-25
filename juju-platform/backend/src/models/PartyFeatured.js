const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PartyFeatured = sequelize.define('PartyFeatured', {
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
  weight: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: false,
    defaultValue: 1.0,
    comment: '推荐权重'
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '开始时间'
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '结束时间'
  }
}, {
  tableName: 'party_featured',
  comment: '聚会推荐表',
  indexes: [
    { fields: ['party_id'], unique: true },
    { fields: ['start_time'] },
    { fields: ['end_time'] },
    { fields: ['weight'] }
  ]
});

module.exports = PartyFeatured;
