# 聚聚平台全平台项目概览
# 复制时间: 2026-03-11
# 来源: Windows D:\workspace
# 目标: Mac ~/Projects/juju-platform-all/

---

## 📱 全平台架构

聚聚平台采用多平台架构，覆盖主流终端：

```
聚聚平台 (juju-platform)
├── 🌐 official-website     # 官方网站 (Web)
├── ⚙️  admin-web            # 管理后台 (Web)
├── 📱 uni-app-mobile        # 移动端 (uni-app)
├── 📱 uniapp-h5             # H5版本 (uni-app)
├── 💬 mp-weixin             # 微信小程序
├── 🔧 backend               # 后端服务
└── 📦 juju-platform         # 主项目整合
```

---

## 📁 项目详情

### 1. 🌐 official-website (官网)
**类型:** 官方网站
**技术栈:** Web前端
**大小:** 5.9 MB
**路径:** `~/Projects/juju-platform-all/official-website/`

### 2. ⚙️ admin-web (管理后台)
**类型:** 后台管理系统
**技术栈:** Web前端
**大小:** 1.9 MB
**路径:** `~/Projects/juju-platform-all/admin-web/`

### 3. 📱 uni-app-mobile (uni-app移动端)
**类型:** 移动APP
**技术栈:** uni-app (Vue.js)
**大小:** 88 MB
**路径:** `~/Projects/juju-platform-all/uni-app-mobile/`
**说明:** 主要移动端应用，支持iOS/Android

### 4. 📱 uniapp-h5 (uni-app H5版)
**类型:** H5移动端
**技术栈:** uni-app (Vue.js)
**大小:** 1.3 MB
**路径:** `~/Projects/juju-platform-all/uniapp-h5/`
**说明:** H5版本，用于分享和轻量访问

### 5. 💬 mp-weixin (微信小程序)
**类型:** 微信小程序
**技术栈:** 微信小程序原生/uni-app
**大小:** 1.3 MB
**路径:** `~/Projects/juju-platform-all/mp-weixin/`
**说明:** 微信生态小程序

### 6. 🔧 backend (后端服务)
**类型:** 后端API服务
**技术栈:** Node.js
**大小:** 11 MB
**路径:** `~/Projects/juju-platform-all/backend/`
**说明:** 统一后端服务，支撑所有前端

### 7. 📦 juju-platform (主项目)
**类型:** 项目整合/配置
**技术栈:** 多技术栈整合
**大小:** 2.7 MB
**路径:** `~/Projects/juju-platform-all/juju-platform/`
**说明:** 主项目配置和文档

---

## 📊 项目统计

| 指标 | 数值 |
|------|------|
| 总项目数 | 7个 |
| 总大小 | 约 113 MB |
| 前端项目 | 5个 |
| 后端项目 | 1个 |
| 整合项目 | 1个 |

---

## 🛠️ 开发环境

### 进入项目目录
```bash
cd ~/Projects/juju-platform-all

# 查看所有项目
ls -la
```

### 各平台开发
```bash
# 官网
cd official-website
npm install
npm run dev

# 管理后台
cd admin-web
npm install
npm run dev

# uni-app移动端
cd uni-app-mobile
npm install
npm run dev

# 微信小程序
cd mp-weixin
# 使用微信开发者工具打开

# 后端服务
cd backend
npm install
npm run dev
```

---

## 🔄 同步工具

### 使用同步脚本
```bash
# 列出所有项目
~/.openclaw/scripts/juju-platform-sync-all.sh list

# 同步所有项目到 Mac
~/.openclaw/scripts/juju-platform-sync-all.sh sync-all-to-mac

# 同步所有项目到 Windows
~/.openclaw/scripts/juju-platform-sync-all.sh sync-all-to-windows

# 同步单个项目
~/.openclaw/scripts/juju-platform-sync-all.sh sync admin-web

# 推送单个项目到 Windows
~/.openclaw/scripts/juju-platform-sync-all.sh push admin-web

# SSH连接到 Windows
~/.openclaw/scripts/juju-platform-sync-all.sh ssh
```

---

## 🔗 远程连接信息

- **Windows IP:** 100.78.136.61 (Tailscale)
- **Mac IP:** 100.116.237.47 (Tailscale)
- **SSH用户:** Administrator
- **项目路径:** D:\workspace

---

## 📝 备注

- 所有项目已通过SSH从Windows复制到Mac
- 支持双向同步
- 使用Tailscale安全网络
- 自动化同步脚本已配置

---

**创建时间:** 2026-03-11 01:18
**创建者:** main agent (宝贝)
