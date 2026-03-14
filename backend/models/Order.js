const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 订单模型
const Order = sequelize.define('order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_no: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
    comment: '订单号'
  },
  member_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '会员 ID'
  },
  member_phone: {
    type: DataTypes.STRING(11),
    allowNull: false,
    comment: '会员手机号'
  },
  license_plate: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '车牌号'
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '订单总金额'
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '优惠金额'
  },
  actual_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '实付金额'
  },
  payment_method: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '支付方式（支持混合支付）'
  },
  service_items: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '服务项目明细'
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
  },
  is_printed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否打印小票'
  }
}, {
  tableName: 'order',
  comment: '消费订单表',
  indexes: [
    { fields: ['order_no'] },
    { fields: ['member_id'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Order;
