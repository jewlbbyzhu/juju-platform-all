# Uni-app 完整知识库（2026最新版）

**持续更新中** - 第4批学习

---

## 第4批：插件生态与云服务

### 1. uniCloud云开发

#### 云函数
```javascript
// cloudfunctions/add/index.js
exports.main = async (event, context) => {
  const { a, b } = event
  return {
    code: 0,
    data: a + b,
    message: 'success'
  }
}

// 客户端调用
uniCloud.callFunction({
  name: 'add',
  data: { a: 1, b: 2 }
}).then(res => {
  console.log(res.result.data) // 3
})
```

#### 云数据库
```javascript
// 获取数据库引用
const db = uniCloud.database()

// 查询数据
db.collection('parties')
  .where({ status: 1 })
  .orderBy('createTime', 'desc')
  .limit(10)
  .get()
  .then(res => {
    console.log(res.data)
  })

// 添加数据
db.collection('parties').add({
  title: '周末聚会',
  location: '合肥',
  createTime: Date.now()
})

// 更新数据
db.collection('parties')
  .doc('document-id')
  .update({
    participants: db.command.inc(1)
  })
```

#### 云存储
```javascript
// 上传文件
uniCloud.uploadFile({
  filePath: 'temp://image.jpg',
  cloudPath: 'images/' + Date.now() + '.jpg'
}).then(res => {
  console.log(res.fileID)
})

// 下载文件
uniCloud.downloadFile({
  fileID: 'cloud://xxx.jpg'
}).then(res => {
  console.log(res.tempFilePath)
})
```

---

### 2. 官方插件市场

#### 常用插件
| 插件 | 功能 | 安装 |
|------|------|------|
| uni-ui | UI组件库 | `npm install @dcloudio/uni-ui` |
| uview-plus | UI框架 | `npm install uview-plus` |
| uni-id | 用户系统 | `npm install uni-id` |
| uni-pay | 支付系统 | `npm install uni-pay` |
| uni-map | 地图组件 | 官方内置 |

#### 使用uni-ui
```vue
<template>
  <view>
    <uni-card title="聚会信息" extra="详情">
      <view>周末户外徒步</view>
    </uni-card>
    
    <uni-button type="primary">立即报名</uni-button>
    
    <uni-list>
      <uni-list-item title="时间" rightText="2026-03-25" />
      <uni-list-item title="地点" rightText="大蜀山" />
    </uni-list>
  </view>
</template>

<script>
import uniCard from '@dcloudio/uni-ui/lib/uni-card/uni-card.vue'
import uniButton from '@dcloudio/uni-ui/lib/uni-button/uni-button.vue'
import uniList from '@dcloudio/uni-ui/lib/uni-list/uni-list.vue'
import uniListItem from '@dcloudio/uni-ui/lib/uni-list-item/uni-list-item.vue'

export default {
  components: { uniCard, uniButton, uniList, uniListItem }
}
</script>
```

---

### 3. 第三方SDK集成

#### 微信SDK
```javascript
// 登录
uni.login({
  provider: 'weixin',
  success: (res) => {
    console.log(res.code)
    // 发送到后端换取openid
  }
})

// 分享
uni.share({
  provider: 'weixin',
  scene: 'WXSceneSession',
  type: 0,
  title: '聚聚-发现精彩聚会',
  summary: '一起来参加周末聚会吧！',
  imageUrl: 'https://xxx.com/poster.jpg',
  href: 'https://xxx.com/party/123'
})

// 支付
uni.requestPayment({
  provider: 'wxpay',
  orderInfo: {
    appid: 'wx30d2dc92fd6e3145',
    noncestr: 'xxx',
    package: 'Sign=WXPay',
    partnerid: '1732803274',
    prepayid: 'xxx',
    timestamp: '1234567890',
    sign: 'xxx'
  },
  success: (res) => {
    console.log('支付成功')
  }
})
```

#### 支付宝SDK
```javascript
// 支付宝支付
uni.requestPayment({
  provider: 'alipay',
  orderInfo: 'orderStr=xxx&sign=xxx',
  success: (res) => {
    console.log('支付成功')
  }
})
```

