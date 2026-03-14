const express = require('express');
const router = express.Router();
const { Order, Member, MemberCard, FinanceRecord } = require('../models');
const { Op } = require('sequelize');

// 生成订单号
function generateOrderNo() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000);
  return `${year}${month}${day}${hours}${minutes}${seconds}${random}`;
}

/**
 * 创建订单（消费开单）
 */
router.post('/', async (req, res) => {
  try {
    const { 
      member_id, 
      phone,
      service_items,
      original_amount,
      discount_amount,
      actual_amount,
      payment_method,
      status,
      remark
    } = req.body;
    
    const member = await Member.findByPk(member_id);
    if (!member) {
      return res.status(404).json({ success: false, message: '会员不存在' });
    }
    
    // 解析服务项（如果是字符串则拆分）
    let servicesArray = service_items;
    if (typeof service_items === 'string') {
      servicesArray = service_items.split(',').map(name => ({
        service_name: name.trim(),
        price: 0,  // 价格从实际金额计算
        quantity: 1
      }));
    }
    
    // 创建订单
    const order = await Order.create({
      order_no: generateOrderNo(),
      member_id,
      member_phone: member.phone,
      license_plate: member.license_plate,
      total_amount: original_amount || 0,
      discount_amount: discount_amount || 0,
      actual_amount: actual_amount || 0,
      payment_method: Array.isArray(payment_method) ? payment_method.join(',') : payment_method,
      service_items: servicesArray,
      status,
      remark
    });
    
    // 如果使用了余额支付，更新会员余额
    const paymentMethods = Array.isArray(payment_method) ? payment_method : [payment_method];
    const useBalance = paymentMethods.includes('余额');
    
    if (useBalance) {
      const newBalance = parseFloat(member.balance) - parseFloat(actual_amount || 0);
      if (newBalance < 0) {
        throw new Error('会员余额不足，请充值');
      }
      
      await member.update({
        balance: newBalance
      });
      
      console.log(`✅ 会员 ${member.phone} 消费¥${actual_amount}，余额从¥${member.balance}更新为¥${newBalance}`);
    }
    
    // 创建财务流水
    await FinanceRecord.create({
      record_type: '收入',
      category: '消费收款',
      amount: actual_amount || 0,
      payment_method: Array.isArray(payment_method) ? payment_method.join(',') : payment_method,
      member_id,
      order_id: order.id,
      remark: `订单消费：${order.order_no}`
    });
    
    res.json({ 
      success: true, 
      data: order,
      message: '开单成功'
    });
  } catch (error) {
    console.error('❌ 创建订单失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 获取订单列表
 */
router.get('/', async (req, res) => {
  try {
    const { phone, start_date, end_date } = req.query;
    
    const where = {};
    if (phone) {
      const member = await Member.findOne({ where: { phone: { [Op.like]: `%${phone}%` } } });
      if (member) {
        where.member_id = member.id;
      } else {
        return res.json({ success: true, data: [] });
      }
    }
    
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [start_date, end_date]
      };
    }
    
    const orders = await Order.findAll({
      where,
      include: [{
        association: 'member',
        attributes: ['id', 'phone', 'license_plate']
      }],
      order: [['created_at', 'DESC']]
    });
    
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 获取订单详情
 */
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{
        association: 'member',
        attributes: ['id', 'phone', 'license_plate', 'car_model']
      }]
    });
    
    if (!order) {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 更新打印状态
 */
router.post('/:id/print', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }
    
    await order.update({ is_printed: true });
    res.json({ success: true, message: '打印状态已更新' });
  } catch (error) {
    console.error('更新打印状态失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
