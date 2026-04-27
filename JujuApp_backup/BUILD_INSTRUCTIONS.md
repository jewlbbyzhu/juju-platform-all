# 🏗️ JUJU App v1.0.5 构建指南

**目标**: 构建新版APK (包含最新修复)  
**版本**: 1.0.5 (build 5)  
**最后更新**: 2026-04-07

---

## ⚠️ 当前环境状态

**当前环境**:
- ❌ Java未安装
- ✅ Android SDK已配置
- ✅ Gradle Wrapper存在
- ✅ 代码已更新

**结论**: 需要安装Java才能构建

---

## 🔧 方案1: 安装Java后构建 (推荐)

### 步骤1: 安装Java 17

```bash
# 使用Homebrew安装
brew install openjdk@17

# 添加到PATH
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 验证安装
java -version
```

### 步骤2: 运行构建脚本

```bash
cd ~/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp

# 给脚本执行权限
chmod +x scripts/build-and-test.sh

# 运行构建和测试
./scripts/build-and-test.sh
```

### 步骤3: 获取APK

构建完成后，APK位置:
```
./JujuApp-v1.0.5-YYYYMMDD-HHMM.apk
```

---

## 🖥️ 方案2: 使用Android Studio (图形界面)

### 步骤1: 打开项目

```bash
open ~/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp/android
```

### 步骤2: Android Studio构建

1. 等待Gradle同步完成
2. 点击菜单: **Build** → **Generate Signed Bundle/APK**
3. 选择: **APK**
4. 选择或创建签名密钥
5. 选择: **release** 版本
6. 点击 **Finish**

### 步骤3: 获取APK

APK位置:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## ⚡ 方案3: 快速测试 (使用现有APK)

如果暂时无法构建，可以使用**现有APK进行测试**:

```bash
cd ~/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp

# 现有APK位置
APK_PATH="android/app/build/outputs/apk/release/app-release.apk"

# 安装到设备
adb install -r $APK_PATH

# 启动应用
adb shell am start -n com.jujuapp/.MainActivity
```

**注意**: 现有APK可能不包含最新修复，建议尽快构建新版本。

---

## 📦 构建输出

### APK信息

| 属性 | 值 |
|------|-----|
| 版本号 | 1.0.5 |
| 版本代码 | 5 |
| 包名 | com.jujuapp |
| 目标SDK | 34 |
| 最小SDK | 24 (Android 7.0) |

### 构建产物

```
JujuApp/
├── android/app/build/outputs/apk/
│   ├── release/
│   │   └── app-release.apk     (原始构建输出)
│   └── debug/
│       └── app-debug.apk       (调试用)
│
└── JujuApp-v1.0.5-*.apk        (重命名的发布版)
```

---

## 🧪 构建后测试

### 自动测试脚本

```bash
# 运行完整测试
cd ~/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp
./scripts/build-and-test.sh

# 或仅运行测试
./scripts/monitor-production.sh
```

### 手动测试清单

- [ ] 应用能正常安装
- [ ] 启动无崩溃
- [ ] 5个Tab都能切换
- [ ] 首页数据显示
- [ ] 社区功能正常
- [ ] 无内存泄漏
- [ ] 性能流畅

---

## 🚀 发布流程

### 构建完成后

1. **重命名APK**
   ```bash
   cp android/app/build/outputs/apk/release/app-release.apk \
      JujuApp-v1.0.5-release.apk
   ```

2. **验证APK**
   ```bash
   # 检查签名
   apksigner verify JujuApp-v1.0.5-release.apk
   
   # 查看APK信息
   aapt dump badging JujuApp-v1.0.5-release.apk
   ```

3. **上传到分发平台**
   - 蒲公英
   - Firebase App Distribution
   - 应用商店

---

## 🔍 故障排除

### 问题1: Java版本不兼容

**症状**: 构建失败，提示Java版本错误

**解决**:
```bash
# 安装Java 17
brew install openjdk@17

# 设置JAVA_HOME
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
```

### 问题2: Gradle同步失败

**症状**: Android Studio中Gradle同步卡住

**解决**:
```bash
cd android
./gradlew clean
./gradlew build --refresh-dependencies
```

### 问题3: 签名错误

**症状**: 安装APK失败，提示签名不匹配

**解决**:
```bash
# 卸载旧版本
adb uninstall com.jujuapp

# 安装新版本
adb install -r app-release.apk
```

### 问题4: 内存不足

**症状**: 构建时OOM错误

**解决**:
```bash
# 增加Gradle内存
export GRADLE_OPTS="-Xmx4g -XX:MaxMetaspaceSize=512m"
```

---

## 📞 获取帮助

如果构建遇到问题:

1. 检查环境: `java -version`
2. 查看日志: `./gradlew assembleRelease --stacktrace`
3. 清理重建: `./gradlew clean`
4. 检查设备: `adb devices`

---

**推荐操作**: 先安装Java，然后运行 `./scripts/build-and-test.sh` 完成构建和测试。
