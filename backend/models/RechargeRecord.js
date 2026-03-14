const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 充值记录模型
const RechargeRecord = sequelize.define('recharge_record', {
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
  recharge_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '充值金额'
  },
  bonus_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '赠送金额'
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '实际到账金额（充值 + 赠送）'
  },
  payment_method: {
    type: DataTypes.ENUM('现金', '微信', '支付宝'),
    allowNull: false,
    comment: '支付方式'
  },
  operator: {
    type: DataTypes.STRING(50),
    defaultValue: '管理员',
    comment: '操作人'
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '备注'
  }
}, {
  tableName: 'recharge_record',
  comment: '充值记录表',
  indexes: [
    { fields: ['member_id'] },
    { fields: ['created_at'] }
  ]
});

module.exports = RechargeRecord;
