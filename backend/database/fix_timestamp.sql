-- 修复订单表时间戳自动更新问题
-- 问题：updated_at 字段设置为 ON UPDATE CURRENT_TIMESTAMP
-- 影响：每次查询或系统重启时，时间可能会被意外更新

-- 修复方案：移除 updated_at 的自动更新功能

USE car_wash_system;

-- 备份当前订单数据
CREATE TABLE IF NOT EXISTS `order_backup` LIKE `order`;
INSERT INTO `order_backup` SELECT * FROM `order`;

-- 修改订单表，移除 updated_at 的自动更新
ALTER TABLE `order`
MODIFY COLUMN `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP;

-- 验证修改结果
SHOW CREATE TABLE `order`;

-- 如果确认无误，可以删除备份表
-- DROP TABLE IF EXISTS `order_backup`;

SELECT '订单表时间戳修复完成！' AS message;
SELECT '如果数据有问题，可以从 order_backup 表恢复' AS notice;
