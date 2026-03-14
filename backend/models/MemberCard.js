const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 会员次卡模型
const MemberCard = sequelize.define('member_card', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  member_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '会员 ID'
  },
  package_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '套餐 ID'
  },
  package_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '套餐名称'
  },
  service_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '服务类型'
  },
  total_times: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '总次数'
  },
  remaining_times: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '剩余次数'
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '开始日期'
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '到期日期'
  },
  status: {
    type: DataTypes.ENUM('使用中', '已用完', '已过期'),
    defaultValue: '使用中',
    comment: '次卡状态'
  }
}, {
  tableName: 'member_card',
  comment: '会员次卡表',
  indexes: [
    { fields: ['member_id'] },
    { fields: ['status'] },
    { fields: ['end_date'] }
  ]
});

module.exports = MemberCard;
