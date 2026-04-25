# HBuilderX 云打包配置指南

**项目**: 聚聚 (juju-platform-all)  
**日期**: 2026-03-25  
**打包方式**: 原生App-云打包 (Android APK)

---

## 准备工作

### 1. 安装HBuilderX
```bash
# 下载地址
https://www.dcloud.io/hbuilderx.html

# 安装后打开HBuilderX
```

### 2. 导入项目
```
文件 → 导入 → 从本地目录导入
选择: /Users/mac/.openclaw/workspace/juju-platform-all/uni-app-mobile
```

---

## 云打包步骤

### 步骤1: 配置manifest.json
确保以下配置正确:

```json
{
  "name": "聚聚",
  "appid": "__UNI__F311F19",
  "description": "发现精彩聚会，结识志同道合的朋友",
  "versionName": "1.0.0",
  "versionCode": "100",
  "app-plus": {
    "renderer": "webview",  // 重要: 必须是webview
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
      }
    }
  }
}
```

### 步骤2: 开始云打包

```
菜单: 发行 → 原生App-云打包
```

### 步骤3: 配置打包选项

| 选项 | 值 |
|------|-----|
| 平台 | Android (apk) |
| 包名 | com.juju.platform |
| 证书 | 使用DCloud公用测试证书 |
| 渠道 | 通用 |

### 步骤4: 等待打包完成

- 首次打包需要登录DCloud账号
- 打包时间约2-5分钟
- 完成后下载APK

---

## 配置检查清单

### manifest.json 关键配置
- [ ] `appid`: `__UNI__F311F19`
- [ ] `renderer`: `webview` (不是auto!)
- [ ] `packagename`: `com.juju.platform`
- [ ] `targetSdkVersion`: `36`

### 图标和启动图
- [ ] 配置应用图标 (1024x1024)
- [ ] 配置启动图 (1080x1920)

### 权限配置
- [ ] INTERNET
- [ ] ACCESS_NETWORK_STATE
- [ ] WRITE_EXTERNAL_STORAGE
- [ ] CAMERA
- [ ] ACCESS_FINE_LOCATION

---

## 常见问题

### Q1: 打包失败 - AppKey错误
**解决**: 确保使用云打包，不要离线打包

### Q2: 应用启动白屏
**解决**: 检查`renderer`是否为`webview`

### Q3: API请求失败
**解决**: 检查网络权限和域名白名单

### Q4: 证书错误
**解决**: 使用DCloud公用测试证书或上传自有证书

---

## 打包后测试

### 安装测试
```bash
adb install 聚聚-v1.0.0.apk
```

### 功能测试清单
- [ ] 应用正常启动
- [ ] 首页加载
- [ ] 聚会列表显示
- [ ] 页面导航
- [ ] API数据获取
- [ ] 图片加载

---

## 发布准备

### 正式证书 (推荐)
```
1. 生成Android签名证书
2. 在DCloud开发者中心上传证书
3. 使用自有证书打包
```

### 应用商店信息
- 应用名称: 聚聚
- 应用简介: 发现精彩聚会，结识志同道合的朋友
- 应用截图: 准备5张截图
- 隐私政策: 准备隐私政策链接

---

## 参考链接

- [DCloud云打包文档](https://uniapp.dcloud.net.cn/tutorial/app-android-cloud-pack.html)
- [Android证书生成指南](https://uniapp.dcloud.net.cn/tutorial/app-android-cert.html)
- [manifest配置说明](https://uniapp.dcloud.net.cn/collocation/manifest.html)

---

**当前项目路径**: `/Users/mac/.openclaw/workspace/juju-platform-all/uni-app-mobile`
