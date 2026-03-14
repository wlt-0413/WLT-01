/**
 * 日志记录中间件
 */

const fs = require('fs');
const path = require('path');

// 确保日志目录存在
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 生成日志文件名
const getLogFileName = () => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  return path.join(logDir, `${dateStr}.log`);
};

// 写入日志
const writeLog = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = JSON.stringify({
    timestamp,
    level,
    message,
    ...meta
  }) + '\n';
  
  const logFile = getLogFileName();
  fs.appendFileSync(logFile, logEntry);
};

// 请求日志中间件
exports.requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // 响应结束后记录日志
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    };
    
    if (res.statusCode >= 500) {
      writeLog('ERROR', '服务器错误', logData);
    } else if (res.statusCode >= 400) {
      writeLog('WARN', '客户端错误', logData);
    } else {
      writeLog('INFO', '请求成功', logData);
    }
  });
  
  next();
};

// 工具函数
exports.logger = {
  info: (message, meta) => writeLog('INFO', message, meta),
  warn: (message, meta) => writeLog('WARN', message, meta),
  error: (message, meta) => writeLog('ERROR', message, meta),
  debug: (message, meta) => writeLog('DEBUG', message, meta)
};
