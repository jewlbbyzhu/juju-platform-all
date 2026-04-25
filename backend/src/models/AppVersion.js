const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AppVersion = sequelize.define('AppVersion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  platform: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '平台：ios, android'
  },
  version: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '版本号'
  },
  version_code: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '版本代码'
  },
  download_url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '下载URL'
  },
  file_size: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '文件大小'
  },
  update_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'optional',
    comment: '更新类型：optional, force'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '更新说明'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：0-禁用，1-启用'
  }
}, {
  tableName: 'app_versions',
  comment: 'App版本表',
  indexes: [
    { fields: ['platform'] },
    { fields: ['version_code'] },
    { fields: ['status'] }
  ]
});

module.exports = AppVersion;
