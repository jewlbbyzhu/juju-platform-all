/**
 * API测试脚本
 * 测试后端API的响应格式和错误处理
 */

const https = require('https');
const http = require('http');

const API_BASE = 'api.hfparty.asia';
const API_VERSION = '/api/v2';

// 测试日志
const logs = [];
const errors = [];

function log(level, message, data) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data
  };
  logs.push(entry);
  console.log(`[${level.toUpperCase()}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

// 发送HTTP请求
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE,
      port: 443,
      path: `${API_VERSION}${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    log('info', `Making ${method} request to ${path}`);

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      log('error', `Request failed: ${path}`, error.message);
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// 测试账号
const TEST_USERNAME = 'eros1101';
const TEST_PASSWORD = 'zaqzzh.521';
let authToken = null;

// 测试登录API
async function testLogin() {
  log('info', '========== Testing Login API ==========');

  try {
    // 测试错误的登录凭证
    const wrongResponse = await makeRequest('POST', '/admin/login', {
      username: 'test',
      password: 'wrong'
    });

    log('info', 'Login with wrong credentials response', {
      status: wrongResponse.status,
      data: wrongResponse.data
    });

    // 验证响应格式
    if (wrongResponse.status === 401 || wrongResponse.status === 400) {
      log('success', 'Login correctly rejects wrong credentials');
    } else {
      log('warn', 'Unexpected status code for wrong credentials', wrongResponse.status);
    }

    // 检查错误响应格式
    if (wrongResponse.data && wrongResponse.data.success === false) {
      log('success', 'Error response has correct format (success: false)');
    } else {
      log('error', 'Error response format incorrect', wrongResponse.data);
      errors.push({
        api: '/admin/login',
        issue: 'Error response missing success: false',
        data: wrongResponse.data
      });
    }

    // 测试正确的登录凭证
    log('info', 'Testing login with valid credentials');
    const validResponse = await makeRequest('POST', '/admin/login', {
      username: TEST_USERNAME,
      password: TEST_PASSWORD
    });

    log('info', 'Login with valid credentials response', {
      status: validResponse.status,
      data: validResponse.data
    });

    if (validResponse.data && validResponse.data.success === true) {
      log('success', 'Login successful');
      authToken = validResponse.data.data?.token;
      if (authToken) {
        log('success', 'Auth token received');
      } else {
        log('error', 'No token in login response', validResponse.data);
        errors.push({
          api: '/admin/login',
          issue: 'Login successful but no token received',
          data: validResponse.data
        });
      }
    } else {
      log('error', 'Login failed', validResponse.data);
      errors.push({
        api: '/admin/login',
        issue: 'Login with valid credentials failed',
        data: validResponse.data
      });
    }

  } catch (error) {
    log('error', 'Login test failed', error.message);
    errors.push({ api: '/admin/login', error: error.message });
  }
}

// 测试验证码API
async function testCaptcha() {
  log('info', '========== Testing Captcha API ==========');

  try {
    const response = await makeRequest('GET', '/auth/captcha');

    log('info', 'Captcha response', {
      status: response.status,
      data: response.data
    });

    // 验证响应格式
    if (response.data && response.data.success === true) {
      log('success', 'Captcha response has correct format');

      if (response.data.data && response.data.data.captcha && response.data.data.key) {
        log('success', 'Captcha data structure correct');
      } else {
        log('error', 'Captcha data structure incorrect', response.data.data);
        errors.push({
          api: '/auth/captcha',
          issue: 'Missing captcha or key in data',
          data: response.data
        });
      }
    } else {
      log('error', 'Captcha response format incorrect', response.data);
      errors.push({
        api: '/auth/captcha',
        issue: 'Response missing success: true',
        data: response.data
      });
    }

  } catch (error) {
    log('error', 'Captcha test failed', error.message);
    errors.push({ api: '/auth/captcha', error: error.message });
  }
}

// 测试需要认证的API（不带token）
async function testAuthRequired() {
  log('info', '========== Testing Auth Required APIs ==========');

  const protectedEndpoints = [
    { method: 'GET', path: '/auth/user' },
    { method: 'GET', path: '/auth/permissions' },
    { method: 'GET', path: '/users' },
    { method: 'GET', path: '/parties' }
  ];

  for (const endpoint of protectedEndpoints) {
    try {
      const response = await makeRequest(endpoint.method, endpoint.path);

      log('info', `${endpoint.method} ${endpoint.path} response`, {
        status: response.status
      });

      if (response.status === 401) {
        log('success', `${endpoint.path} correctly returns 401 without auth`);
      } else {
        log('warn', `${endpoint.path} returns ${response.status} without auth (expected 401)`);
      }

    } catch (error) {
      log('error', `${endpoint.path} test failed`, error.message);
    }
  }
}

// 测试CORS
async function testCORS() {
  log('info', '========== Testing CORS ==========');

  const options = {
    hostname: API_BASE,
    port: 443,
    path: `${API_VERSION}/auth/captcha`,
    method: 'OPTIONS',
    headers: {
      'Origin': 'http://localhost:3000',
      'Access-Control-Request-Method': 'GET'
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      const corsHeaders = {
        'access-control-allow-origin': res.headers['access-control-allow-origin'],
        'access-control-allow-methods': res.headers['access-control-allow-methods'],
        'access-control-allow-headers': res.headers['access-control-allow-headers']
      };

      log('info', 'CORS preflight response headers', corsHeaders);

      if (res.headers['access-control-allow-origin']) {
        log('success', 'CORS is configured');
      } else {
        log('error', 'CORS headers missing - this will cause browser errors!');
        errors.push({
          api: 'CORS',
          issue: 'CORS headers not configured',
          headers: res.headers
        });
      }

      resolve();
    });

    req.on('error', (error) => {
      log('error', 'CORS test failed', error.message);
      resolve();
    });

    req.end();
  });
}

// 生成报告
function generateReport() {
  log('info', '========== Test Report ==========');

  const report = {
    summary: {
      totalTests: logs.filter(l => l.level === 'info' && l.message.includes('Testing')).length,
      errors: errors.length,
      timestamp: new Date().toISOString()
    },
    errors,
    logs
  };

  console.log('\n========== SUMMARY ==========');
  console.log(`Total API Tests: ${report.summary.totalTests}`);
  console.log(`Errors Found: ${report.summary.errors}`);

  if (errors.length > 0) {
    console.log('\n========== ERRORS ==========');
    errors.forEach((err, i) => {
      console.log(`\n${i + 1}. ${err.api || err.api}`);
      console.log(`   Issue: ${err.issue || err.error}`);
      if (err.data) {
        console.log(`   Data:`, JSON.stringify(err.data, null, 2));
      }
    });
  }

  // 保存报告
  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(__dirname, '..', 'api-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport saved to: ${reportPath}`);

  return report;
}

// 运行所有测试
async function runTests() {
  log('info', 'Starting API Tests', { baseUrl: API_BASE });

  await testCORS();
  await testCaptcha();
  await testLogin();
  await testAuthRequired();

  generateReport();
}

runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
