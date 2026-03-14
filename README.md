# 洗车店会员管理系统 - 安装部署指南

## 📋 系统简介

这是一个专为单人小型洗车店设计的会员管理系统，包含以下核心功能：
- ✅ 会员管理（新增、编辑、注销、等级）
- ✅ 储值管理（充值、赠送、自动升级）
- ✅ 次卡套餐（绑定、扣次、有效期管理）
- ✅ 消费开单（服务选择、折扣计算、混合支付）
- ✅ 财务管理（收支流水、营收报表、每日对账）
- ✅ 基础设置（服务项目、套餐规则）

## 🔧 环境要求

### 必需软件
1. **Node.js** v16+ （推荐 v18+）
   - 下载地址：https://nodejs.org/
   
2. **MySQL** v5.7+ 或 v8.0+
   - 下载地址：https://dev.mysql.com/downloads/mysql/

### 推荐配置
- 操作系统：Windows 7 及以上
- 内存：4GB 以上
- 硬盘空间：1GB 可用空间

---

## 📦 安装步骤

### 第一步：安装 MySQL 数据库

1. 下载并安装 MySQL（如果已安装可跳过）

2. 登录 MySQL：
```bash
mysql -u root -p
```

3. 执行数据库初始化脚本：
```bash
# 在 MySQL 命令行中执行
source d:/成就/会员管理系统/backend/database/init.sql
```

或者使用 Navicat、MySQL Workbench 等工具打开并执行 `backend/database/init.sql` 文件

### 第二步：配置后端

1. 进入后端目录：
```bash
cd d:/成就/会员管理系统/backend
```

2. 安装依赖：
```bash
npm install
```

3. 修改配置文件 `.env`（如需要）：
```env
# MySQL 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的 MySQL 密码
DB_NAME=car_wash_system
```

### 第三步：配置前端

1. 进入前端目录：
```bash
cd d:/成就/会员管理系统/frontend
```

2. 安装依赖：
```bash
npm install
```

---

## 🚀 启动系统

### 方式一：分别启动（推荐开发使用）

#### 1. 启动后端服务器

打开第一个命令行窗口：
```bash
cd d:/成就/会员管理系统/backend
npm start
```

看到以下信息表示成功：
```
MySQL 数据库连接成功！
数据库同步成功！
服务器运行在 http://localhost:3000
```

#### 2. 启动前端应用

打开第二个命令行窗口：
```bash
cd d:/成就/会员管理系统/frontend
npm run dev
```

看到以下信息表示成功：
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

#### 3. 访问系统

打开浏览器访问：**http://localhost:5173/**

---

### 方式二：生产环境部署

#### 1. 构建前端
```bash
cd d:/成就/会员管理系统/frontend
npm run build
```

构建完成后会生成 `dist` 目录

#### 2. 配置 Nginx（可选）

将 `dist` 目录部署到 Nginx，配置反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 3. 启动后端（生产模式）
```bash
cd d:/成就/会员管理系统/backend
npm start
```

建议使用 PM2 进行进程管理：
```bash
npm install -g pm2
pm2 start backend/index.js --name car-wash-api
pm2 save
pm2 startup
```

---

## 🎯 快速使用指南

### 1️⃣ 新增第一个会员

1. 点击左侧菜单「会员管理」
2. 点击「新增会员」按钮
3. 填写会员信息（手机号、车牌为必填）
4. 点击「保存」

### 2️⃣ 为会员充值

1. 点击左侧菜单「储值管理」
2. 输入会员手机号查询
3. 选择充值金额（200/300/500 元）
4. 选择支付方式
5. 点击「确认充值」

💡 充值优惠说明：
- 充 200 元送 20 元
- 充 300 元升 9.5 折会员，送 50 元
- 充 500 元升 9 折会员，送 80 元

### 3️⃣ 消费开单

1. 点击左侧菜单「消费开单」
2. 输入会员手机号查询
3. 勾选服务项目（普洗/精洗/内饰清洁）
4. 选择支付方式
5. 点击「确认收款」

系统会自动根据会员等级计算折扣！

### 4️⃣ 查看财务报表

1. 点击左侧菜单「财务管理」
2. 查看今日营收数据
3. 筛选日期范围查看历史报表
4. 支持每日对账功能

---

## ⚙️ 系统配置说明

### 修改服务项目

1. 点击「基础设置」
2. 可以添加/编辑/删除服务项目
3. 修改服务价格

### 修改充值规则

编辑 `backend/routes/recharge.js` 中的充值规则：

```javascript
// 自动升级逻辑
if (member.total_recharge + recharge_amount >= 500) {
  newLevel = '储值会员';
  newDiscount = 0.90; // 充 500 升 9 折
} else if (member.total_recharge + recharge_amount >= 300) {
  newLevel = '储值会员';
  newDiscount = 0.95; // 充 300 升 9.5 折
}
```

### 修改赠送规则

编辑 `backend/.env` 文件，或在前端页面中添加自定义逻辑。

---

## 🛠️ 常见问题解决

### Q1: 后端启动失败，提示"无法连接 MySQL 数据库"

**解决方案：**
1. 检查 MySQL 服务是否启动
2. 确认 `.env` 文件中的数据库配置正确
3. 确认数据库 `car_wash_system` 已创建
4. 检查数据库用户名密码是否正确

### Q2: 前端页面空白或报错

**解决方案：**
1. 确认后端服务已启动（访问 http://localhost:3000/api/health）
2. 检查浏览器控制台错误信息
3. 清除浏览器缓存后重试
4. 确认前端代理配置正确（`vite.config.js`）

### Q3: 会员手机号重复提示

**解决方案：**
系统中手机号是唯一标识，每个手机号只能注册一次。如需修改会员手机号，请先注销该会员，再重新添加。

### Q4: 数据丢失怎么办？

**解决方案：**
1. 系统支持本地 + 云端双备份（待实现）
2. 定期导出 Excel 备份数据
3. 从 `backend/database/init.sql` 恢复数据库结构
4. 从备份文件恢复数据

---

## 📞 技术支持

如遇到问题，请检查：
1. Node.js 版本是否符合要求
2. MySQL 数据库是否正常连接
3. 端口 3000 和 5173 是否被占用
4. 查看命令行窗口的错误日志

---

## 📝 更新日志

### V1.0.0 (2026-03-04)
- ✅ 初始版本发布
- ✅ 会员管理功能
- ✅ 储值管理功能
- ✅ 次卡套餐功能
- ✅ 消费开单功能
- ✅ 财务管理功能
- ✅ 基础设置功能

---

## 📄 许可证

本系统仅供学习交流使用，请勿用于商业用途。
