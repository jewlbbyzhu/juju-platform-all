# Juju App 迁移计划 - uni-app 到 React Native

## 项目结构

### 当前状态
- **React Native项目**: 10 个基础页面 + Mock数据
- **uni-app项目**: 46 个页面 + 25 个 API 模块

### 目标
完整迁移所有功能，对接真实后端 API (http://localhost:3000/api)

---

## 任务批次

### 批次 1: 核心基础架构
- [ ] 更新 API 基类
- [ ] 集成 AsyncStorage
- [ ] 创建 API 模块 (auth.js, user.js)
- [ ] 迁移 utils (cache.js, formatter.js)

### 批次 2: 聚会与订单模块
- [ ] 更新聚会相关 API
- [ ] 更新订单相关 API
- [ ] 完善所有聚会/订单相关页面

### 批次 3-9: 其他模块
- [ ] 用户与个人中心
- [ ] VIP 系统
- [ ] 社交与聊天
- [ ] 内容与社区
- [ ] 推送与通知
- [ ] 地图与位置
- [ ] 其他功能

### 批次 10: 组件与第三方库集成

### 批次 11: 测试与构建

---

## API 基地址
http://localhost:3000/api
