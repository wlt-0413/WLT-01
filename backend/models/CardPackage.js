const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 次卡/套餐模型
const CardPackage = sequelize.define('card_package', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  package_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '套餐名称'
  },
  service_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '服务类型（普洗/精洗等）'
  },
  total_times: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '总次数'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '套餐价格'
  },
  valid_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 36500,
    comment: '有效期（天）'
  },
  status: {
    type: DataTypes.ENUM('启用', '停用'),
    defaultValue: '启用',
    comment: '套餐状态'
  }
}, {
  tableName: 'card_package',
  comment: '次卡套餐表',
  indexes: [
    { fields: ['status'] }
  ]
});

module.exports = CardPackage;
