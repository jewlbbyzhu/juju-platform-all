const ENV = process.env.NODE_ENV || 'development';

const API_URLS = {
  development: 'http://localhost:3000/api/v1',
  test: 'http://localhost:3000/api/v1',
  production: 'http://localhost:3000/api/v1'
};

// 请求超时配置
const TIMEOUT_CONFIG = {
  development: 30000,
  test: 20000,
  production: 15000
};

const BASE_URL = API_URLS[ENV];

const config = {
  env: ENV,
  baseURL: API_URLS[ENV],
  timeout: TIMEOUT_CONFIG[ENV],
  headers: {
    'Content-Type': 'application/json'
  },
  // 上传配置
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    maxCount: 9,
    accept: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  // 缓存配置
  cache: {
    enabled: ENV !== 'development',
    defaultTime: 5 * 60 * 1000 // 5分钟
  },
  // 分页配置
  pagination: {
    pageSize: 10,
    pageSizeOptions: [10, 20, 50]
  }
};

export default config;
