// API配置
// 开发环境使用本地后端，生产环境使用远程服务器
const isDev = __DEV__;

// 远程服务器配置（生产环境）
const REMOTE_API = "https://api.hfparty.asia/api/v1";
const REMOTE_WS = "wss://api.hfparty.asia";

// 本地开发配置
const LOCAL_API = "http://localhost:3000/api/v1";
const LOCAL_WS = "ws://localhost:3000";

// 当前使用的API地址
export const API_BASE_URL = isDev ? LOCAL_API : REMOTE_API;
export const API_BASE_URL_V2 = isDev ? "http://localhost:3000/api/v2" : "https://api.hfparty.asia/api/v2";
export const API_TIMEOUT = 30000;
export const APP_NAME = "聚聚";
export const DEFAULT_PAGE_SIZE = 10;

// WebSocket URL
export const WS_BASE_URL = isDev ? LOCAL_WS : REMOTE_WS;

// 环境配置
export const ENV = {
  dev: {
    apiUrl: LOCAL_API,
    apiUrlV2: "http://localhost:3000/api/v2",
    wsUrl: LOCAL_WS,
  },
  prod: {
    apiUrl: REMOTE_API,
    apiUrlV2: "https://api.hfparty.asia/api/v2",
    wsUrl: REMOTE_WS,
  },
};
