const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SystemConfig = sequelize.define('SystemConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '配置键'
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '配置值'
  },
  description: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '配置描述'
  },
  type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'string',
    comment: '类型：string, number, boolean, json'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：0-禁用，1-启用'
  }
}, {
  tableName: 'system_configs',
  comment: '系统配置表',
  indexes: [
    { fields: ['key'] },
    { fields: ['status'] }
  ]
});

module.exports = SystemConfig;
