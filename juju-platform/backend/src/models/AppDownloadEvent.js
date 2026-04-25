const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AppDownloadEvent = sequelize.define('AppDownloadEvent', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  version_id: { type: DataTypes.INTEGER, allowNull: true },
  platform: { type: DataTypes.STRING(20), allowNull: true },
  user_id: { type: DataTypes.INTEGER, allowNull: true },
  ip: { type: DataTypes.STRING(64), allowNull: true },
  ua: { type: DataTypes.STRING(512), allowNull: true }
}, {
  tableName: 'app_download_events',
  indexes: [
    { fields: ['version_id'] },
    { fields: ['platform'] },
    { fields: ['user_id'] },
    { fields: ['created_at'] }
  ]
});

module.exports = AppDownloadEvent;
