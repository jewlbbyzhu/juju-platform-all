# UX测试验证报告 (2026-05-06)

**日期**: 2026-05-06
**状态**: 🔍 调查中
**执行时间**: 12:00 (调查)

---

## APK代码验证

### JS Bundle检查 (✅ 通过)

APK包含正确的BackHandler修复代码：

| 检查项 | 结果 | 说明 |
|--------|------|------|
| handleBackPress函数 | ✅ | 存在于bundle中 |
| hardwareBackPress事件 | ✅ | 1处出现 |
| Toast消息"请先登录以继续使用" | ✅ | UTF-16LE编码确认 |
| Toast消息"再按一次返回键退出" | ✅ | UTF-16LE编码确认 |
| navigationRef | ❌ | 变量名被minified |
| getState() | ✅ | 存在 |
| routes | ✅ | 存在 |
| 'Login'字符串 | ✅ | 存在 |

### AndroidManifest.xml检查

| 检查项 | 源码XML | APK二进制 |
|--------|---------|-----------|
| launchMode属性名 | ✅ singleTask | ✅ launchMode字符串存在 |
| singleTask属性值 | ✅ singleTask | ❌ **无法验证**（字符串未在二进制中找到） |

**二进制编码问题**: AAPT2可能将`android:launchMode="singleTask"`编码为二进制枚举值而非字符串。在AXML中：
- standard = 0
- singleTop = 1  
- singleTask = 2
- singleInstance = 3

虽然源码XML确认是`singleTask`，但二进制中找不到"singleTask"字符串，说明可能以数值2存储。**这需要专业工具（如androlib/AXMLPrinter2）验证**。

### API配置检查

| 检查项 | 状态 | 说明 |
|--------|------|------|
| LOCAL_API端口 | ✅ 3000 | ✅ bundle中包含3000端口 |
| REMOTE_API | ✅ api.hfparty.asia | ✅ bundle中包含正确域名 |

**注意**: `src/config/index.ts`在APK构建后被修改（端口18789→3000），但这不影响生产APK（生产使用REMOTE_API）。

---

## 历史UX测试结果分析

2026-05-06 06:00的UX测试报告显示：
- 截图 `ux_neon_10_back_nav_bug_060200.png` 显示按返回键后APP退出到Android桌面
- 这与BackHandler修复预期行为矛盾

**可能的解释**:
1. **单次测试局限**: 单次按返回键可能未触发完整的JS事件处理
2. **时序问题**: BackHandler在JS线程处理，如果用户在navigation状态更新前快速按返回键，系统默认处理仍会执行
3. **测试环境问题**: 模拟器环境可能与真实设备行为不同

---

## 结论

| 项目 | 状态 |
|------|------|
| BackHandler代码 | ✅ 已打包进APK |
| AndroidManifest singleTask | ⚠️ 源码确认，二进制未独立验证 |
| 登录页返回键拦截 | ⚠️ 代码正确但未能在UX测试中复现修复效果 |

**建议**: 
1. 需要在真实设备上重新测试，而非仅依赖模拟器
2. 考虑添加更robust的退出检测（基于activity lifecycle而非BackHandler）
3. 如果问题持续，考虑在MainActivity.java中添加onBackPressed()覆盖

---

## 修复验证命令

```bash
# 验证APK包含BackHandler代码
cd ~/.hermes/workspace/juju-platform-all/JujuApp_new
unzip -p android/app/build/outputs/apk/release/app-release.apk assets/index.android.bundle | grep -o "handleBackPress" | head -1
# 应输出: handleBackPress

# 验证AndroidManifest launchMode（需安装androlib）
# 或使用: aapt dump badging app-release.apk | grep launch
```
