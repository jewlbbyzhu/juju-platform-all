const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VipSubscription = sequelize.define('VipSubscription', {
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
  package_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '套餐ID'
  },
  status: {
    type: DataTypes.ENUM('active', 'cancelled', 'expired'),
    allowNull: false,
    defaultValue: 'active',
    comment: '状态'
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '开始日期'
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '结束日期'
  },
  auto_renewal: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '是否自动续费'
  },
  cancel_reason: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '取消原因'
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '取消时间'
  }
}, {
  tableName: 'vip_subscriptions',
  comment: 'VIP订阅表',
  timestamps: true,
  underscored: true
});

module.exports = VipSubscription;
