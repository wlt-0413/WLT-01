/**
 * 错误处理中间件
 */

// 404 错误处理
exports.notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `接口不存在：${req.method} ${req.path}`,
    timestamp: new Date().toISOString()
  });
};

// 全局错误处理
exports.errorHandler = (err, req, res, next) => {
  console.error('错误详情:', err);

  // Sequelize 验证错误
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      success: false,
      message: '数据验证失败',
      errors,
      timestamp: new Date().toISOString()
    });
  }

  // Sequelize 唯一约束错误
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: '数据已存在',
      field: err.errors[0]?.path,
      timestamp: new Date().toISOString()
    });
  }

  // Sequelize 外键约束错误
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: '关联数据不存在',
      timestamp: new Date().toISOString()
    });
  }

  // 默认错误
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误',
    timestamp: new Date().toISOString()
  });
};
