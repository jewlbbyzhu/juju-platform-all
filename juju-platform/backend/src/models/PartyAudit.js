const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PartyAudit = sequelize.define('PartyAudit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  party_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '聚会ID'
  },
  audit_status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '审核状态: 0-待审核, 1-已通过, 2-已拒绝'
  },
  audit_reason: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '审核原因/备注'
  },
  auditor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '审核人ID'
  }
}, {
  tableName: 'party_audits',
  comment: '聚会审核记录表',
  indexes: [
    { fields: ['party_id'] },
    { fields: ['audit_status'] },
    { fields: ['auditor_id'] },
    { fields: ['created_at'] }
  ],
  updatedAt: false
});

module.exports = PartyAudit;
