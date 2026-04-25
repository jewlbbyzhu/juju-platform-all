# JuJu Party 聚聚平台统一后端 - 项目总结

## 项目概述

JuJu Party 聚聚平台统一后端是一个基于Node.js的现代化后端服务，为微信小程序、uni-app移动端、Web管理后台提供统一的API服务。

## 技术栈

### 核心技术
- **运行环境**: Node.js (>=16.0.0)
- **Web框架**: Express (v4.18.2)
- **ORM**: Sequelize (v6.35.0)
- **数据库**: MySQL 8.0+
- **缓存**: Redis (v4.6.12)

### 认证和安全
- **JWT认证**: jsonwebtoken (v9.0.2)
- **数据验证**: Joi (v17.11.0)
- **安全**: Helmet (v7.1.0)
- **跨域**: CORS (v2.8.5)
- **限流**: express-rate-limit (v7.1.5)

### 支付集成
- **微信支付**: wechatpay-node-v3 (v2.2.1)
- **支付宝支付**: alipay-sdk (v3.x)

### 其他工具
- **日志**: Winston (v3.11.0)
- **密码加密**: bcrypt (v5.1.1)
- **API文档**: Swagger (swagger-jsdoc v6.2.8, swagger-ui-express v5.0.0)
- **开发工具**: Nodemon (v3.0.2)
- **测试**: Jest (v29.7.0), Supertest (v7.1.4)
- **代码规范**: ESLint (v8.55.0), Prettier (v3.1.1)

## 项目结构

```
backend/
├── src/
│   ├── config/          # 配置文件
│   │   ├── database.js    # 数据库配置
│   │   ├── redis.js       # Redis配置
│   │   └── jwt.js         # JWT配置
│   ├── middleware/      # 中间件
│   │   ├── clientIdentifier.js  # 客户端识别
│   │   ├── auth.js            # 认证中间件
│   │   ├── dataAdapter.js     # 数据适配
│   │   ├── errorHandler.js    # 错误处理
│   │   └── logger.js         # 日志记录
│   ├── models/          # 数据模型（19个）
│   │   ├── User.js
│   │   ├── Party.js
│   │   ├── TicketType.js
│   │   ├── Ticket.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   ├── Payment.js
│   │   ├── Refund.js
│   │   ├── Wallet.js
│   │   ├── WalletTransaction.js
│   │   ├── BankCard.js
│   │   ├── Favorite.js
│   │   ├── Notification.js
│   │   ├── VIPMembership.js
│   │   ├── Admin.js
│   │   ├── Role.js
│   │   ├── Permission.js
│   │   ├── AppVersion.js
│   │   ├── SystemConfig.js
│   │   └── index.js        # 模型关联
│   ├── controllers/     # 控制器（13个）
│   │   ├── userController.js
│   │   ├── partyController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── ticketController.js
│   │   ├── walletController.js
│   │   ├── bankCardController.js
│   │   ├── refundController.js
│   │   ├── settlementController.js
│   │   ├── favoriteController.js
│   │   ├── notificationController.js
│   │   ├── vipController.js
│   │   └── adminController.js
│   ├── services/        # 服务层（13个）
│   │   ├── userService.js
│   │   ├── partyService.js
│   │   ├── orderService.js
│   │   ├── paymentService.js
│   │   ├── ticketService.js
│   │   ├── walletService.js
│   │   ├── bankCardService.js
│   │   ├── refundService.js
│   │   ├── settlementService.js
│   │   ├── favoriteService.js
│   │   ├── notificationService.js
│   │   ├── vipService.js
│   │   └── adminService.js
│   ├── routes/          # 路由（v1和v2版本）
│   │   ├── v1/
│   │   │   ├── index.js
│   │   │   ├── users.js
│   │   │   ├── parties.js
│   │   │   ├── tickets.js
│   │   │   ├── orders.js
│   │   │   ├── payments.js
│   │   │   ├── wallet.js
│   │   │   ├── favorites.js
│   │   │   ├── notifications.js
│   │   │   └── vip.js
│   │   └── v2/
│   │       ├── index.js
│   │       ├── users.js
│   │       ├── parties.js
│   │       ├── tickets.js
│   │       ├── orders.js
│   │       ├── payments.js
│   │       ├── wallet.js
│   │       ├── bankcards.js
│   │       ├── refunds.js
│   │       ├── favorites.js
│   │       ├── notifications.js
│   │       ├── vip.js
│   │       ├── admin.js
│   │       ├── appversion.js
│   │       └── system.js
│   ├── validators/      # 数据验证器（9个）
│   │   ├── userValidator.js
│   │   ├── partyValidator.js
│   │   ├── orderValidator.js
│   │   ├── paymentValidator.js
│   │   ├── ticketValidator.js
│   │   ├── walletValidator.js
│   │   ├── bankCardValidator.js
│   │   ├── refundValidator.js
│   │   ├── vipValidator.js
│   │   └── adminValidator.js
│   ├── utils/           # 工具函数
│   │   └── logger.js
│   ├── database/        # 数据库配置
│   ├── logs/            # 日志文件
│   └── server.js        # 服务器入口
├── tests/              # 测试文件
│   ├── unit/            # 单元测试
│   ├── integration/     # 集成测试
│   └── e2e/            # E2E测试
├── scripts/            # 脚本文件
│   ├── migrate.js       # 数据库迁移
│   ├── seed.js         # 初始数据
│   └── generate-docs.js # 生成文档
├── docs/               # 文档
├── package.json
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── .gitignore
├── jest.config.js
└── README.md
```

