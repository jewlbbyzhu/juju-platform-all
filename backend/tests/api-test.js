const axios = require('axios');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

class APITester {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };
    this.authToken = null;
    this.adminToken = null;
  }

  async testEndpoint(name, method, path, data = null, headers = {}) {
    this.results.total++;
    const testResult = {
      name,
      method,
      path,
      status: 'pending',
      error: null,
      response: null
    };

    try {
      const config = {
        method,
        url: `${BASE_URL}${path}`,
        headers
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      testResult.status = 'passed';
      testResult.response = response.data;
      this.results.passed++;
      console.log(`✅ ${name}`);
    } catch (error) {
      testResult.status = 'failed';
      testResult.error = error.response ? error.response.data : error.message;
      this.results.failed++;
      console.log(`❌ ${name} - ${testResult.error}`);
    }

    this.results.tests.push(testResult);
    return testResult;
  }

  async runUserTests() {
    console.log('\n=== 用户管理测试 ===');
    
    await this.testEndpoint(
      '用户注册',
      'POST',
      '/api/v1/users/register',
      {
        openid: `test_openid_${Date.now()}`,
        nickname: 'Test User',
        avatar: 'https://example.com/avatar.jpg'
      }
    );

    const loginResult = await this.testEndpoint(
      '用户登录',
      'POST',
      '/api/v1/users/login',
      {
        openid: 'test_openid_001'
      }
    );

    if (loginResult.status === 'passed' && loginResult.response.data.token) {
      this.authToken = loginResult.response.data.token;
    }

    if (this.authToken) {
      await this.testEndpoint(
        '获取用户资料',
        'GET',
        '/api/v1/users/profile',
        null,
        { 'Authorization': `Bearer ${this.authToken}` }
      );

      await this.testEndpoint(
        '更新用户资料',
        'PUT',
        '/api/v1/users/profile',
        {
          nickname: 'Updated User',
          avatar: 'https://example.com/new-avatar.jpg'
        },
        { 'Authorization': `Bearer ${this.authToken}` }
      );
    }
  }

  async runPartyTests() {
    console.log('\n=== 聚会管理测试 ===');
    
    await this.testEndpoint(
      '获取聚会列表',
      'GET',
      '/api/v1/parties'
    );

    await this.testEndpoint(
      '获取聚会列表（带分页）',
      'GET',
      '/api/v1/parties?page=1&limit=10'
    );

    await this.testEndpoint(
      '筛选聚会（按分类）',
      'GET',
      '/api/v1/parties?category=music'
    );

    await this.testEndpoint(
      '筛选聚会（按状态）',
      'GET',
      '/api/v1/parties?status=1'
    );

    if (this.authToken) {
      await this.testEndpoint(
        '获取我的聚会',
        'GET',
        '/api/v1/parties/my',
        null,
        { 'Authorization': `Bearer ${this.authToken}` }
      );
    }
  }

  async runOrderTests() {
    console.log('\n=== 订单管理测试 ===');
    
    if (this.authToken) {
      await this.testEndpoint(
        '获取订单列表',
        'GET',
        '/api/v1/orders',
        null,
        { 'Authorization': `Bearer ${this.authToken}` }
      );

      await this.testEndpoint(
        '获取订单列表（带分页）',
        'GET',
        '/api/v1/orders?page=1&limit=10',
        null,
        { 'Authorization': `Bearer ${this.authToken}` }
      );

      await this.testEndpoint(
        '筛选订单（按状态）',
        'GET',
        '/api/v1/orders?status=0',
        null,
        { 'Authorization': `Bearer ${this.authToken}` }
      );
    }
  }

  async runWalletTests() {
    console.log('\n=== 钱包管理测试 ===');
    
    if (this.authToken) {
      await this.testEndpoint(
        '获取钱包信息',
        'GET',
        '/api/v1/wallet',
        null,
        { 'Authorization': `Bearer ${this.authToken}` }
      );

      await this.testEndpoint(
        '获取交易记录',
        'GET',
        '/api/v1/wallet/transactions',
        null,
        { 'Authorization': `Bearer ${this.authToken}` }
      );

      await this.testEndpoint(
        '获取交易记录（带分页）',
        'GET',
        '/api/v1/wallet/transactions?page=1&limit=10',
        null,
        { 'Authorization': `Bearer ${this.authToken}` }
      );
    }
  }

  async runVIPTests() {
    console.log('\n=== VIP管理测试 ===');
    
    if (this.authToken) {
      await this.testEndpoint(
        '获取我的VIP',
        'GET',
        '/api/v1/vip',
        null,
        { 'Authorization': `Bearer ${this.authToken}` }
      );

      await this.testEndpoint(
        '获取VIP历史',
        'GET',
        '/api/v1/vip/history',
        null,
        { 'Authorization': `Bearer ${this.authToken}` }
      );

      await this.testEndpoint(
        '获取VIP特权',
        'GET',
        '/api/v1/vip/benefits',
        null,
        { 'Authorization': `Bearer ${this.authToken}` }
      );

      await this.testEndpoint(
        '检查VIP状态',
        'GET',
        '/api/v1/vip/status',
        null,
        { 'Authorization': `Bearer ${this.authToken}` }
      );
    }
  }

  async runFavoriteTests() {
    console.log('\n=== 收藏管理测试 ===');
    
    if (this.authToken) {
      await this.testEndpoint(
        '获取收藏列表',
        'GET',
        '/api/v1/favorites',
        null,
        { 'Authorization': `Bearer ${this.authToken}` }
      );

      await this.testEndpoint(
        '获取收藏统计',
        'GET',
        '/api/v1/favorites/stats',
        null,
        { 'Authorization': `Bearer ${this.authToken}` }
      );

      await this.testEndpoint(
        '检查收藏状态',
        'GET',
        '/api/v1/favorites/check?party_id=1',
        null,
        { 'Authorization': `Bearer ${this.authToken}` }
      );
    }
  }

  async runNotificationTests() {
    console.log('\n=== 通知管理测试 ===');
    
    if (this.authToken) {
      await this.testEndpoint(
        '获取通知列表',
        'GET',
        '/api/v1/notifications',
        null,
        { 'Authorization': `Bearer ${this.authToken}` }
      );

      await this.testEndpoint(
        '获取未读数量',
        'GET',
        '/api/v1/notifications/unread-count',
        null,
        { 'Authorization': `Bearer ${this.authToken}` }
      );

      await this.testEndpoint(
        '获取通知统计',
        'GET',
        '/api/v1/notifications/stats',
        null,
        { 'Authorization': `Bearer ${this.authToken}` }
      );
    }
  }

  async runAdminTests() {
    console.log('\n=== 管理员测试 ===');
    
    const adminLoginResult = await this.testEndpoint(
      '管理员登录',
      'POST',
      '/api/v2/admin/login',
      {
        username: 'admin',
        password: 'admin123'
      }
    );

    if (adminLoginResult.status === 'passed' && adminLoginResult.response.data.token) {
      this.adminToken = adminLoginResult.response.data.token;
    }

    if (this.adminToken) {
      await this.testEndpoint(
        '获取管理员列表',
        'GET',
        '/api/v2/admin',
        null,
        { 'Authorization': `Bearer ${this.adminToken}` }
      );

      await this.testEndpoint(
        '获取角色列表',
        'GET',
        '/api/v2/admin/roles',
        null,
        { 'Authorization': `Bearer ${this.adminToken}` }
      );

      await this.testEndpoint(
        '获取权限列表',
        'GET',
        '/api/v2/admin/permissions',
        null,
        { 'Authorization': `Bearer ${this.adminToken}` }
      );
    }
  }

  async runAllTests() {
    console.log('========================================');
    console.log('聚聚平台后端API测试');
    console.log('========================================');
    console.log(`测试地址: ${BASE_URL}`);
    console.log('========================================\n');

    try {
      await this.runUserTests();
      await this.runPartyTests();
      await this.runOrderTests();
      await this.runWalletTests();
      await this.runVIPTests();
      await this.runFavoriteTests();
      await this.runNotificationTests();
      await this.runAdminTests();
    } catch (error) {
      console.error('测试过程中发生错误:', error);
    }

    this.printSummary();
  }

  printSummary() {
    console.log('\n========================================');
    console.log('测试结果汇总');
    console.log('========================================');
    console.log(`总测试数: ${this.results.total}`);
    console.log(`通过: ${this.results.passed} ✅`);
    console.log(`失败: ${this.results.failed} ❌`);
    console.log(`通过率: ${((this.results.passed / this.results.total) * 100).toFixed(2)}%`);
    console.log('========================================\n');

    if (this.results.failed > 0) {
      console.log('失败的测试:');
      this.results.tests
        .filter(test => test.status === 'failed')
        .forEach(test => {
          console.log(`  ❌ ${test.name} (${test.method} ${test.path})`);
          console.log(`     错误: ${test.error}`);
        });
      console.log('');
    }
  }
}

const tester = new APITester();
tester.runAllTests().catch(error => {
  console.error('测试执行失败:', error);
  process.exit(1);
});
