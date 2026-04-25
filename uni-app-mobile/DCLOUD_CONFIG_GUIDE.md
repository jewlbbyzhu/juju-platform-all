# DCloud开发者账号配置指南

**状态**: 已登录DCloud账号  
**AppID**: `__UNI__F311F19`  
**日期**: 2026-03-25

---

## 🔧 配置步骤

### 步骤1: 在DCloud开发者中心创建应用

```
1. 访问 https://dev.dcloud.net.cn/
2. 使用已登录的账号登录
3. 点击"我的应用" → "创建应用"
4. 填写应用信息:
   - 应用名称: 聚聚
   - AppID: __UNI__F311F19
   - 应用描述: 发现精彩聚会，结识志同道合的朋友
5. 点击"创建"
```

### 步骤2: 获取AppKey

```
1. 在应用详情页，找到"AppKey"
2. 复制AppKey（格式如: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx）
3. 这个AppKey需要配置到manifest.json中
```

### 步骤3: 配置manifest.json

需要在manifest.json中添加DCloud配置：

```json
{
  "name": "聚聚",
  "appid": "__UNI__F311F19",
  "description": "发现精彩聚会，结识志同道合的朋友",
  "versionName": "1.0.0",
  "versionCode": "100",
  
  // 添加DCloud配置
  "dcloud": {
    "appkey": "你的AppKey"
  },
  
  "app-plus": {
    "usingComponents": true,
    "nvueStyleCompiler": "uni-app",
    "compilerVersion": 3,
    "renderer": "webview",
    "runmode": "normal",
    "optimization": {
      "subPackages": true
    },
    "splashscreen": {
      "alwaysShowBeforeRender": true,
      "waiting": true,
      "autoclose": true,
      "delay": 0
    },
    "modules": {},
    "distribute": {
      "android": {
        "packagename": "com.juju.platform",
        "abiFilters": ["armeabi-v7a", "arm64-v8a"],
        "minSdkVersion": 21,
        "targetSdkVersion": 36,
        "permissions": [
          "<uses-permission android:name=\"android.permission.INTERNET\" />",
          "<uses-permission android:name=\"android.permission.ACCESS_NETWORK_STATE\" />",
          "<uses-permission android:name=\"android.permission.WRITE_EXTERNAL_STORAGE\" />",
          "<uses-permission android:name=\"android.permission.READ_EXTERNAL_STORAGE\" />",
          "<uses-permission android:name=\"android.permission.CAMERA\" />",
          "<uses-permission android:name=\"android.permission.ACCESS_FINE_LOCATION\" />"
        ]
      },
      "ios": {
        "dSYMs": false
      }
    }
  }
}
```

### 步骤4: 重新云打包

```
1. 在HBuilderX中保存manifest.json
2. 点击"发行" → "原生App-云打包"
3. 选择"Android (apk)"
4. 使用DCloud公用证书（或自有证书）
5. 点击"打包"
6. 等待打包完成，下载APK
```

---

## 📋 常见问题

### Q1: AppKey错误
**原因**: 
- manifest.json中没有配置dcloud.appkey
- 或者AppKey与appid不匹配

**解决**:
1. 在DCloud开发者中心获取正确的AppKey
2. 添加到manifest.json的dcloud配置中

### Q2: 包名不一致
**原因**: 
- manifest中packagename与DCloud配置不一致

**解决**:
1. 确保manifest中的packagename与DCloud应用配置一致
2. 或者在DCloud开发者中心修改应用包名

### Q3: 打包失败
**原因**: 
- 未登录DCloud账号
- 或者应用未在DCloud开发者中心创建

**解决**:
1. 在HBuilderX中登录DCloud账号
2. 在DCloud开发者中心创建对应应用

---

## 🔗 相关链接

- **DCloud开发者中心**: https://dev.dcloud.net.cn/
- **创建应用**: https://dev.dcloud.net.cn/app/index
- **获取AppKey**: 应用详情页 → AppKey

---

## ✅ 检查清单

- [ ] 已登录DCloud开发者中心
- [ ] 已创建应用，AppID为 `__UNI__F311F19`
- [ ] 已获取AppKey
- [ ] 已在manifest.json中配置dcloud.appkey
- [ ] 包名 `com.juju.platform` 与DCloud配置一致
- [ ] 重新云打包

---

**下一步**: 请在DCloud开发者中心创建应用并获取AppKey
