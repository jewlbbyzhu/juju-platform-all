JUJU App代码审查完成
状态: 有问题
发现: 17个问题（5严重/8中/4低）
详情: /shared/reviews/code-review-2026-05-03.md
关键发现:
1. encryption.js盐值未保存 - 加密后无法解密（P0）
2. server.js CORS配置被截断（P0）
3. mockVerifyCodes内存存储 + console.log泄露验证码（P1）
4. register路由验证码可选（P1）
5. authLimiter过于宽松 15分钟1000次（P1）
6. RN端process.env.NODE_ENV判断不可靠（P1）
7. mockApi被打包进APK（P1）
