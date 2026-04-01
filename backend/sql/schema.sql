-- ============================================================
-- AI广场 数据库建表脚本 (MySQL 9.3.0)
-- 创建时间：2026-03-28
-- ============================================================

CREATE DATABASE IF NOT EXISTS ai_square DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_square;

-- -----------------------------------------------------------
-- 1. 用户表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希',
    `avatar` VARCHAR(500) DEFAULT '/default-avatar.png' COMMENT '头像URL',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `department` VARCHAR(100) DEFAULT NULL COMMENT '部门',
    `job_role` ENUM('rd', 'pm_ops', 'qa') NOT NULL COMMENT '岗位方向',
    `role` ENUM('user', 'expert', 'admin') DEFAULT 'user' COMMENT '角色',
    `level` INT DEFAULT 1 COMMENT '等级 1-8',
    `points` INT DEFAULT 0 COMMENT '积分',
    `status` TINYINT DEFAULT 1 COMMENT '状态 1-正常 0-禁用',
    `bio` VARCHAR(500) DEFAULT NULL COMMENT '个人简介',
    `skill_tags` JSON DEFAULT NULL COMMENT 'AI技能标签',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_job_role` (`job_role`),
    INDEX `idx_points` (`points` DESC)
) ENGINE=InnoDB COMMENT='用户表';

-- -----------------------------------------------------------
-- 2. 问题表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `question`;
CREATE TABLE `question` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL COMMENT '发布者ID',
    `title` VARCHAR(200) NOT NULL COMMENT '标题',
    `content` TEXT NOT NULL COMMENT '内容(Markdown)',
    `job_role` ENUM('rd', 'pm_ops', 'qa') NOT NULL COMMENT '所属岗位方向',
    `level` ENUM('easy', 'medium', 'hard', 'expert') DEFAULT 'medium' COMMENT '问题等级',
    `status` ENUM('open', 'answered', 'solved', 'closed') DEFAULT 'open' COMMENT '状态',
    `bounty_points` INT DEFAULT 0 COMMENT '悬赏积分',
    `view_count` INT DEFAULT 0 COMMENT '浏览数',
    `answer_count` INT DEFAULT 0 COMMENT '回答数',
    `vote_count` INT DEFAULT 0 COMMENT '投票数',
    `solved_answer_id` BIGINT DEFAULT NULL COMMENT '采纳的回答ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `solved_at` DATETIME DEFAULT NULL COMMENT '解决时间',
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_job_role` (`job_role`),
    INDEX `idx_status` (`status`),
    INDEX `idx_created_at` (`created_at` DESC),
    FULLTEXT INDEX `ft_title_content` (`title`, `content`),
    CONSTRAINT `fk_question_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB COMMENT='问题表';

-- -----------------------------------------------------------
-- 3. 回答表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `answer`;
CREATE TABLE `answer` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `question_id` BIGINT NOT NULL COMMENT '问题ID',
    `user_id` BIGINT NOT NULL COMMENT '回答者ID',
    `content` TEXT NOT NULL COMMENT '回答内容(Markdown)',
    `solution_type` ENUM('skill', 'file', 'feasibility', 'experience') DEFAULT NULL COMMENT '解决方案类型',
    `vote_count` INT DEFAULT 0 COMMENT '投票数',
    `is_accepted` TINYINT DEFAULT 0 COMMENT '是否被采纳',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_question_id` (`question_id`),
    INDEX `idx_user_id` (`user_id`),
    CONSTRAINT `fk_answer_question` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`),
    CONSTRAINT `fk_answer_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB COMMENT='回答表';

-- -----------------------------------------------------------
-- 4. 评论表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `target_id` BIGINT NOT NULL COMMENT '目标ID(问题ID或回答ID)',
    `target_type` ENUM('question', 'answer') NOT NULL COMMENT '目标类型',
    `user_id` BIGINT NOT NULL COMMENT '评论者ID',
    `content` VARCHAR(1000) NOT NULL COMMENT '评论内容',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_target` (`target_id`, `target_type`),
    CONSTRAINT `fk_comment_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB COMMENT='评论表';

-- -----------------------------------------------------------
-- 5. 标签表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `tag`;
CREATE TABLE `tag` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL COMMENT '标签名',
    `description` VARCHAR(200) DEFAULT NULL COMMENT '描述',
    `category` VARCHAR(50) DEFAULT NULL COMMENT '分类',
    `job_role` ENUM('rd', 'pm_ops', 'qa') NOT NULL COMMENT '所属岗位方向',
    `question_count` INT DEFAULT 0 COMMENT '问题数',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_name_jobrole` (`name`, `job_role`),
    INDEX `idx_job_role` (`job_role`),
    INDEX `idx_question_count` (`question_count` DESC)
) ENGINE=InnoDB COMMENT='标签表';

-- -----------------------------------------------------------
-- 6. 问题标签关联表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `question_tag`;
CREATE TABLE `question_tag` (
    `question_id` BIGINT NOT NULL,
    `tag_id` BIGINT NOT NULL,
    UNIQUE KEY `uk_question_tag` (`question_id`, `tag_id`),
    CONSTRAINT `fk_qt_question` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_qt_tag` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='问题标签关联表';