## 核心功能模块

### 1. 用户管理模块
- 用户注册（微信OpenID/UnionID、手机号、邮箱）
- 用户登录
- 个人资料管理
- 用户列表查询（管理员）
- 用户详情查询
- 用户状态管理
- VIP状态管理

### 2. 聚会管理模块
- 聚会创建
- 聚会编辑
- 聚会删除
- 聚会列表查询（支持多维度筛选和排序）
- 聚会详情查询
- 聚会审核管理
- 聚会状态管理
- 我的聚会列表

### 3. 订单管理模块
- 订单创建
- 订单查询（订单ID、订单号）
- 订单列表查询
- 订单取消
- 退款申请
- 订单状态管理
- 票券生成

### 4. 支付集成模块
- 微信支付集成
- 支付宝支付集成
- 钱包支付
- 支付创建
- 支付回调处理
- 支付查询
- 退款处理

### 5. 票券管理模块
- 票券生成
- 票券查询（票券ID、票券码）
- 票券列表查询
- 票券验证
- 票券使用
- 票券失效
- 过期票券检查
- 票券统计

### 6. 钱包管理模块
- 钱包查询
- 钱包充值
- 钱包提现
- 钱包转账
- 交易记录查询
- 支付密码设置
- 余额冻结/解冻

### 7. 银行卡管理模块
- 银行卡添加
- 银行卡查询
- 银行卡编辑
- 银行卡删除
- 默认银行卡设置
- 银行卡信息加密存储

### 8. 退款管理模块
- 退款申请
- 退款查询
- 退款列表查询
- 退款审核
- 退款处理
- 退款统计

### 9. 结算管理模块
- 结算查询
- 结算处理
- 结算统计
- 聚会结算状态计算
- 结算金额计算（5%平台佣金，95%结算给组织者）

### 10. 收藏管理模块
- 收藏添加
- 收藏删除
- 收藏查询
- 收藏状态检查
- 收藏统计

### 11. 通知管理模块
- 通知创建
- 通知查询
- 通知列表查询
- 标记已读
- 全部标记已读
- 通知删除
- 未读数量查询
- 通知统计
- 订单通知
- 支付通知
- 退款通知
- 系统通知

### 12. VIP管理模块
- VIP购买（月卡、季卡、年卡）
- VIP查询
- VIP状态检查
- VIP续费
- VIP取消
- VIP特权查询
- 过期VIP检查

### 13. 管理员模块
- 管理员登录
- 管理员列表查询
- 管理员创建
- 管理员编辑
- 管理员删除
- 管理员状态管理
- 角色管理（CRUD）
- 权限管理（CRUD）

## 数据模型（19个）

### 核心业务模型
1. **User** - 用户表
2. **Party** - 聚会表
3. **TicketType** - 票型表
4. **Ticket** - 票券表
5. **Order** - 订单表
6. **OrderItem** - 订单项表
7. **Payment** - 支付表
8. **Refund** - 退款表

### 财务模型
9. **Wallet** - 钱包表
10. **WalletTransaction** - 钱包交易记录表
11. **BankCard** - 银行卡表

### 辅助功能模型
12. **Favorite** - 收藏表
13. **Notification** - 通知表
14. **VIPMembership** - VIP会员表

