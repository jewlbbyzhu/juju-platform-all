const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PartyTag = sequelize.define('PartyTag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  party_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '活动ID'
  },
  tag_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '标签ID'
  }
}, {
  tableName: 'party_tags',
  comment: '活动标签关联表',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['party_id'] },
    { fields: ['tag_id'] },
    { fields: ['party_id', 'tag_id'], unique: true }
  ]
});

module.exports = PartyTag;
