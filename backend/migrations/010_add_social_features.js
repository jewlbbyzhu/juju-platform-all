require('dotenv').config({ path: '.env.development' });
const { sequelize } = require('../src/config/database');

async function migrate() {
  try {
    console.log('Starting social features migration...');

    await sequelize.transaction(async (t) => {
      console.log('Step 1: Creating posts table...');
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS posts (
          id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          user_id BIGINT UNSIGNED NOT NULL COMMENT '发布者ID',
          content TEXT COMMENT '动态内容',
          images JSON COMMENT '图片列表JSON数组',
          party_id BIGINT UNSIGNED NULL COMMENT '关联的聚会ID',
          location JSON COMMENT '位置信息JSON{name, address, latitude, longitude}',
          visibility ENUM('public', 'friends') NOT NULL DEFAULT 'public' COMMENT '可见性：public-公开，friends-仅好友',
          like_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '点赞数',
          comment_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '评论数',
          share_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '分享数',
          status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-删除，1-正常',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id),
          INDEX idx_party_id (party_id),
          INDEX idx_visibility (visibility),
          INDEX idx_status (status),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='动态表'
      `, { transaction: t });

      console.log('Step 2: Creating comments table...');
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS comments (
          id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          user_id BIGINT UNSIGNED NOT NULL COMMENT '评论者ID',
          post_id BIGINT UNSIGNED NULL COMMENT '动态ID',
          party_id BIGINT UNSIGNED NULL COMMENT '聚会ID',
          content TEXT NOT NULL COMMENT '评论内容',
          reply_to BIGINT UNSIGNED NULL COMMENT '回复的评论ID',
          like_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '点赞数',
          status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-删除，1-正常',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id),
          INDEX idx_post_id (post_id),
          INDEX idx_party_id (party_id),
          INDEX idx_reply_to (reply_to),
          INDEX idx_status (status),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表'
      `, { transaction: t });

      console.log('Step 3: Creating follows table...');
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS follows (
          id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          follower_id BIGINT UNSIGNED NOT NULL COMMENT '关注者ID',
          following_id BIGINT UNSIGNED NOT NULL COMMENT '被关注者ID',
          status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-取消关注，1-关注中',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_follower_id (follower_id),
          INDEX idx_following_id (following_id),
          UNIQUE KEY uk_follower_following (follower_id, following_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='关注关系表'
      `, { transaction: t });

      console.log('Step 4: Creating likes table...');
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS likes (
          id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          user_id BIGINT UNSIGNED NOT NULL COMMENT '点赞者ID',
          post_id BIGINT UNSIGNED NULL COMMENT '动态ID',
          party_id BIGINT UNSIGNED NULL COMMENT '聚会ID',
          comment_id BIGINT UNSIGNED NULL COMMENT '评论ID',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id),
          INDEX idx_post_id (post_id),
          INDEX idx_party_id (party_id),
          INDEX idx_comment_id (comment_id),
          UNIQUE KEY uk_user_post (user_id, post_id),
          UNIQUE KEY uk_user_party (user_id, party_id),
          UNIQUE KEY uk_user_comment (user_id, comment_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='点赞表'
      `, { transaction: t });

      console.log('Step 5: Adding social fields to users table...');
      await sequelize.query(`
        ALTER TABLE users
          ADD COLUMN IF NOT EXISTS bio VARCHAR(500) COMMENT '个人简介',
          ADD COLUMN IF NOT EXISTS following_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '关注数',
          ADD COLUMN IF NOT EXISTS followers_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '粉丝数'
      `, { transaction: t });

      console.log('Step 6: Adding social fields to parties table...');
      await sequelize.query(`
        ALTER TABLE parties
          ADD COLUMN IF NOT EXISTS like_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '点赞数',
          ADD COLUMN IF NOT EXISTS comment_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '评论数',
          ADD COLUMN IF NOT EXISTS share_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '分享数'
      `, { transaction: t });
    });

    console.log('Social features migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
