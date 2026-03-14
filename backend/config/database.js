const { Sequelize } = require('sequelize');
require('dotenv').config();

// 创建数据库连接
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    timezone: '+08:00', // 东八区时间
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 20,          // 最大连接数
      min: 5,           // 最小连接数
      acquire: 60000,   // 获取连接超时时间（毫秒）
      idle: 30000,      // 空闲连接最大存活时间
      evict: 10000      // 检查空闲连接的时间间隔
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    dialectOptions: {
      connectTimeout: 60000,
      multipleStatements: true
    }
  }
);

// 测试连接
sequelize.authenticate()
  .then(() => {
    console.log('MySQL 数据库连接成功！');
  })
  .catch((err) => {
    console.error('无法连接 MySQL 数据库:', err);
  });

module.exports = sequelize;
