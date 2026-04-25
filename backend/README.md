# JuJu Party 聚聚平台统一后端

## 项目概述

JuJu Party 聚聚平台统一后端，为微信小程序、uni-app移动端、Web管理后台提供统一的API服务。

## 技术栈

- **运行环境**: Node.js (>=16.0.0)
- **框架**: Express (v4.18.2)
- **数据库**: MySQL 8.0+
- **ORM**: Sequelize (v6.35.0)
- **缓存**: Redis (v4.6.12)
- **认证**: JWT (jsonwebtoken v9.0.2)
- **验证**: Joi (v17.11.0)
- **日志**: Winston (v3.11.0)
- **支付**: 
  - 微信支付 (wechatpay-node-v3 v2.2.1)
  - 支付宝支付 (alipay-sdk v3.x)
- **API文档**: Swagger (swagger-jsdoc v6.2.8, swagger-ui-express v5.0.0)
- **开发工具**: Nodemon (v3.0.2)
- **测试**: Jest (v29.7.0), Supertest (v7.1.4)
- **安全**: Helmet (v7.1.0), CORS (v2.8.5), express-rate-limit (v7.1.5)

## 项目结构

```
backend/
├── src/
│   ├── config/          # 配置文件
│   ├── middleware/      # 中间件
│   ├── models/          # 数据模型
│   ├── controllers/     # 控制器
│   ├── services/        # 服务层
│   ├── routes/          # 路由
│   ├── utils/           # 工具函数
│   ├── validators/      # 验证器
│   ├── database/        # 数据库配置
│   └── logs/            # 日志文件
├── tests/
│   ├── unit/            # 单元测试
│   ├── integration/     # 集成测试
│   └── e2e/            # E2E测试
├── scripts/            # 脚本文件
├── docs/               # 文档
└── package.json
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 为 `.env` 并配置环境变量：

```bash
cp .env.example .env
```

### 运行开发服务器

```bash
npm run dev
```

### 运行生产服务器

```bash
npm start
```

## 开发命令

```bash
# 运行开发服务器
npm run dev

# 运行测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行代码检查
npm run lint

# 修复代码检查问题
npm run lint:fix

# 格式化代码
npm run format

# 运行数据库迁移
npm run migrate

# 填充初始数据
npm run seed

# 生成API文档
npm run generate-docs
```

## API文档

启动服务器后，访问以下地址查看API文档：

- Swagger UI: http://localhost:3000/api-docs

## 数据库模型

项目包含以下数据模型：

1. User - 用户
2. Party - 聚会
3. TicketType - 票型
4. Ticket - 票券
5. Order - 订单
6. OrderItem - 订单项
7. Payment - 支付
8. Refund - 退款
9. Wallet - 钱包
10. WalletTransaction - 钱包交易
11. BankCard - 银行卡
12. Favorite - 收藏
13. Notification - 通知
14. VIPMembership - VIP会员
15. Admin - 管理员
16. Role - 角色
17. Permission - 权限
18. AppVersion - App版本
19. SystemConfig - 系统配置

## 测试

### 单元测试

```bash
npm test tests/unit
```

### 集成测试

```bash
npm test tests/integration
```

### E2E测试

```bash
npm test tests/e2e
```

## 部署

### 环境要求

- Node.js >= 16.0.0
- MySQL 8.0+
- Redis 4.6+

### 部署步骤

1. 安装依赖：`npm install --production`
2. 配置环境变量：复制 `.env.example` 为 `.env.production` 并配置
3. 运行数据库迁移：`npm run migrate`
4. 启动服务：`npm start`

## 许可证

MIT
