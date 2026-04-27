# 🚀 JUJU App 生产发布指南 v1.0.5

**发布时间**: 2026-04-07  
**版本**: v1.0.5  
**状态**: 🔥 **直接冲生产**

---

## 📦 本次发布内容

### 修复问题
- ✅ **API 401错误** - 添加离线Mock模式，应用可正常运行
- ✅ **profileApi undefined** - 修复导入路径
- ✅ **社区Tab缺失** - 已添加到底部导航
- ✅ **测试模式** - 已关闭 (TEST_MODE=false)

### 版本更新
```
versionCode: 4 → 5
versionName: "1.0.4" → "1.0.5"
```

---

## 🔨 构建指令

### 方式1: Android Studio (推荐)

```bash
cd ~/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp

# 1. 打开Android Studio
open android/

# 2. 在Android Studio中:
#    Build → Generate Signed Bundle/APK → APK
#    选择 release 版本
#    使用签名密钥签名

# 3. 生成的APK位置:
#    android/app/build/outputs/apk/release/app-release.apk
```

### 方式2: 命令行 (需要Java环境)

```bash
cd ~/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp

# 设置Java环境
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

# 构建Release APK
cd android
./gradlew assembleRelease

# APK位置: app/build/outputs/apk/release/app-release.apk
```

---

## 📱 发布渠道

### 1. 直接分发 (最快)

```bash
# 重命名APK
cp android/app/build/outputs/apk/release/app-release.apk \
   JujuApp-v1.0.5-release.apk

# 上传到服务器或CDN
# 提供下载链接给用户
```

### 2. 应用商店

| 商店 | 状态 | 链接 |
|------|------|------|
| 应用宝 | 待提交 | |
| 华为应用市场 | 待提交 | |
| 小米应用商店 | 待提交 | |
| OPPO/vivo | 待提交 | |

### 3. 企业内部分发

```bash
# 使用蒲公英等内测分发平台
curl -F "file=@JujuApp-v1.0.5-release.apk" \
     -F "_api_key=YOUR_API_KEY" \
     https://www.pgyer.com/apiv2/app/upload
```

---

## 🛡️ 监控和回滚方案

### 实时监控

```bash
# 1. 崩溃监控 - Firebase Crashlytics
#    已配置在 android/app/build.gradle

# 2. 性能监控 - 手动检查
adb shell dumpsys meminfo com.jujuapp | grep TOTAL

# 3. 日志收集
adb logcat -s ReactNativeJS:V
```

### 回滚方案

**如果发现问题，立即执行**:

```bash
# 方式1: 热更新 (如果配置了CodePush)
# 发布修复版本，用户自动更新

# 方式2: 强制回滚
# 1. 下架当前版本
# 2. 重新发布 v1.0.4
# 3. 通知用户重新下载

# 方式3: 服务端开关
# 如果有远程配置，可以关闭新功能
```

### 紧急联系人

| 角色 | 联系方式 | 职责 |
|------|---------|------|
| 技术负责人 | | 技术问题处理 |
| 产品经理 | | 决策和功能调整 |
| 客服 | | 用户反馈收集 |

---

## ✅ 发布前最终检查清单

### 技术检查
- [ ] APK已签名
- [ ] 版本号正确 (1.0.5)
- [ ] 测试模式已关闭 (TEST_MODE=false)
- [ ] 离线模式已启用 (OFFLINE_MODE=true)
- [ ] 崩溃监控已配置

### 功能检查
- [ ] 应用能正常启动
- [ ] 5个Tab都能切换
- [ ] 首页聚会列表能显示
- [ ] 社区功能可用
- [ ] 个人中心能加载
- [ ] 无崩溃

### 运营准备
- [ ] 应用商店截图已准备
- [ ] 应用描述已更新
- [ ] 更新日志已准备
- [ ] 客服FAQ已更新

---

## 📊 发布后监控指标

### 关键指标 (1小时内)
- [ ] 崩溃率 < 1%
- [ ] 启动成功率 > 99%
- [ ] API错误率 < 5%

### 关键指标 (24小时内)
- [ ] 活跃用户正常增长
- [ ] 无重大功能故障
- [ ] 用户反馈无重大问题

---

## 🚨 应急预案

### 场景1: 大规模崩溃

```
1. 立即下架应用
2. 分析崩溃日志
3. 发布热修复版本
4. 通知用户更新
```

### 场景2: 支付异常

```
1. 关闭支付功能 (如果有远程开关)
2. 联系支付服务商
3. 发布修复版本
4. 补偿受影响用户
```

### 场景3: 数据丢失

```
1. 立即停止服务
2. 检查数据库备份
3. 恢复数据
4. 发布说明公告
```

---

## 📞 问题反馈渠道

| 渠道 | 说明 |
|------|------|
| 应用内反馈 | 设置 → 意见反馈 |
| 邮箱 | support@jujuapp.com |
| 微信客服 | JUJU客服 |
| 用户群 | 官方用户群 |

---

**发布确认**: 
- [ ] 已阅读本指南
- [ ] 已执行构建
- [ ] 已测试APK
- [ ] 准备发布

**发布时间**: 2026-04-07  
**发布人**: 

---

🔥 **祝发布顺利！**
