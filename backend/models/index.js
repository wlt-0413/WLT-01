const sequelize = require('../config/database');
const Member = require('./Member');
const RechargeRecord = require('./RechargeRecord');
const CardPackage = require('./CardPackage');
const MemberCard = require('./MemberCard');
const ServiceItem = require('./ServiceItem');
const Order = require('./Order');
const FinanceRecord = require('./FinanceRecord');

// 定义模型关联

// 会员 - 充值记录（一对多）
Member.hasMany(RechargeRecord, { foreignKey: 'member_id', as: 'rechargeRecords' });
RechargeRecord.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

// 会员 - 次卡（一对多）
Member.hasMany(MemberCard, { foreignKey: 'member_id', as: 'memberCards' });
MemberCard.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

// 套餐 - 次卡（一对多）
CardPackage.hasMany(MemberCard, { foreignKey: 'package_id', as: 'memberCards' });
MemberCard.belongsTo(CardPackage, { foreignKey: 'package_id', as: 'cardPackage' });

// 会员 - 订单（一对多）
Member.hasMany(Order, { foreignKey: 'member_id', as: 'orders' });
Order.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

// 会员 - 财务记录（一对多）
Member.hasMany(FinanceRecord, { foreignKey: 'member_id', as: 'financeRecords' });
FinanceRecord.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

module.exports = {
  sequelize,
  Member,
  RechargeRecord,
  CardPackage,
  MemberCard,
  ServiceItem,
  Order,
  FinanceRecord
};
