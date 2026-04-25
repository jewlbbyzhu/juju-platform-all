const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ScanRecord = sequelize.define('ScanRecord', {
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
  code: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '扫码内容'
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '扫码类型：qrcode, barcode等'
  },
  result: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '扫码结果'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：0-无效，1-有效'
  },
  scanned_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '扫码时间'
  }
}, {
  tableName: 'scan_records',
  comment: '扫码记录表',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['scanned_at'] },
    { fields: ['user_id', 'scanned_at'] }
  ]
});

module.exports = ScanRecord;
