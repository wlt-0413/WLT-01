const express = require('express');
const router = express.Router();
const { Member, RechargeRecord, FinanceRecord } = require('../models');
const { Op } = require('sequelize');

/**
 * 会员充值
 */
router.post('/', async (req, res) => {
  try {
    const { member_id, recharge_amount, bonus_amount = 0, payment_method, remark } = req.body;
    
    const member = await Member.findByPk(member_id);
    if (!member) {
      return res.status(404).json({ success: false, message: '会员不存在' });
    }
    
    const total_amount = parseFloat(recharge_amount) + parseFloat(bonus_amount);
    
    // 创建充值记录
    const record = await RechargeRecord.create({
      member_id,
      recharge_amount,
      bonus_amount,
      total_amount,
      payment_method,
      remark
    });
    
    // 更新会员余额和等级
    let newLevel = member.level;
    let newDiscount = member.discount;
    
    // 自动升级逻辑
    if (member.total_recharge + recharge_amount >= 500) {
      newLevel = '储值会员';
      newDiscount = 0.90; // 充 500 升 9 折
    } else if (member.total_recharge + recharge_amount >= 300) {
      newLevel = '储值会员';
      newDiscount = 0.95; // 充 300 升 9.5 折
    }
    
    await member.update({
      balance: parseFloat(member.balance) + total_amount,
      total_recharge: parseFloat(member.total_recharge) + parseFloat(recharge_amount),
      level: newLevel,
      discount: newDiscount
    });
    
    // 创建财务流水
    await FinanceRecord.create({
      record_type: '收入',
      category: '储值收款',
      amount: recharge_amount,
      payment_method,
      member_id,
      remark: `会员充值${recharge_amount}元，赠送${bonus_amount}元`
    });
    
    res.json({ 
      success: true, 
      data: record,
      message: `充值成功！实充${recharge_amount}元，赠送${bonus_amount}元，共计${total_amount}元`
    });
  } catch (error) {
    console.error('会员充值失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 获取充值记录列表
 */
router.get('/records/:member_id', async (req, res) => {
  try {
    const records = await RechargeRecord.findAll({
      where: { member_id: req.params.member_id },
      order: [['created_at', 'DESC']]
    });
    
    res.json({ success: true, data: records });
  } catch (error) {
    console.error('获取充值记录失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 余额退款（高危操作）
 */
router.post('/refund', async (req, res) => {
  try {
    const { member_id, amount, payment_method, remark } = req.body;
    
    const member = await Member.findByPk(member_id);
    if (!member) {
      return res.status(404).json({ success: false, message: '会员不存在' });
    }
    
    if (parseFloat(member.balance) < parseFloat(amount)) {
      return res.status(400).json({ success: false, message: '余额不足' });
    }
    
    // 更新会员余额
    await member.update({
      balance: parseFloat(member.balance) - parseFloat(amount)
    });
    
    // 创建财务流水
    await FinanceRecord.create({
      record_type: '支出',
      category: '会员退款',
      amount,
      payment_method,
      member_id,
      remark: remark || '余额退款'
    });
    
    res.json({ success: true, message: '退款成功' });
  } catch (error) {
    console.error('余额退款失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
