JUJU App Bug修复完成
修复: 7个
状态: 全部修复
详情: /shared/artifacts/bugfix-2026-05-03.md

修复列表:
1. 🔴 tickets.js:81 缺少auth中间件 — 已添加auth
2. 🔴 ui-themes.js tag参数SQL校验 — 收紧正则+缩短长度+去掉引号包裹
3. 🟡 auth.js 明文密码迁移通道 — 彻底移除
4. 🟡 rateLimiter.js authLimiter — 5次→3次
5. 🟡 auth.js adminAuth硬编码ID — 改为环境变量TEST_ADMIN_ID
6. 🟡 bankCardService.js 固定IV — CBC→GCM+随机IV
7. 🟡 partyController.js 错误泄露 — 改为next(error)

未修复(4个低优先级):
- mockVerifyCodes Redis迁移
- socialController.js logger统一
- refunds.js/tickets.js 临时路由
- server.js CSP配置