### 管理后台模型
15. **Admin** - 管理员表
16. **Role** - 角色表
17. **Permission** - 权限表
18. **AppVersion** - App版本表
19. **SystemConfig** - 系统配置表

## API版本设计

### V1 API（用户端）
- `/api/v1/users` - 用户管理
- `/api/v1/parties` - 聚会管理
- `/api/v1/tickets` - 票券管理
- `/api/v1/orders` - 订单管理
- `/api/v1/payments` - 支付管理
- `/api/v1/wallet` - 钱包管理
- `/api/v1/favorites` - 收藏管理
- `/api/v1/notifications` - 通知管理
- `/api/v1/vip` - VIP管理

### V2 API（管理端）
- `/api/v2/users` - 用户管理（管理员）
- `/api/v2/parties` - 聚会管理（管理员）
- `/api/v2/tickets` - 票券管理（管理员）
- `/api/v2/orders` - 订单管理（管理员）
- `/api/v2/payments` - 支付管理（管理员）
- `/api/v2/wallet` - 钱包管理（管理员）
- `/api/v2/bankcards` - 银行卡管理
- `/api/v2/refunds` - 退款管理（管理员）
- `/api/v2/favorites` - 收藏管理（管理员）
- `/api/v2/notifications` - 通知管理（管理员）
- `/api/v2/vip` - VIP管理（管理员）
- `/api/v2/admin` - 管理员管理
- `/api/v2/appversion` - App版本管理
- `/api/v2/system` - 系统管理（结算）

## 中间件系统

### 1. 客户端识别中间件
- 自动识别客户端类型（微信小程序、uni-app、Web管理后台）
- 根据User-Agent判断客户端

### 2. 认证中间件
- JWT Token验证
- 用户信息提取
- 管理员权限验证

### 3. 数据适配中间件
- 根据客户端类型自动适配数据格式
- 微信小程序：简化数据结构
- uni-app：增强数据结构
- Web管理后台：丰富数据结构

### 4. 限流中间件
- 基于IP的请求频率限制
- 可配置时间窗口和最大请求数

### 5. 错误处理中间件
- 统一错误处理
- 错误日志记录
- 友好的错误响应

### 6. 日志记录中间件
- 请求日志记录
- 响应时间统计
- 客户端信息记录

## 数据验证

所有API端点都使用Joi进行数据验证：
- 请求参数验证
- 数据类型验证
- 数据格式验证
- 业务规则验证

## 安全特性

1. **密码加密**: 使用bcrypt进行密码哈希
2. **JWT认证**: 基于Token的无状态认证
3. **SQL注入防护**: Sequelize ORM提供防护
4. **XSS防护**: Helmet提供安全头
5. **CORS配置**: 可配置的跨域策略
6. **限流保护**: 防止暴力攻击
7. **敏感数据加密**: 银行卡号等敏感信息加密存储

## 支付集成

### 微信支付
- 统一下单
- 支付回调处理
- 退款处理
- 支付状态查询

### 支付宝支付
- 统一下单
- 支付回调处理
- 退款处理
- 支付状态查询

### 钱包支付
- 余额扣减
- 交易记录
- 余额冻结/解冻

## VIP会员体系

### 会员价格
- **月卡**: 88元/月
- **季卡**: 188元/季
- **年卡**: 888元/年

### 普通用户权利
- 聚会发布数量限制（根据平台规则）每月仅能发布3条，需服务费
- 聚会审核正常处理（4-12小时审核时间）
- 享受95%结算比例
- 普通客服支持
- 无推荐位展示
- 无数据报告
- 无定制化服务

### 月卡VIP用户权利
- 聚会发布数量无限制
- 免费发布聚会名额2个，后续需服务费
- 聚会审核优先处理（2-4小时内审核完成）
- 享受97%结算比例
- 普通客服支持
- 聚会推荐位展示增加权重*1.2
- 月度数据报告

### 季卡VIP用户权利
- 聚会发布数量无限制
- 免费发布聚会名额3个，后续需服务费
- 聚会审核优先处理（2小时内审核完成）
- 享受98%结算比例
- 专属客服支持
- 聚会推荐位展示增加权重*1.8
- 月度数据报告

