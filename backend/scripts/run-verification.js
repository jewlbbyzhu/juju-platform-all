const DatabaseVerification = require('./verify-database');

async function main() {
  console.log('==========================================');
  console.log('  聚聚项目数据库验证工具');
  console.log('==========================================\n');

  const verifier = new DatabaseVerification();
  
  try {
    await verifier.runAllTests();
    
    const results = verifier.getResults();
    
    if (results.failed === 0) {
      console.log('\n✓ 所有测试通过！');
      console.log('数据库修复验证成功完成。\n');
      process.exit(0);
    } else {
      console.log(`\n✗ 有 ${results.failed} 个测试失败`);
      console.log('请检查日志了解详细信息。\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n✗ 验证过程出错:', error.message);
    console.error('请检查数据库连接和配置。\n');
    process.exit(1);
  }
}

main();
