const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// 导入数据库配置
const sequelize = require('./config/database');

// 导入中间件
const { requestLogger } = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// 导入路由
const memberRoutes = require('./routes/member');
const rechargeRoutes = require('./routes/recharge');
const cardRoutes = require('./routes/card');
const orderRoutes = require('./routes/order');
const financeRoutes = require('./routes/finance');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3000;

// 增强的 CORS 配置
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 请求体解析
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 日志记录
app.use(requestLogger);

// API 版本控制前缀
app.use('/api/v1/members', memberRoutes);
app.use('/api/v1/recharge', rechargeRoutes);
app.use('/api/v1/cards', cardRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/settings', settingsRoutes);

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '系统运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: '洗车店会员管理系统 API',
    version: '1.0.0',
    docs: '/api/health'
  });
});

// 404 处理
app.use(notFound);

// 全局错误处理
app.use(errorHandler);

// 同步数据库并启动服务器
sequelize.sync()
  .then(() => {
    console.log('✅ 数据库同步成功！');
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📊 环境：${process.env.NODE_ENV || 'development'}`);
    
    app.listen(PORT, () => {
      console.log(`⏰ 启动时间：${new Date().toLocaleString('zh-CN')}`);
    });
  })
  .catch((err) => {
    console.error('❌ 数据库同步失败:', err);
    process.exit(1);
  });
