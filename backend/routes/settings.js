const express = require('express');
const router = express.Router();
const { ServiceItem, CardPackage } = require('../models');

/**
 * 获取所有服务项目
 */
router.get('/services', async (req, res) => {
  try {
    const services = await ServiceItem.findAll({
      order: [['created_at', 'DESC']]
    });
    
    // 如果没有任何服务，添加默认服务
    if (services.length === 0) {
      const defaultServices = [
        { service_name: '普洗', original_price: 20, description: '标准洗车服务' },
        { service_name: '精洗', original_price: 50, description: '精细洗车服务' },
        { service_name: '内饰清洁', original_price: 80, description: '车内深度清洁' }
      ];
      
      for (const svc of defaultServices) {
        await ServiceItem.create({
          ...svc,
          status: '启用'
        });
      }
      
      return res.json({ success: true, data: defaultServices, message: '已添加默认服务项目' });
    }
    
    res.json({ success: true, data: services });
  } catch (error) {
    console.error('获取服务项目失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 新增服务项目
 */
router.post('/services', async (req, res) => {
  try {
    const { service_name, original_price, description } = req.body;
    
    const service = await ServiceItem.create({
      service_name,
      original_price,
      description,
      status: '启用'
    });
    
    res.json({ success: true, data: service, message: '服务添加成功' });
  } catch (error) {
    console.error('新增服务失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 更新服务项目
 */
router.put('/services/:id', async (req, res) => {
  try {
    const service = await ServiceItem.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: '服务不存在' });
    }
    
    await service.update(req.body);
    res.json({ success: true, data: service, message: '服务更新成功' });
  } catch (error) {
    console.error('更新服务失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 删除服务项目（物理删除）
 */
router.delete('/services/:id', async (req, res) => {
  try {
    const service = await ServiceItem.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: '服务不存在' });
    }
    
    // 检查是否有关联订单
    const { Order } = require('../models');
    const { Op } = require('sequelize');
    const orderCount = await Order.count({
      where: {
        service_items: { [Op.substring]: service.service_name }
      }
    });
    
    if (orderCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `该服务已用于 ${orderCount} 个订单，无法删除` 
      });
    }
    
    // 方法 1: 使用 Sequelize 的 destroy 强制删除
    const deletedCount = await ServiceItem.destroy({
      where: { id: req.params.id },
      force: true  // 强制物理删除
    });
    
    if (deletedCount === 0) {
      throw new Error('删除失败，记录可能已被删除或不存在');
    }
    
    // 验证删除结果
    const checkService = await ServiceItem.findByPk(req.params.id);
    if (checkService) {
      throw new Error('删除操作已完成，但数据库中仍有记录，请刷新重试');
    }
    
    console.log(`✅ 服务已真正删除：ID=${req.params.id}, 名称=${service.service_name}`);
    res.json({ success: true, message: '服务已删除' });
  } catch (error) {
    console.error('❌ 删除服务失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 获取系统配置
 */
router.get('/config', async (req, res) => {
  try {
    // 这里可以扩展为从数据库读取配置
    const config = {
      recharge_rules: {
        preset_amounts: [200, 300, 500],
        bonus_rules: {
          200: 20,
          300: 50,
          500: 80
        },
        level_rules: {
          300: { level: '储值会员', discount: 0.95 },
          500: { level: '储值会员', discount: 0.90 }
        }
      },
      store_info: {
        name: 'XX 洗车店',
        phone: '',
        address: ''
      },
      backup_settings: {
        auto_backup: true,
        backup_time: '02:00'
      }
    };
    
    res.json({ success: true, data: config });
  } catch (error) {
    console.error('获取系统配置失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 更新系统配置
 */
router.post('/config', async (req, res) => {
  try {
    // 这里可以扩展到将配置保存到数据库
    const config = req.body;
    
    res.json({ 
      success: true, 
      message: '系统配置更新成功',
      data: config
    });
  } catch (error) {
    console.error('更新系统配置失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 数据导出（简化版）
 */
router.get('/export', async (req, res) => {
  try {
    const { type } = req.query; // members, orders, finance
    
    let data = [];
    let filename = '';
    
    if (type === 'members') {
      const { Member } = require('../models');
      data = await Member.findAll();
      filename = `members_${Date.now()}.csv`;
    } else if (type === 'orders') {
      const { Order } = require('../models');
      data = await Order.findAll({ order: [['created_at', 'DESC']] });
      filename = `orders_${Date.now()}.csv`;
    } else if (type === 'finance') {
      const { FinanceRecord } = require('../models');
      data = await FinanceRecord.findAll({ order: [['created_at', 'DESC']] });
      filename = `finance_${Date.now()}.csv`;
    }
    
    // 转换为 CSV 格式
    if (data.length > 0) {
      const headers = Object.keys(data[0].toJSON());
      const csv = [
        headers.join(','),
        ...data.map(row => 
          headers.map(field => {
            const value = row[field];
            return typeof value === 'string' ? `"${value}"` : value;
          }).join(',')
        )
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.send(csv);
    } else {
      res.json({ success: true, message: '暂无数据可导出' });
    }
  } catch (error) {
    console.error('数据导出失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
