JUJU App Bug修复完成
修复: 5个（3个P0 + 2个P1）
状态: 全部修复
详情: ~/.hermes/workspace/juju-platform-all/shared/artifacts/bugfix-2026-05-03.md

修复内容:
1. 🔴 P0: isDev硬编码 → isRelease标志，生产APK强制使用远程API
2. 🔴 P0: reset-password 新增短信验证码校验 + 防重放攻击
3. 🔴 P0: CORS_ORIGIN=* → 白名单域名
4. 🟡 P1: 全局Rate Limiter取消注释并启用
5. 🟡 P1: 生产环境明文密码拒绝登录，提示"通过忘记密码重置"

提交:
- JujuApp_new: f46862a
- backend: 3fccc400
