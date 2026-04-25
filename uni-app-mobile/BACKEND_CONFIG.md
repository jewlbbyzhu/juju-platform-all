# 聚聚平台 - 生产后端配置

**更新日期**: 2026-03-25  
**来源**: Backend/.env.production

---

## 生产后端配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 服务器IP | `122.51.255.13` | 生产服务器 |
| 端口 | `3010` | API服务端口 |
| 完整API地址 | `http://122.51.255.13:3010/api` | 前端使用 |
| 数据库 | `122.51.255.13:3306` | MySQL数据库 |
| 数据库名 | `hfparty_db_new` | - |
| Redis | `122.51.255.13:6379` | 缓存服务 |

---

## 当前前端配置

已强制使用生产后端：
```typescript
// services/api.ts
export const API_BASE_URL = 'http://122.51.255.13:3010/api'
```

---

## 测试API连接

```bash
# 测试生产后端
curl http://122.51.255.13:3010/api/health

# 或浏览器访问
http://122.51.255.13:3010/api/health
```

---

## 切换配置

### 使用生产后端（当前）
```typescript
export const API_BASE_URL = PROD_API_URL  // http://122.51.255.13:3010/api
```

### 使用本地后端
```typescript
export const API_BASE_URL = DEV_API_URL   // http://192.168.1.149:3000/api
```

---

## 注意事项

1. **CORS**: 生产后端需要配置允许前端IP访问
2. **HTTPS**: 当前使用HTTP，如需HTTPS请配置SSL
3. **防火墙**: 确保3010端口对外开放
4. **Token**: 生产环境token和本地不通用

---

**配置来源**: `/Users/mac/Projects/juju-platform-all/Backend/.env.production`