### 年卡VIP用户权利
- 聚会发布数量无限制
- 发布聚会无需服务费
- 聚会审核优先处理（2小时内审核完成）
- 享受98%结算比例
- 专属客服支持
- 聚会推荐位展示增加权重*2.5
- 月度数据报告
- 年度数据报告
- 定制化服务

## 结算规则

### 结算比例
- **普通用户**: 平台佣金5%，组织者结算95%
- **月卡VIP用户**: 平台佣金3%，组织者结算97%
- **季卡VIP用户**: 平台佣金2%，组织者结算98%
- **年卡VIP用户**: 平台佣金2%，组织者结算98%

### 结算条件
- 聚会状态：已结束（status=3）
- 时间条件：聚会结束后5天
- 订单状态：已支付（status=1）

### 结算方式
- 自动结算到组织者钱包
- 生成钱包交易记录
- 结算金额 = 订单总金额 × 结算比例

## 退款规则

### 退款申请
- 用户可发起极速退款
- 不需要填写退款原因
- 后端自动审核退款
- 退款金额不能超过订单金额

### 退款审核
- 状态：0-待审核，1-审核通过，2-审核拒绝
- 审核通过后才能处理退款
- 审核拒绝需要填写拒绝原因

### 退款时间限制
- 报名截止24小时前退款：平台佣金5%，退款用户95%
- 报名截止12小时前退款：平台佣金5%，退款用户80%，组织者15%
- 报名截止6小时前退款：平台佣金5%，退款用户70%，组织者25%

### 退款处理
- **微信支付退款**: 调用微信支付退款接口
- **支付宝退款**: 调用支付宝退款接口
- **钱包支付退款**: 直接退款到钱包，生成交易记录

### 退款状态
- 0-待审核
- 1-审核通过
- 2-审核拒绝
- 3-退款成功
- 4-退款失败

## 提现规则

### 提现条件
- 钱包余额必须大于提现金额
- 必须设置支付密码
- 必须绑定银行卡

### 提现流程
- 验证支付密码
- 扣减钱包余额
- 生成提现交易记录
- 提现到指定银行卡

### 提现限制
- 单次提现最低金额：1元
- 单次提现最高金额：10000元
- 每日提现次数限制：3次
- 每月提现金额限制：30000元

### 提现状态
- 待审核：提交后等待审核
- 处理中：正在处理提现
- 已完成：提现成功
- 已拒绝：提现被拒绝

## 开发命令

```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev

# 运行生产服务器
npm start

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

## 环境变量

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=juju_platform
DB_USER=root
DB_PASSWORD=your_password

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

WECHAT_PAY_MCHID=your_mchid
WECHAT_PAY_SERIAL_NO=your_serial_no
WECHAT_PAY_PRIVATE_KEY_PATH=./certs/wechat_pay_private_key.pem
WECHAT_PAY_API_V3_KEY=your_api_v3_key

ALIPAY_APP_ID=your_app_id
ALIPAY_PRIVATE_KEY=your_private_key
ALIPAY_PUBLIC_KEY=your_public_key

LOG_LEVEL=info
LOG_FILE_PATH=./logs

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## API文档

启动服务器后，访问以下地址查看API文档：
- Swagger UI: http://localhost:3000/api-docs

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

## 项目亮点

1. **统一后端架构**: 一套后端服务支持多端（微信小程序、uni-app、Web管理后台）
2. **客户端自适应**: 自动识别客户端并适配数据格式
3. **完善的权限体系**: 基于角色的权限管理系统
4. **多支付方式**: 支持微信支付、支付宝支付、钱包支付
5. **VIP会员体系**: 完善的会员等级和特权系统
6. **自动结算系统**: 聚会结束后自动结算给组织者
7. **完善的财务系统**: 钱包、银行卡、退款、结算全流程覆盖
8. **实时通知系统**: 支持多种类型的通知推送
9. **数据安全**: 敏感数据加密存储，完善的认证授权机制
10. **API文档**: 自动生成Swagger文档，方便前后端对接

## 后续优化建议

1. **性能优化**
   - 数据库查询优化
   - Redis缓存策略
   - API响应时间监控

2. **功能扩展**
   - 消息推送集成（微信模板消息、短信通知）
   - 数据分析报表
   - 聚会推荐算法
   - 用户行为分析

3. **运维监控**
   - 服务器性能监控
   - 错误告警机制
   - 日志分析系统

4. **安全加固**
   - API访问日志审计
   - 敏感操作二次验证
   - 数据备份策略

## 许可证

MIT
