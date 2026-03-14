const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 会员模型
const Member = sequelize.define('member', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  phone: {
    type: DataTypes.STRING(11),
    allowNull: false,
    unique: true,
    comment: '手机号（唯一标识）'
  },
  license_plate: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '车牌号'
  },
  car_model: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '车型'
  },
  birthday: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '生日'
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '备注'
  },
  level: {
    type: DataTypes.ENUM('普通会员', '储值会员'),
    defaultValue: '普通会员',
    comment: '会员等级'
  },
  discount: {
    type: DataTypes.DECIMAL(2, 2),
    defaultValue: 1.00,
    comment: '折扣率'
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '账户余额'
  },
  total_recharge: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '累计充值金额'
  },
  status: {
    type: DataTypes.ENUM('正常', '已注销'),
    defaultValue: '正常',
    comment: '会员状态'
  }
}, {
  tableName: 'member',
  comment: '会员信息表',
  indexes: [
    { fields: ['phone'] },
    { fields: ['license_plate'] },
    { fields: ['status'] }
  ]
});

module.exports = Member;
