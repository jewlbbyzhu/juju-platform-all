# Uni-app 完整知识库（2026最新版）

**持续更新中** - 第3批学习

---

## 第3批：uni-app架构深度解析

### 1. 渲染模式详解

#### WebView渲染（当前使用）
```json
{
  "app-plus": {
    "renderer": "webview"
  }
}
```
**优点**:
- 兼容性好
- 调试方便
- 生态丰富

**缺点**:
- 性能一般
- 内存占用高

#### Weex渲染（已废弃）
```json
{
  "app-plus": {
    "renderer": "native"
  }
}
```
**问题**:
- 初始化失败
- 维护成本高
- 已被官方放弃

#### uvue渲染（uni-app x）
```json
{
  "app-plus": {
    "renderer": "uvue"
  }
}
```
**优点**:
- 性能接近原生
- 内存占用低
- 支持鸿蒙

---

### 2. 文件类型全解析

| 扩展名 | 类型 | 用途 | 编译目标 |
|--------|------|------|----------|
| `.vue` | Vue单文件 | 页面/组件 | JS + CSS |
| `.uvue` | uni-app Vue | 高性能页面 | 原生代码 |
| `.uts` | uni-app TS | 跨平台逻辑 | 各平台原生 |
| `.scss` | Sass样式 | 样式预处理器 | CSS |
| `.css` | CSS样式 | 基础样式 | CSS |

#### uvue vs vue对比
```vue
<!-- .vue 文件 -->
<template>
  <view class="container">
    <text>{{title}}</text>
  </view>
</template>

<script>
export default {
  data() {
    return { title: 'Hello' }
  }
}
</script>
```

```uvue
<!-- .uvue 文件 -->
<template>
  <view class="container">
    <text>{{title}}</text>
  </view>
</template>

<script lang="uts">
// uts语法，编译为原生代码
export default {
  data() {
    return { title: 'Hello' }
  }
}
</script>
```

---

### 3. 平台适配策略

#### 条件编译
```vue
<template>
  <!-- #ifdef APP-PLUS -->
  <view>App端代码</view>
  <!-- #endif -->
  
  <!-- #ifdef H5 -->
  <view>H5端代码</view>
  <!-- #endif -->
  
  <!-- #ifdef MP-WEIXIN -->
  <view>微信小程序代码</view>
  <!-- #endif -->
</template>
```

#### 平台判断API
```javascript
// 获取平台信息
const systemInfo = uni.getSystemInfoSync()
console.log(systemInfo.platform) // ios, android, windows, mac, linux

// 判断当前平台
// #ifdef APP-PLUS
console.log('App端')
// #endif

// #ifdef H5
console.log('H5端')
// #endif
```

---

### 4. 性能优化最佳实践

#### 启动优化
```javascript
// 1. 分包加载
// pages.json
{
  "subPackages": [
    {
      "root": "pages/sub",
      "pages": [
        {"path": "sub-page1"},
        {"path": "sub-page2"}
      ]
    }
  ]
}

// 2. 预加载
{
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pages/sub"]
    }
  }
}
```

#### 渲染优化
```vue
<template>
  <!-- 使用v-if而不是v-show -->
  <view v-if="show">内容</view>
  
  <!-- 列表使用key -->
  <view v-for="(item, index) in list" :key="item.id">
    {{item.name}}
  </view>
  
  <!-- 图片懒加载 -->
  <image v-for="img in images" :src="img" lazy-load />
</template>
```

#### 内存优化
```javascript
// 及时销毁定时器
onUnload() {
  clearInterval(this.timer)
}

// 释放图片资源
onUnload() {
  this.imageList = []
}

// 停止监听
onUnload() {
  uni.offNetworkStatusChange(this.callback)
}
```

---

### 5. 原生插件开发

#### Android原生插件
```java
// 创建插件类
public class TestModule extends UniModule {
    @UniJSMethod(uiThread = true)
    public void testAsyncFunc(JSONObject options, UniJSCallback callback) {
        String value = options.getString("name");
        JSONObject data = new JSONObject();
        data.put("code", "success");
        data.put("value", value);
        callback.invoke(data);
    }
}
```

#### iOS原生插件
```objc
// 创建插件类
@interface TestModule : NSObject <WXModuleProtocol>
@end

@implementation TestModule
WX_EXPORT_METHOD(@selector(testAsyncFunc:callback:))

- (void)testAsyncFunc:(NSDictionary *)options callback:(WXModuleCallback)callback {
    NSString *value = options[@"name"];
    callback(@{@"code": @"success", @"value": value});
}
@end
```

---

### 6. 鸿蒙HarmonyOS适配

#### manifest配置
```json
{
  "app-plus": {
    "distribute": {
      "harmony": {
        "packageType": "stage",
        "minPlatformVersion": 5,
        "targetPlatformVersion": 5
      }
    }
  }
}
```

#### 鸿蒙特定API
```javascript
// 判断鸿蒙平台
// #ifdef HARMONY
console.log('鸿蒙系统')
// #endif

// 鸿蒙特定功能
uni.getHarmonySystemInfo({
  success: (res) => {
    console.log(res.deviceType) // phone, tablet, tv, wearable
  }
})
```

---

### 7. 安全与合规

#### 2026年合规要求
| 要求 | 说明 | 配置 |
|------|------|------|
| targetSdk >= 36 | Android 16 | `targetSdkVersion: 36` |
| 隐私政策 | 必须提供 | 配置隐私政策URL |
| 权限最小化 | 只申请必要权限 | 按需申请 |
| 数据加密 | 敏感数据加密 | HTTPS + 加密存储 |

#### 权限动态申请
```javascript
// 检查权限
uni.getSetting({
  success: (res) => {
    if (!res.authSetting['scope.camera']) {
      // 申请权限
      uni.authorize({
        scope: 'scope.camera',
        success: () => {
          console.log('授权成功')
        }
      })
    }
  }
})
```

---

### 8. 调试技巧

#### HBuilderX调试
```
1. 运行 → 运行到手机或模拟器
2. 使用Chrome DevTools调试
3. 查看控制台日志
```

#### 真机调试
```javascript
// 开启vconsole
// #ifdef H5
import VConsole from 'vconsole'
new VConsole()
// #endif

// 日志输出
console.log('普通日志')
console.warn('警告日志')
console.error('错误日志')
```

#### 性能分析
```javascript
// 页面性能
uni.getPerformance({
  success: (res) => {
    console.log('启动时间:', res.appLaunchTime)
    console.log('页面渲染时间:', res.pageRenderTime)
  }
})
```

---

**学习进度**: 第3批完成  
**下一批预告**: 插件生态、云服务、AI集成
