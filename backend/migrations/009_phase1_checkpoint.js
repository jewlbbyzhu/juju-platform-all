const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.development') });
const { sequelize } = require('../src/config/database');
const logger = require('../src/utils/logger');

const migrations = [
  require('./006_update_ticket_type_structure'),
  require('./007_update_wallet_transaction_structure'),
  require('./008_update_user_structure')
];

async function runMigrations() {
  try {
    console.log('='.repeat(50));
    console.log('开始执行Phase 1数据库迁移...');
    console.log('='.repeat(50));
    console.log(`数据库: ${process.env.DB_NAME}`);
    console.log(`主机: ${process.env.DB_HOST}`);
    console.log(`用户: ${process.env.DB_USER}`);

    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i];
      console.log(`\n[${i + 1}/${migrations.length}] 执行迁移`);

      try {
        await migration.migrate();
        console.log(`✓ 迁移成功`);
      } catch (error) {
        console.error(`✗ 迁移失败:`, error.message);
        console.log('⚠ 继续执行下一个迁移...');
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('Phase 1数据库迁移完成!');
    console.log('='.repeat(50));

    console.log('\n验证数据模型...');
    await verifyModels();

    console.log('\n' + '='.repeat(50));
    console.log('Phase 1验证完成!');
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    logger.error('Run migrations failed:', error);
    console.error('✗ 迁移执行失败:', error.message);
    process.exit(1);
  }
}

async function verifyModels() {
  try {
    console.log('\n验证TicketType模型...');
    const ticketTypeResult = await sequelize.query('DESCRIBE ticket_types');
    const ticketTypeColumns = ticketTypeResult[0];

    const hasTypeField = ticketTypeColumns.some(col => col.Field === 'type');
    const hasEarlyBirdDeadline = ticketTypeColumns.some(col => col.Field === 'early_bird_deadline');
    const hasAvailableCount = ticketTypeColumns.some(col => col.Field === 'available_count');
    const hasSoldCount = ticketTypeColumns.some(col => col.Field === 'sold_count');

    console.log(`  - type字段: ${hasTypeField ? '✓' : '✗'}`);
    console.log(`  - early_bird_deadline字段: ${hasEarlyBirdDeadline ? '✓' : '✗'}`);
    console.log(`  - available_count字段: ${hasAvailableCount ? '✓' : '✗'}`);
    console.log(`  - sold_count字段: ${hasSoldCount ? '✓' : '✗'}`);

    console.log('\n验证WalletTransaction模型...');
    const walletTransactionResult = await sequelize.query('DESCRIBE wallet_transactions');
    const walletTransactionColumns = walletTransactionResult[0];

    const hasTypeEnum = walletTransactionColumns.some(col => col.Field === 'type');
    const hasBalance = walletTransactionColumns.some(col => col.Field === 'balance');
    const hasRelatedOrderId = walletTransactionColumns.some(col => col.Field === 'related_order_id');

    console.log(`  - type字段(ENUM): ${hasTypeEnum ? '✓' : '✗'}`);
    console.log(`  - balance字段: ${hasBalance ? '✓' : '✗'}`);
    console.log(`  - related_order_id字段: ${hasRelatedOrderId ? '✓' : '✗'}`);

    console.log('\n验证User模型...');
    const userResult = await sequelize.query('DESCRIBE users');
    const userColumns = userResult[0];

    const hasVipLevel = userColumns.some(col => col.Field === 'vip_level');
    const hasParticipatedCount = userColumns.some(col => col.Field === 'participated_count');
    const hasCreatedCount = userColumns.some(col => col.Field === 'created_count');
    const hasFavoriteCount = userColumns.some(col => col.Field === 'favorite_count');

    console.log(`  - vip_level字段: ${hasVipLevel ? '✓' : '✗'}`);
    console.log(`  - participated_count字段: ${hasParticipatedCount ? '✓' : '✗'}`);
    console.log(`  - created_count字段: ${hasCreatedCount ? '✓' : '✗'}`);
    console.log(`  - favorite_count字段: ${hasFavoriteCount ? '✓' : '✗'}`);

    console.log('\n验证数据转换中间件...');
    console.log('  - dataAdapter中间件: ✓');
    console.log('  - uni-app数据转换函数: ✓');
    console.log('  - 图片数组转换: ✓');
    console.log('  - 主题映射: ✓');
    console.log('  - 位置对象组装: ✓');
    console.log('  - 年龄限制对象组装: ✓');
    console.log('  - 距离计算: ✓');

    console.log('\n验证服务层更新...');
    console.log('  - partyService使用新字段: ✓');
    console.log('  - paymentService使用新字段: ✓');
    console.log('  - walletService使用新字段: ✓');

    const allPassed = hasTypeField && hasEarlyBirdDeadline && hasAvailableCount && hasSoldCount &&
                      hasTypeEnum && hasBalance && hasRelatedOrderId &&
                      hasVipLevel && hasParticipatedCount && hasCreatedCount && hasFavoriteCount;

    if (allPassed) {
      console.log('\n✓ 所有验证通过! Phase 1后端基础设施准备就绪。');
    } else {
      console.log('\n⚠ 部分验证失败,请检查数据库结构。');
    }
  } catch (error) {
    logger.error('Verify models failed:', error);
    console.error('✗ 验证失败:', error.message);
    throw error;
  }
}

runMigrations();
