const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 财务流水模型
const FinanceRecord = sequelize.define('finance_record', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  record_type: {
    type: DataTypes.ENUM('收入', '支出'),
    allowNull: false,
    comment: '记录类型'
  },
  category: {
    type: DataTypes.ENUM('储值收款', '消费收款', '会员退款', '耗材采购', '其他支出'),
    allowNull: false,
    comment: '收支分类'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '金额'
  },
  payment_method: {
    type: DataTypes.ENUM('现金', '微信', '支付宝', '余额'),
    allowNull: true,
    comment: '支付方式'
  },
  member_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '关联会员 ID（如有）'
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '关联订单 ID（如有）'
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
  tableName: 'finance_record',
  comment: '财务流水表',
  indexes: [
    { fields: ['record_type'] },
    { fields: ['category'] },
    { fields: ['created_at'] }
  ]
});

module.exports = FinanceRecord;
