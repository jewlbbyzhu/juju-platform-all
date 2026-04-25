const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Banner = sequelize.define('Banner', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(200), allowNull: false, comment: '标题' },
  image_url: { type: DataTypes.STRING(500), allowNull: false, comment: '图片URL' },
  link_url: { type: DataTypes.STRING(500), allowNull: true, comment: '跳转链接' },
  sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, comment: '排序' },
  status: { type: DataTypes.ENUM('active', 'inactive'), allowNull: false, defaultValue: 'inactive', comment: '状态' }
}, {
  tableName: 'banners',
  comment: '内容管理-横幅',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['sort_order'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Banner;
