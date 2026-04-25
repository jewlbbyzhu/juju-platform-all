const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InviteRecord = sequelize.define('InviteRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  inviter_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '邀请人ID'
  },
  invitee_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '被邀请人ID'
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '邀请码'
  },
  status: {
    type: DataTypes.ENUM('pending', 'used', 'expired'),
    allowNull: false,
    defaultValue: 'pending',
    comment: '状态'
  },
  reward_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: '奖励金额'
  },
  reward_status: {
    type: DataTypes.ENUM('pending', 'claimed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
    comment: '奖励状态'
  },
  used_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '使用时间'
  },
  expired_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '过期时间'
  }
}, {
  tableName: 'invite_records',
  comment: '邀请记录表',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['inviter_id'] },
    { fields: ['code'], unique: true },
    { fields: ['status'] }
  ]
});

module.exports = InviteRecord;
