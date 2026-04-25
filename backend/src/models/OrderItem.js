const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '订单ID'
  },
  ticket_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '票型ID'
  },
  ticket_type_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '票型名称'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '单价'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '数量'
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '小计'
  }
}, {
  tableName: 'order_items',
  comment: '订单项表',
  indexes: [
    { fields: ['order_id'] },
    { fields: ['ticket_type_id'] }
  ]
});

module.exports = OrderItem;
