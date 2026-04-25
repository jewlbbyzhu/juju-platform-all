# 聚聚平台 - 本地网络环境配置指南

**更新日期**: 2026-03-25  
**配置目的**: 支持IPv4/IPv6网络环境，使用本地IP和端口访问项目

---

## 网络配置

### 本机IP地址
| 类型 | IP地址 | 说明 |
|------|--------|------|
| IPv4 (局域网) | `192.168.1.149` | 主要开发IP |
| IPv4 (虚拟) | `198.18.0.1` | 虚拟网卡 |
| 本地回环 | `127.0.0.1` / `localhost` | 本机访问 |
| IPv6 | `::1` | 本地回环 |

### 服务端口
| 服务 | 端口 | 访问地址 |
|------|------|----------|
| 前端开发服务器 | 3000 | http://192.168.1.149:3000 |
| 后端API服务 | 3000 | http://192.168.1.149:3000/api |
| HMR热更新 | 3000 | ws://192.168.1.149:3000 |

---

## 配置文件修改

### 1. vite.config.js
```javascript
server: {
  host: '0.0.0.0',      // 监听所有网络接口 (IPv4 + IPv6)
  port: 3000,           // 开发服务器端口
  strictPort: false,    // 端口被占用时尝试下一个
  open: false,          // 不自动打开浏览器
  cors: true,           // 启用CORS
  hmr: {
    host: '192.168.1.149',  // HMR热更新使用本地IP
    port: 3000
  }
}
```

### 2. services/api.ts
```typescript
const getLocalIP = () => {
  return process.env.VITE_API_HOST || '192.168.1.149'
}

export const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? `http://${getLocalIP()}:3000/api`
  : 'https://api.juju.com/api'
```

---

## 启动命令

### 方式1: 使用npm脚本
```bash
# 进入项目目录
cd ~/.openclaw/workspace/juju-platform-all/uni-app-mobile

# 安装依赖（如未安装）
npm install

# 启动H5开发服务器（自动使用配置好的IP和端口）
npm run dev:h5

# 或启动App平台开发
npm run dev:app
```

### 方式2: 使用uni-app CLI
```bash
cd ~/.openclaw/workspace/juju-platform-all/uni-app-mobile

# H5平台
npx uni -p h5

# App平台
npx uni -p app
```

---

## 访问方式

### 本机浏览器访问
```
http://localhost:3000
http://127.0.0.1:3000
```

### 局域网其他设备访问
```
http://192.168.1.149:3000
```

### 手机真机调试
1. 确保手机和电脑在同一WiFi网络
2. 手机浏览器访问: `http://192.168.1.149:3000`
3. 或使用uni-app的扫码调试功能

---

## 防火墙配置

### macOS防火墙设置
如果其他设备无法访问，请检查防火墙：

```bash
# 查看防火墙状态
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# 临时关闭防火墙（测试用）
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off

# 允许特定端口（推荐）
# 在 系统设置 > 网络 > 防火墙 中添加Node.js例外
```

### 路由器配置
如需外网访问，需要在路由器设置端口转发：
- 外部端口: 3000
- 内部IP: 192.168.1.149
- 内部端口: 3000

---

## 常见问题

### Q1: 端口被占用
```bash
# 查找占用3000端口的进程
lsof -i :3000

# 结束进程
kill -9 <PID>

# 或使用其他端口
npm run dev:h5 -- --port 3001
```

### Q2: 无法通过IP访问
1. 检查防火墙设置
2. 确认手机和电脑在同一网络
3. 尝试ping测试: `ping 192.168.1.149`

### Q3: HMR热更新不工作
检查vite.config.js中的hmr配置是否正确指向本地IP。

### Q4: API请求失败
确保后端服务也在监听所有接口：
```javascript
// backend/server.js
app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:3000')
})
```

---

## 环境变量配置

### .env.development
```
VITE_API_HOST=192.168.1.149
VITE_API_PORT=3000
VITE_APP_TITLE=聚聚(开发版)
```

### .env.production
```
VITE_API_HOST=api.juju.com
VITE_API_PORT=443
VITE_APP_TITLE=聚聚
```

---

## 验证配置

### 测试步骤
1. 启动开发服务器: `npm run dev:h5`
2. 本机访问: http://localhost:3000
3. 局域网访问: http://192.168.1.149:3000
4. 手机访问: 使用同一WiFi，浏览器打开 http://192.168.1.149:3000

### 成功标志
- ✅ 页面正常加载
- ✅ API请求成功
- ✅ HMR热更新正常工作
- ✅ 手机可以访问并调试

---

**配置完成！** 现在可以通过本地IP和端口访问uni-app-mobile项目了。
