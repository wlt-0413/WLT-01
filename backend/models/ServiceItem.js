const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 服务项目模型
const ServiceItem = sequelize.define('service_item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  service_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '服务名称'
  },
  original_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '原价'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '服务描述'
  },
  status: {
    type: DataTypes.ENUM('启用', '停用'),
    defaultValue: '启用',
    comment: '服务状态'
  }
}, {
  tableName: 'service_item',
  comment: '服务项目表',
  indexes: [
    { fields: ['status'] }
  ]
});

module.exports = ServiceItem;
