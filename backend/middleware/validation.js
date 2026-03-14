/**
 * 请求验证中间件
 */

const { validationResult } = require('express-validator');

// 验证请求结果
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '参数验证失败',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// 验证手机号
exports.validatePhone = (value) => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(value)) {
    throw new Error('请输入正确的手机号');
  }
  return true;
};

// 验证金额
exports.validateAmount = (value) => {
  const amount = parseFloat(value);
  if (isNaN(amount) || amount <= 0) {
    throw new Error('金额必须大于 0');
  }
  if (amount > 1000000) {
    throw new Error('金额过大');
  }
  return true;
};