-- -----------------------------------------------------------
-- 7. 投票表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `vote`;
CREATE TABLE `vote` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL COMMENT '投票者ID',
    `target_id` BIGINT NOT NULL COMMENT '目标ID',
    `target_type` ENUM('question', 'answer') NOT NULL COMMENT '目标类型',
    `vote_type` ENUM('up', 'down') NOT NULL COMMENT '投票类型',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_user_target` (`user_id`, `target_id`, `target_type`),
    CONSTRAINT `fk_vote_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB COMMENT='投票表';

-- -----------------------------------------------------------
-- 8. 积分记录表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `point_record`;
CREATE TABLE `point_record` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `action_type` VARCHAR(50) NOT NULL COMMENT '行为类型(QUESTION_POST/ANSWER_POST/ANSWER_ACCEPTED等)',
    `points` INT NOT NULL COMMENT '积分变动(正为获得,负为消耗)',
    `balance` INT NOT NULL COMMENT '变动后余额',
    `target_id` BIGINT DEFAULT NULL COMMENT '关联目标ID',
    `target_type` VARCHAR(20) DEFAULT NULL COMMENT '关联目标类型',
    `is_cross_role` TINYINT DEFAULT 0 COMMENT '是否跨岗位',
    `description` VARCHAR(200) DEFAULT NULL COMMENT '描述',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_created_at` (`created_at` DESC),
    CONSTRAINT `fk_point_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB COMMENT='积分记录表';

-- -----------------------------------------------------------
-- 9. 徽章表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `badge`;
CREATE TABLE `badge` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL COMMENT '徽章名称',
    `icon` VARCHAR(100) DEFAULT NULL COMMENT '图标',
    `description` VARCHAR(200) DEFAULT NULL COMMENT '描述',
    `condition_type` VARCHAR(50) NOT NULL COMMENT '条件类型(POINTS/VOTES/QUESTIONS/ANSWERS/CROSS_ROLE)',
    `condition_value` INT NOT NULL COMMENT '条件值',
    `job_role` ENUM('rd', 'pm_ops', 'qa', 'all') DEFAULT 'all' COMMENT '适用岗位',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='徽章表';

-- -----------------------------------------------------------
-- 10. 用户徽章关联表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `user_badge`;
CREATE TABLE `user_badge` (
    `user_id` BIGINT NOT NULL,
    `badge_id` BIGINT NOT NULL,
    `earned_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `badge_id`),
    CONSTRAINT `fk_ub_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
    CONSTRAINT `fk_ub_badge` FOREIGN KEY (`badge_id`) REFERENCES `badge` (`id`)
) ENGINE=InnoDB COMMENT='用户徽章关联表';

-- -----------------------------------------------------------
-- 11. 附件表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `attachment`;
CREATE TABLE `attachment` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `target_id` BIGINT NOT NULL COMMENT '关联目标ID',
    `target_type` ENUM('question', 'answer', 'comment') NOT NULL COMMENT '关联目标类型',
    `file_name` VARCHAR(255) NOT NULL COMMENT '文件名',
    `file_path` VARCHAR(500) NOT NULL COMMENT '存储路径',
    `file_size` BIGINT DEFAULT NULL COMMENT '文件大小(字节)',
    `file_type` VARCHAR(50) DEFAULT NULL COMMENT '文件类型',
    `uploaded_by` BIGINT NOT NULL COMMENT '上传者ID',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_target` (`target_id`, `target_type`),
    CONSTRAINT `fk_attachment_user` FOREIGN KEY (`uploaded_by`) REFERENCES `user` (`id`)
) ENGINE=InnoDB COMMENT='附件表';

-- -----------------------------------------------------------
-- 12. 通知表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `notification`;
CREATE TABLE `notification` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL COMMENT '接收者ID',
    `type` VARCHAR(50) NOT NULL COMMENT '通知类型(ANSWER/ACCEPTED/VOTE/COMMENT/SYSTEM)',
    `title` VARCHAR(200) NOT NULL COMMENT '标题',
    `content` VARCHAR(500) DEFAULT NULL COMMENT '内容',
    `is_read` TINYINT DEFAULT 0 COMMENT '是否已读',
    `related_id` BIGINT DEFAULT NULL COMMENT '关联ID',
    `related_type` VARCHAR(20) DEFAULT NULL COMMENT '关联类型',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_user_read` (`user_id`, `is_read`),
    INDEX `idx_created_at` (`created_at` DESC),
    CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB COMMENT='通知表';

-- -----------------------------------------------------------
-- 13. 签到表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `sign_in`;
CREATE TABLE `sign_in` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `sign_date` DATE NOT NULL COMMENT '签到日期',
    `continuous_days` INT DEFAULT 1 COMMENT '连续签到天数',
    `points_earned` INT DEFAULT 1 COMMENT '获得积分',
    UNIQUE KEY `uk_user_date` (`user_id`, `sign_date`),
    INDEX `idx_user_id` (`user_id`),
    CONSTRAINT `fk_signin_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB COMMENT='签到表';

-- -----------------------------------------------------------
-- 14. 岗位配置表
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `job_role_config`;
CREATE TABLE `job_role_config` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `role_key` ENUM('rd', 'pm_ops', 'qa') NOT NULL COMMENT '岗位标识',
    `role_name` VARCHAR(50) NOT NULL COMMENT '岗位名称',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '岗位描述',
    `icon` VARCHAR(100) DEFAULT NULL COMMENT '图标',
    `level_names` JSON NOT NULL COMMENT '等级称谓列表',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_role_key` (`role_key`)
) ENGINE=InnoDB COMMENT='岗位配置表';
