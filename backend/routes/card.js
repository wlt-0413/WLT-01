const express = require('express');
const router = express.Router();
const { CardPackage, MemberCard, Member } = require('../models');

/**
 * 获取所有套餐列表
 */
router.get('/packages', async (req, res) => {
  try {
    const packages = await CardPackage.findAll({
      where: { status: '启用' },
      order: [['created_at', 'DESC']]
    });
    
    res.json({ success: true, data: packages });
  } catch (error) {
    console.error('获取套餐列表失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 创建套餐
 */
router.post('/packages', async (req, res) => {
  try {
    const { package_name, service_type, total_times, price, valid_days } = req.body;
    
    const pkg = await CardPackage.create({
      package_name,
      service_type,
      total_times,
      price,
      valid_days: valid_days || 90,
      status: '启用'
    });
    
    res.json({ success: true, data: pkg, message: '套餐创建成功' });
  } catch (error) {
    console.error('创建套餐失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 更新套餐
 */
router.put('/packages/:id', async (req, res) => {
  try {
    const pkg = await CardPackage.findByPk(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: '套餐不存在' });
    }
    
    await pkg.update(req.body);
    res.json({ success: true, data: pkg, message: '套餐更新成功' });
  } catch (error) {
    console.error('更新套餐失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 删除套餐
 */
router.delete('/packages/:id', async (req, res) => {
  try {
    const pkg = await CardPackage.findByPk(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: '套餐不存在' });
    }
    
    await pkg.update({ status: '停用' });
    res.json({ success: true, message: '套餐已停用' });
  } catch (error) {
    console.error('删除套餐失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 为会员绑定次卡
 */
router.post('/bind', async (req, res) => {
  try {
    const { member_id, package_id } = req.body;
    
    const member = await Member.findByPk(member_id);
    if (!member) {
      return res.status(404).json({ success: false, message: '会员不存在' });
    }
    
    const pkg = await CardPackage.findByPk(package_id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: '套餐不存在' });
    }
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + pkg.valid_days);
    
    const memberCard = await MemberCard.create({
      member_id,
      package_id,
      package_name: pkg.package_name,
      service_type: pkg.service_type,
      total_times: pkg.total_times,
      remaining_times: pkg.total_times,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      status: '使用中'
    });
    
    res.json({ 
      success: true, 
      data: memberCard,
      message: `次卡绑定成功！有效期至${endDate.toISOString().split('T')[0]}`
    });
  } catch (error) {
    console.error('绑定次卡失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 获取会员次卡列表
 */
router.get('/member/:member_id', async (req, res) => {
  try {
    const cards = await MemberCard.findAll({
      where: { member_id: req.params.member_id },
      order: [['end_date', 'ASC']]
    });
    
    res.json({ success: true, data: cards });
  } catch (error) {
    console.error('获取次卡列表失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 扣减次卡次数
 */
router.post('/deduct', async (req, res) => {
  try {
    const { member_card_id } = req.body;
    
    const memberCard = await MemberCard.findByPk(member_card_id);
    if (!memberCard) {
      return res.status(404).json({ success: false, message: '次卡不存在' });
    }
    
    if (memberCard.remaining_times <= 0) {
      return res.status(400).json({ success: false, message: '次卡次数已用完' });
    }
    
    // 检查是否过期
    const today = new Date().toISOString().split('T')[0];
    if (today > memberCard.end_date) {
      await memberCard.update({ status: '已过期' });
      return res.status(400).json({ success: false, message: '次卡已过期' });
    }
    
    await memberCard.update({
      remaining_times: memberCard.remaining_times - 1
    });
    
    // 如果次数用完，更新状态
    if (memberCard.remaining_times - 1 === 0) {
      await memberCard.update({ status: '已用完' });
    }
    
    res.json({ success: true, message: '扣次成功', remaining_times: memberCard.remaining_times - 1 });
  } catch (error) {
    console.error('扣减次数失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 获取即将到期的次卡（7 天内）
 */
router.get('/expiring/soon', async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);
    
    const cards = await MemberCard.findAll({
      where: {
        status: '使用中',
        end_date: {
          [require('sequelize').Op.between]: [
            today.toISOString().split('T')[0],
            sevenDaysLater.toISOString().split('T')[0]
          ]
        }
      },
      include: [{
        association: 'member',
        attributes: ['id', 'phone', 'license_plate']
      }]
    });
    
    res.json({ success: true, data: cards });
  } catch (error) {
    console.error('获取即将到期次卡失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
