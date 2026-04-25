const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TicketType = sequelize.define('TicketType', {
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
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '票型名称'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '票型描述'
  },
  type: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 1,
    comment: '票型类型：1-普通,2-早鸟,3-男性,4-女性,5-男性早鸟,6-女性早鸟'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '价格'
  },
  original_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '原价'
  },
  available_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '可用数量'
  },
  sold_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '已售数量'
  },
  max_per_user: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '每人限购数量，0表示不限'
  },
  sale_start_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '开售时间'
  },
  sale_end_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '停售时间'
  },
  early_bird_deadline: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '早鸟票截止时间'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态：0-下架，1-上架'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '排序'
  }
}, {
  tableName: 'ticket_types',
  comment: '票型表',
  indexes: [
    { fields: ['party_id'] },
    { fields: ['status'] },
    { fields: ['sort_order'] },
    { fields: ['type'] }
  ]
});

module.exports = TicketType;
