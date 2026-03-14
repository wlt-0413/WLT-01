const express = require('express');
const router = express.Router();
const { Member, RechargeRecord } = require('../models');
const md5 = require('md5');

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
 * 获取会员列表
 */
router.get('/', async (req, res) => {
  try {
    const { phone, license_plate, status = '正常' } = req.query;
    
    const where = {};
    if (status) {
      where.status = status;
    }
    if (phone) {
      where.phone = { [require('sequelize').Op.like]: `%${phone}%` };
    }
    if (license_plate) {
      where.license_plate = { [require('sequelize').Op.like]: `%${license_plate}%` };
    }
    
    const members = await Member.findAll({
      where,
      order: [['created_at', 'DESC']]
    });
    
    res.json({ success: true, data: members });
  } catch (error) {
    console.error('获取会员列表失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 获取会员详情
 */
router.get('/:id', async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id, {
      include: [{
        association: 'rechargeRecords',
        order: [['created_at', 'DESC']],
        limit: 10
      }]
    });
    
    if (!member) {
      return res.status(404).json({ success: false, message: '会员不存在' });
    }
    
    res.json({ success: true, data: member });
  } catch (error) {
    console.error('获取会员详情失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 新增会员
 */
router.post('/', async (req, res) => {
  try {
    const { phone, license_plate, car_model, birthday, remark } = req.body;
    
    // 检查手机号是否已存在
    const existingMember = await Member.findOne({ where: { phone } });
    if (existingMember) {
      return res.status(400).json({ success: false, message: '该手机号已注册' });
    }
    
    const member = await Member.create({
      phone,
      license_plate,
      car_model,
      birthday,
      remark,
      level: '普通会员',
      discount: 1.00,
      balance: 0,
      total_recharge: 0,
      status: '正常'
    });
    
    res.json({ success: true, data: member, message: '会员添加成功' });
  } catch (error) {
    console.error('新增会员失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 编辑会员信息
 */
router.put('/:id', async (req, res) => {
  try {
    const { phone, license_plate, car_model, birthday, remark } = req.body;
    
    const member = await Member.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: '会员不存在' });
    }
    
    await member.update({
      license_plate,
      car_model,
      birthday,
      remark
    });
    
    res.json({ success: true, data: member, message: '信息修改成功' });
  } catch (error) {
    console.error('编辑会员信息失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 注销会员
 */
router.post('/:id/cancel', async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: '会员不存在' });
    }
    
    await member.update({ status: '已注销' });
    
    res.json({ success: true, message: '会员已注销' });
  } catch (error) {
    console.error('注销会员失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 恢复已注销会员
 */
router.post('/:id/restore', async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: '会员不存在' });
    }
    
    await member.update({ status: '正常' });
    
    res.json({ success: true, message: '会员已恢复' });
  } catch (error) {
    console.error('恢复会员失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
