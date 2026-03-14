const express = require('express');
const router = express.Router();
const { FinanceRecord, Order, Member } = require('../models');
const { Op } = require('sequelize');

/**
 * 获取财务流水列表
 */
router.get('/records', async (req, res) => {
  try {
    const { record_type, category, start_date, end_date } = req.query;
    
    const where = {};
    if (record_type) {
      where.record_type = record_type;
    }
    if (category) {
      where.category = category;
    }
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [start_date, end_date]
      };
    }
    
    const records = await FinanceRecord.findAll({
      where,
      include: [{
        association: 'member',
        attributes: ['id', 'phone', 'license_plate']
      }],
      order: [['created_at', 'DESC']]
    });
    
    res.json({ success: true, data: records });
  } catch (error) {
    console.error('获取财务流水失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 手动录入支出
 */
router.post('/expense', async (req, res) => {
  try {
    const { category, amount, payment_method, remark } = req.body;
    
    const record = await FinanceRecord.create({
      record_type: '支出',
      category,
      amount,
      payment_method,
      remark
    });
    
    res.json({ success: true, data: record, message: '支出记录成功' });
  } catch (error) {
    console.error('录入支出失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 获取日/月营收报表
 */
router.get('/report', async (req, res) => {
  try {
    const { type, date } = req.query; // type: 'daily' | 'monthly'
    
    let startDate, endDate;
    const targetDate = date ? new Date(date) : new Date();
    
    if (type === 'daily') {
      startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      endDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);
    } else if (type === 'monthly') {
      startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1);
    } else {
      return res.status(400).json({ success: false, message: '请选择报表类型（daily/monthly）' });
    }
    
    // 查询该时间段内的所有订单
    const orders = await Order.findAll({
      where: {
        created_at: {
          [Op.gte]: startDate,
          [Op.lt]: endDate
        }
      }
    });
    
    // 计算各项统计数据
    let total_revenue = 0;
    let recharge_revenue = 0;
    let service_revenue = 0;
    const service_stats = {};
    
    orders.forEach(order => {
      total_revenue += parseFloat(order.actual_amount);
      service_revenue += parseFloat(order.actual_amount);
      
      // 按服务类型统计
      order.service_items.forEach(item => {
        if (!service_stats[item.service_name]) {
          service_stats[item.service_name] = 0;
        }
        service_stats[item.service_name] += parseFloat(item.price) * item.quantity;
      });
    });
    
    // 查询该时间段内的充值记录
    const rechargeRecords = await FinanceRecord.findAll({
      where: {
        category: '储值收款',
        created_at: {
          [Op.gte]: startDate,
          [Op.lt]: endDate
        }
      }
    });
    
    rechargeRecords.forEach(record => {
      recharge_revenue += parseFloat(record.amount);
    });
    
    total_revenue += recharge_revenue;
    
    // 查询支出
    const expenses = await FinanceRecord.findAll({
      where: {
        record_type: '支出',
        created_at: {
          [Op.gte]: startDate,
          [Op.lt]: endDate
        }
      }
    });
    
    let total_expense = 0;
    expenses.forEach(expense => {
      total_expense += parseFloat(expense.amount);
    });
    
    const report = {
      period: type === 'daily' ? '日报' : '月报',
      date: type === 'daily' 
        ? startDate.toISOString().split('T')[0]
        : `${startDate.getFullYear()}年${startDate.getMonth() + 1}月`,
      total_revenue: total_revenue.toFixed(2),
      recharge_revenue: recharge_revenue.toFixed(2),
      service_revenue: service_revenue.toFixed(2),
      total_expense: total_expense.toFixed(2),
      net_profit: (total_revenue - total_expense).toFixed(2),
      service_breakdown: service_stats,
      order_count: orders.length
    };
    
    res.json({ success: true, data: report });
  } catch (error) {
    console.error('生成报表失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 会员消费排行
 */
router.get('/member/ranking', async (req, res) => {
  try {
    const { month } = req.query;
    
    const startDate = new Date(month);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
    
    // 查询该月份的所有订单
    const orders = await Order.findAll({
      where: {
        created_at: {
          [Op.gte]: startDate,
          [Op.lt]: endDate
        }
      },
      include: [{
        association: 'member',
        attributes: ['id', 'phone', 'license_plate']
      }]
    });
    
    // 按会员汇总消费金额
    const member_stats = {};
    orders.forEach(order => {
      const phone = order.member_phone;
      if (!member_stats[phone]) {
        member_stats[phone] = {
          phone,
          license_plate: order.license_plate,
          total_amount: 0,
          order_count: 0
        };
      }
      member_stats[phone].total_amount += parseFloat(order.actual_amount);
      member_stats[phone].order_count++;
    });
    
    // 转换为数组并排序
    const ranking = Object.values(member_stats)
      .sort((a, b) => b.total_amount - a.total_amount)
      .slice(0, 10); // 取前 10 名
    
    res.json({ success: true, data: ranking });
  } catch (error) {
    console.error('获取消费排行失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 每日对账
 */
router.post('/reconcile', async (req, res) => {
  try {
    const { date, actual_cash, actual_wechat, actual_alipay } = req.body;
    
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    
    // 查询该日期的所有收入记录
    const records = await FinanceRecord.findAll({
      where: {
        record_type: '收入',
        created_at: {
          [Op.gte]: startDate,
          [Op.lt]: endDate
        }
      }
    });
    
    // 按支付方式统计系统收款金额
    let system_cash = 0;
    let system_wechat = 0;
    let system_alipay = 0;
    
    records.forEach(record => {
      const amount = parseFloat(record.amount);
      if (record.payment_method === '现金') {
        system_cash += amount;
      } else if (record.payment_method === '微信') {
        system_wechat += amount;
      } else if (record.payment_method === '支付宝') {
        system_alipay += amount;
      }
    });
    
    // 对比实际收款
    const cash_diff = (actual_cash || 0) - system_cash;
    const wechat_diff = (actual_wechat || 0) - system_wechat;
    const alipay_diff = (actual_alipay || 0) - system_alipay;
    const total_diff = cash_diff + wechat_diff + alipay_diff;
    
    const result = {
      date,
      system: {
        cash: system_cash.toFixed(2),
        wechat: system_wechat.toFixed(2),
        alipay: system_alipay.toFixed(2),
        total: (system_cash + system_wechat + system_alipay).toFixed(2)
      },
      actual: {
        cash: (actual_cash || 0).toFixed(2),
        wechat: (actual_wechat || 0).toFixed(2),
        alipay: (actual_alipay || 0).toFixed(2),
        total: ((actual_cash || 0) + (actual_wechat || 0) + (actual_alipay || 0)).toFixed(2)
      },
      difference: {
        cash: cash_diff.toFixed(2),
        wechat: wechat_diff.toFixed(2),
        alipay: alipay_diff.toFixed(2),
        total: total_diff.toFixed(2)
      },
      is_matched: Math.abs(total_diff) < 0.01
    };
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('对账失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
