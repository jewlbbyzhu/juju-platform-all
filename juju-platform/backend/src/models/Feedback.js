const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Feedback = sequelize.define('Feedback', {
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
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '反馈类型'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '标题'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '描述'
  },
  priority: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '优先级：0-低，1-中，2-高'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '状态：0-待处理，1-处理中，2-已解决，3-已关闭'
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '图片列表'
  },
  contact: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '联系方式'
  },
  reply: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '回复内容'
  },
  replied_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '回复时间'
  },
  replied_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '回复人ID'
  }
}, {
  tableName: 'feedbacks',
  comment: '用户反馈表',
  timestamps: true,
  underscored: true
});

module.exports = Feedback;
