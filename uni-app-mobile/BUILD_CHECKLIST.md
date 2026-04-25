# 聚聚APP - HBuilderX安心打包配置清单

**打包日期**: 2026-03-25  
**版本**: v1.0.0  
**打包方式**: HBuilderX安心打包 (推荐)

---

## ✅ 配置检查清单

### 1. manifest.json ✅
```json
{
  "name": "聚聚",
  "appid": "__UNI__F311F19",
  "versionName": "1.0.0",
  "versionCode": "100",
  "app-plus": {
    "renderer": "webview",           // ✅ 已配置为webview
    "distribute": {
      "android": {
        "packagename": "com.juju.platform",  // ✅ 包名正确
        "abiFilters": ["armeabi-v7a", "arm64-v8a"],
        "minSdkVersion": 21,
        "targetSdkVersion": 36        // ✅ Android 16
      }
    }
  }
}
```

### 2. Android签名证书 ✅
| 项目 | 值 |
|------|-----|
| 证书文件 | `juju-release.keystore` |
| 别名 | `juju` |
| 密钥库密码 | `Zaqzzh521` |
| 密钥密码 | `Zaqzzh521` |
| SHA1 | `55:A4:40:0A:2A:2A:36:C3:47:9E:D1:BF:BD:DC:C4:D2:72:93:BD:3C` |

### 3. API配置 ✅
```javascript
// 使用服务器后端
const SERVER_API_URL = 'http://122.51.255.13:3010/api'
export const API_BASE_URL = SERVER_API_URL
```

### 4. 项目统计 ✅
- 页面数量: 47个
- 组件数量: 16个
- 依赖状态: 已安装
- 构建状态: 就绪

---

## 🚀 HBuilderX安心打包步骤

### 步骤1: 打开HBuilderX
```
1. 启动HBuilderX (建议4.0+版本)
2. 文件 → 导入 → 从本地目录导入
3. 选择: /Users/mac/.openclaw/workspace/juju-platform-all/uni-app-mobile
```

### 步骤2: 选择打包方式
```
菜单: 发行 → App-Android-安心打包
```

### 步骤3: 配置打包选项
| 选项 | 值 |
|------|-----|
| 包名 | `com.juju.platform` |
| 证书 | 使用自有证书 |
| 证书文件 | 选择 `juju-release.keystore` |
| 证书别名 | `juju` |
| 密钥库密码 | `Zaqzzh521` |
| 密钥密码 | `Zaqzzh521` |
| 打包类型 | Android APK |
| CPU类型 | arm64-v8a, armeabi-v7a |

### 步骤4: 开始打包
```
1. 点击"打包"按钮
2. 等待本地编译（约2-5分钟）
3. 生成APK文件
4. 下载APK到本地
```

---

## 📋 打包后验证

### 安装测试
```bash
# 安装到设备
adb install 聚聚-v1.0.0.apk

# 查看日志
adb logcat | grep juju
```

### 功能测试清单
- [ ] 应用正常启动
- [ ] 首页聚会列表显示
- [ ] 页面滑动流畅
- [ ] API数据获取正常
- [ ] 图片加载正常
- [ ] 页面跳转正常

---

## 🔧 常见问题

### Q1: 证书密码错误
**解决**: 确认密码是 `Zaqzzh521`（注意大小写）

### Q2: 打包失败
**解决**: 
1. 检查manifest.json格式
2. 确认所有依赖已安装
3. 清理node_modules重新安装

### Q3: AppKey错误
**解决**: 使用安心打包模式，不需要配置AppKey

### Q4: 应用启动白屏
**解决**: 确认renderer是webview不是auto

---

## 📦 发布准备

### 应用商店信息
| 项目 | 内容 |
|------|------|
| 应用名称 | 聚聚 |
| 应用简介 | 发现精彩聚会，结识志同道合的朋友 |
| 应用分类 | 社交/娱乐 |
| 目标用户 | 18-35岁年轻人 |
| 隐私政策 | 需要准备 |

### 应用截图（需要准备）
- [ ] 首页截图
- [ ] 聚会列表截图
- [ ] 聚会详情截图
- [ ] 个人中心截图
- [ ] 发布聚会截图

---

## 📞 技术支持

- **DCloud文档**: https://uniapp.dcloud.net.cn/
- **安心打包文档**: https://uniapp.dcloud.net.cn/tutorial/app-android-secure-pack.html
- **项目路径**: `/Users/mac/.openclaw/workspace/juju-platform-all/uni-app-mobile`

---

**状态**: ✅ 所有配置已就绪，可以开始打包！
