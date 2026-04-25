# Uni-app Android 打包配置指南（2024-2025最新版）

**更新日期**: 2026-03-25  
**适用版本**: uni-app 3.x / HBuilderX 4.x

---

## 📋 重要更新

### ❌ 不再支持公共测试证书
- **旧方式**: DCloud公用测试证书（已废弃）
- **新方式**: 必须使用**自有证书**或**云证书**
- **推荐**: 使用**安心打包**模式（证书不上传）

---

## 🔐 证书配置

### 已生成证书
| 项目 | 值 |
|------|-----|
| 证书文件 | `juju-release.keystore` |
| 别名 (Alias) | `juju` |
| 密钥库密码 | `Zaqzzh521` |
| 密钥密码 | `Zaqzzh521` |
| 有效期 | 100年 (2026-2126) |
| SHA1指纹 | `55:A4:40:0A:2A:2A:36:C3:47:9E:D1:BF:BD:DC:C4:D2:72:93:BD:3C` |
| SHA256指纹 | `1B:52:2F:77:36:FA:B8:F6:58:9D:E8:AC:7C:8F:12:71:37:58:F1:54:18:83:60:E7:D4:A0:3E:F0:26:18:E2:CA` |

### 证书位置
```
/Users/mac/.openclaw/workspace/juju-platform-all/uni-app-mobile/juju-release.keystore
```

---

## 🚀 HBuilderX 云打包步骤

### 方式1: 安心打包（推荐）

```
1. 打开HBuilderX
2. 导入项目
3. 菜单: 发行 → App-Android-安心打包
4. 配置:
   - 包名: com.juju.platform
   - 证书: 选择本地 juju-release.keystore
   - 别名: juju
   - 密码: Zaqzzh521
5. 点击打包
```

**优点**:
- 证书不上传云端，本地签名
- 打包速度快
- 安全性高

### 方式2: 传统云打包

```
1. 菜单: 发行 → 原生App-云打包
2. 选择: Android (apk)
3. 证书: 使用自有证书
4. 上传: juju-release.keystore
5. 填写: 别名 juju, 密码 Zaqzzh521
6. 点击打包
```

---

## 📱 Manifest.json 关键配置

```json
{
  "appid": "__UNI__F311F19",
  "app-plus": {
    "renderer": "webview",  // 必须是webview，不能是auto
    "distribute": {
      "android": {
        "packagename": "com.juju.platform",
        "abiFilters": ["armeabi-v7a", "arm64-v8a"],
        "minSdkVersion": 21,
        "targetSdkVersion": 36
      }
    }
  }
}
```

---

## ⚠️ 常见问题

### Q1: AppKey错误
**原因**: 离线打包需要DCloud授权  
**解决**: 使用HBuilderX云打包

### Q2: 证书不匹配
**原因**: 证书与包名不匹配  
**解决**: 确保证书CN与包名一致

### Q3: 启动白屏
**原因**: renderer配置错误  
**解决**: 设置为"webview"

---

## 📦 打包后文件

| 文件 | 位置 |
|------|------|
| 证书 | `juju-release.keystore` |
| APK | HBuilderX下载目录 |
| 日志 | HBuilderX控制台 |

---

## 🔗 参考文档

- [DCloud安心打包文档](https://uniapp.dcloud.net.cn/tutorial/app-android-secure-pack.html)
- [Android证书生成指南](https://uniapp.dcloud.net.cn/tutorial/app-android-cert.html)
- [manifest配置说明](https://uniapp.dcloud.net.cn/collocation/manifest.html)

---

**下一步**: 在HBuilderX中使用"安心打包"模式打包
