-- 创建数据库
CREATE DATABASE IF NOT EXISTS car_wash_system 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

USE car_wash_system;

-- 会员信息表
CREATE TABLE IF NOT EXISTS `member` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `phone` VARCHAR(11) NOT NULL UNIQUE COMMENT '手机号（唯一标识）',
  `license_plate` VARCHAR(20) NOT NULL COMMENT '车牌号',
  `car_model` VARCHAR(50) COMMENT '车型',
  `birthday` DATE COMMENT '生日',
  `remark` TEXT COMMENT '备注',
  `level` ENUM('普通会员', '储值会员') DEFAULT '普通会员' COMMENT '会员等级',
  `discount` DECIMAL(3,2) DEFAULT 1.00 COMMENT '折扣率',
  `balance` DECIMAL(10,2) DEFAULT 0.00 COMMENT '账户余额',
  `total_recharge` DECIMAL(10,2) DEFAULT 0.00 COMMENT '累计充值金额',
  `status` ENUM('正常', '已注销') DEFAULT '正常' COMMENT '会员状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_phone` (`phone`),
  INDEX `idx_license_plate` (`license_plate`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员信息表';

-- 充值记录表
CREATE TABLE IF NOT EXISTS `recharge_record` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `member_id` INT NOT NULL COMMENT '会员 ID',
  `recharge_amount` DECIMAL(10,2) NOT NULL COMMENT '充值金额',
  `bonus_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '赠送金额',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '实际到账金额',
  `payment_method` ENUM('现金', '微信', '支付宝') NOT NULL COMMENT '支付方式',
  `operator` VARCHAR(50) DEFAULT '管理员' COMMENT '操作人',
  `remark` TEXT COMMENT '备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_member_id` (`member_id`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`member_id`) REFERENCES `member`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='充值记录表';

-- 次卡套餐表
CREATE TABLE IF NOT EXISTS `card_package` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `package_name` VARCHAR(50) NOT NULL COMMENT '套餐名称',
  `service_type` VARCHAR(20) NOT NULL COMMENT '服务类型',
  `total_times` INT NOT NULL COMMENT '总次数',
  `price` DECIMAL(10,2) NOT NULL COMMENT '套餐价格',
  `valid_days` INT DEFAULT 90 COMMENT '有效期（天）',
  `status` ENUM('启用', '停用') DEFAULT '启用' COMMENT '套餐状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='次卡套餐表';

-- 会员次卡表
CREATE TABLE IF NOT EXISTS `member_card` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `member_id` INT NOT NULL COMMENT '会员 ID',
  `package_id` INT NOT NULL COMMENT '套餐 ID',
  `package_name` VARCHAR(50) NOT NULL COMMENT '套餐名称',
  `service_type` VARCHAR(20) NOT NULL COMMENT '服务类型',
  `total_times` INT NOT NULL COMMENT '总次数',
  `remaining_times` INT NOT NULL COMMENT '剩余次数',
  `start_date` DATE NOT NULL COMMENT '开始日期',
  `end_date` DATE NOT NULL COMMENT '到期日期',
  `status` ENUM('使用中', '已用完', '已过期') DEFAULT '使用中' COMMENT '次卡状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_member_id` (`member_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_end_date` (`end_date`),
  FOREIGN KEY (`member_id`) REFERENCES `member`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`package_id`) REFERENCES `card_package`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员次卡表';

-- 服务项目表
CREATE TABLE IF NOT EXISTS `service_item` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `service_name` VARCHAR(50) NOT NULL COMMENT '服务名称',
  `original_price` DECIMAL(10,2) NOT NULL COMMENT '原价',
  `description` TEXT COMMENT '服务描述',
  `status` ENUM('启用', '停用') DEFAULT '启用' COMMENT '服务状态',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='服务项目表';

-- 消费订单表
CREATE TABLE IF NOT EXISTS `order` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_no` VARCHAR(30) NOT NULL UNIQUE COMMENT '订单号',
  `member_id` INT NOT NULL COMMENT '会员 ID',
  `member_phone` VARCHAR(11) NOT NULL COMMENT '会员手机号',
  `license_plate` VARCHAR(20) NOT NULL COMMENT '车牌号',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
  `discount_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '优惠金额',
  `actual_amount` DECIMAL(10,2) NOT NULL COMMENT '实付金额',
  `payment_method` JSON NOT NULL COMMENT '支付方式（支持混合支付）',
  `service_items` JSON NOT NULL COMMENT '服务项目明细',
  `operator` VARCHAR(50) DEFAULT '管理员' COMMENT '操作人',
  `remark` TEXT COMMENT '备注',
  `is_printed` BOOLEAN DEFAULT FALSE COMMENT '是否打印小票',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_order_no` (`order_no`),
  INDEX `idx_member_id` (`member_id`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`member_id`) REFERENCES `member`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消费订单表';

-- 财务流水表
CREATE TABLE IF NOT EXISTS `finance_record` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `record_type` ENUM('收入', '支出') NOT NULL COMMENT '记录类型',
  `category` ENUM('储值收款', '消费收款', '会员退款', '耗材采购', '其他支出') NOT NULL COMMENT '收支分类',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '金额',
  `payment_method` ENUM('现金', '微信', '支付宝', '余额') COMMENT '支付方式',
  `member_id` INT COMMENT '关联会员 ID',
  `order_id` INT COMMENT '关联订单 ID',
  `operator` VARCHAR(50) DEFAULT '管理员' COMMENT '操作人',
  `remark` TEXT COMMENT '备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_record_type` (`record_type`),
  INDEX `idx_category` (`category`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`member_id`) REFERENCES `member`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='财务流水表';

-- 插入默认服务项目
INSERT INTO `service_item` (`service_name`, `original_price`, `description`, `status`) VALUES
('普洗', 20.00, '标准洗车服务', '启用'),
('精洗', 50.00, '精细洗车服务', '启用'),
('内饰清洁', 80.00, '车内深度清洁', '启用');

-- 插入默认套餐
INSERT INTO `card_package` (`package_name`, `service_type`, `total_times`, `price`, `valid_days`, `status`) VALUES
('10 次普洗卡', '普洗', 10, 180.00, 90, '启用'),
('5 次精洗卡', '精洗', 5, 200.00, 90, '启用');