#### 推送服务
```javascript
// 获取客户端推送标识
uni.getPushClientId({
  success: (res) => {
    console.log(res.cid)
    // 将cid发送到后端绑定用户
  }
})

// 监听推送消息
uni.onPushMessage((res) => {
  console.log('收到推送', res.data)
  uni.showModal({
    title: '新消息',
    content: res.data.title
  })
})
```

---

### 4. AI能力集成

#### uni-ai（2026新功能）
```javascript
// AI对话
uniCloud.callFunction({
  name: 'uni-ai',
  data: {
    messages: [
      { role: 'user', content: '推荐合肥的聚会地点' }
    ]
  }
}).then(res => {
  console.log(res.result.content)
})

// AI生成内容
uniCloud.callFunction({
  name: 'uni-cms-ai',
  data: {
    action: 'generate',
    type: 'article',
    prompt: '写一篇关于周末户外聚会的文章'
  }
})
```

#### 图像识别
```javascript
// 人脸识别（实名认证）
uni.verifyFacialRecognitionVerify({
  success: (res) => {
    console.log('验证成功', res.verifyResult)
  }
})
```

---

### 5. 广告变现

#### 激励视频广告
```javascript
// 创建广告实例
let rewardedVideoAd = null

// #ifdef APP-PLUS
rewardedVideoAd = uni.createRewardedVideoAd({
  adpid: 'your-adpid'
})

rewardedVideoAd.onLoad(() => {
  console.log('广告加载成功')
})

rewardedVideoAd.onError((err) => {
  console.log('广告加载失败', err)
})

rewardedVideoAd.onClose((res) => {
  if (res.isEnded) {
    console.log('用户完整观看广告')
    // 发放奖励
  }
})

// 显示广告
rewardedVideoAd.show()
// #endif
```

#### 插屏广告
```javascript
// #ifdef APP-PLUS
let interstitialAd = uni.createInterstitialAd({
  adpid: 'your-adpid'
})

interstitialAd.onLoad(() => {
  interstitialAd.show()
})
// #endif
```

---

### 6. 数据分析

#### 自定义统计
```javascript
// 页面访问统计
uni.report('page_view', {
  page: 'party_detail',
  party_id: '123'
})

// 按钮点击统计
uni.report('button_click', {
  button: 'join_party',
  party_id: '123'
})

// 错误上报
uni.report('error', {
  type: 'api_error',
  message: '请求失败',
  detail: error.message
})
```

#### 性能监控
```javascript
// 页面性能
uni.getPerformance({
  success: (res) => {
    console.log({
      appLaunchTime: res.appLaunchTime,
      pageRenderTime: res.pageRenderTime,
      firstPaintTime: res.firstPaintTime
    })
  }
})
```

---

### 7. 国际化(i18n)

#### 配置
```javascript
// main.js
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      hello: '你好',
      party: '聚会'
    },
    'en-US': {
      hello: 'Hello',
      party: 'Party'
    }
  }
})

app.use(i18n)
```

#### 使用
```vue
<template>
  <view>{{ $t('hello') }}</view>
  <view>{{ $t('party') }}</view>
  
  <!-- 切换语言 -->
  <button @click="changeLocale">切换语言</button>
</template>

<script>
export default {
  methods: {
    changeLocale() {
      const newLocale = this.$i18n.locale === 'zh-CN' ? 'en-US' : 'zh-CN'
      this.$i18n.locale = newLocale
      uni.setStorageSync('locale', newLocale)
    }
  }
}
</script>
```

---

### 8. 主题与暗黑模式

#### 配置
```json
// manifest.json
{
  "app-plus": {
    "darkmode": true
  }
}
```

#### 使用CSS变量
```scss
/* 定义主题色 */
:root {
  --primary-color: #ff6b35;
  --bg-color: #ffffff;
  --text-color: #333333;
}

/* 暗黑模式 */
@media (prefers-color-scheme: dark) {
  :root {
    --primary-color: #ff6b35;
    --bg-color: #1a1a1a;
    --text-color: #ffffff;
  }
}

/* 使用 */
.container {
  background-color: var(--bg-color);
  color: var(--text-color);
}
```

#### 监听主题变化
```javascript
// 监听系统主题变化
uni.onThemeChange((res) => {
  console.log('主题变化:', res.theme) // light | dark
  this.theme = res.theme
})
```

---

**学习进度**: 第4批完成  
**下一批预告**: 工程化、测试、发布流程
