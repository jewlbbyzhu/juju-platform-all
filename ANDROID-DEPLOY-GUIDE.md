# JUJU Platform 安卓打包上架指南
# 创建时间: 2026-03-18

## 项目信息

- **应用名称**: 聚聚
- **AppID**: __UNI__F311F19
- **版本**: 1.0.0
- **包名**: uni.app.UNIJujuParty
- **证书**: juju-release-key.jks (已配置)

## 打包方式

### 方式1: HBuilderX云打包（推荐，最快）

1. **下载HBuilderX**
   - 官网: https://www.dcloud.io/hbuilderx.html

2. **导入项目**
   - 打开HBuilderX
   - 文件 → 导入 → 从本地目录导入
   - 选择: `~/.openclaw/workspace/juju-platform-all/uni-app-mobile`

3. **配置manifest.json**
   - 已配置完成
   - 应用名称: 聚聚
   - 版本: 1.0.0
   - 证书: juju-release-key.jks

4. **云打包**
   - 登录DCloud账号（需要注册）
   - 点击: 发行 → 原生App-云打包
   - 选择: Android(apk)
   - 证书: 使用自有证书
   - 等待打包完成（约5-10分钟）

### 方式2: 本地离线打包

1. **下载Android离线SDK**
   - https://nativesupport.dcloud.net.cn/AppDocs/download/android

2. **导入Android Studio**
   - 打开Android Studio
   - 导入离线SDK中的项目
   - 替换www目录为uni-app编译后的资源

3. **配置签名**
   - 使用juju-release-key.jks
   - 配置build.gradle

4. **生成APK**
   - Build → Generate Signed Bundle/APK

## 应用商店上架准备

### 必备材料

1. **应用图标**
   - 尺寸: 1024x1024px
   - 格式: PNG
   - 位置: `src/static/logo.png`

2. **应用截图**
   - 数量: 5-10张
   - 尺寸: 1080x1920px
   - 内容: 首页、活动列表、活动详情、个人中心等

3. **应用描述**
   ```
   聚聚 - 发现身边的精彩派对
   
   聚聚是一款专注于派对、聚会、活动社交的平台。
   无论你是想参加派对，还是组织活动，聚聚都能帮你找到志同道合的朋友。
   
   主要功能:
   - 发现附近的热门派对和活动
   - 一键报名参加感兴趣的活动
   - 创建自己的派对，邀请朋友参加
   - 实时聊天，认识新朋友
   - VIP会员特权，享受专属服务
   
   快来聚聚，开启你的精彩社交生活！
   ```

4. **隐私政策**
   - 需要准备隐私政策页面
   - 链接: https://hfparty.asia/privacy

5. **开发者账号**
   - 华为应用市场: https://developer.huawei.com/
   - 小米应用商店: https://dev.mi.com/
   - OPPO/vivo/应用宝等

## 上架流程

1. **注册开发者账号** (1-3天审核)
2. **准备上架材料**
3. **上传APK和资料**
4. **等待审核** (1-7天)
5. **上架成功**

## 当前状态

- ✅ 后端API: 运行中 (api.hfparty.asia)
- ✅ H5版本: 已部署 (hfparty.asia/h5/)
- ✅ 签名证书: 已配置
- ⏳ 安卓APK: 待打包
- ⏳ 应用商店: 待上架

## 下一步行动

1. 使用HBuilderX云打包生成APK
2. 准备应用商店上架材料
3. 注册开发者账号
4. 提交审核上架
