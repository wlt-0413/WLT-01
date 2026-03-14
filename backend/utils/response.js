/**
 * 统一响应格式化工具
 */

// 成功响应
exports.success = (res, data = null, message = '操作成功') => {
  return res.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  });
};

// 失败响应
exports.error = (res, message = '操作失败', statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

// 分页响应
exports.paginated = (res, data, total, page = 1, pageSize = 10) => {
  return res.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    },
    timestamp: new Date().toISOString()
  });
};
