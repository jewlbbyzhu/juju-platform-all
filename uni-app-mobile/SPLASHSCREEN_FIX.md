# UniApp 启动页白屏问题 - 完整解决方案

## 问题分析

根据 DCloud 官方文档，启动页(splashscreen)有三种关闭策略：

1. **首页渲染完毕后自动关闭**: `alwaysShowBeforeRender: true` + `autoclose: true`
2. **首页加载完成后自动关闭**: `alwaysShowBeforeRender: false` + `autoclose: true`  
3. **代码手动控制关闭**: `alwaysShowBeforeRender: false` + `autoclose: false`

当前问题：`autoclose: false` 且代码关闭逻辑未正确执行。

## 最佳解决方案

### 方案一：使用官方推荐的自动关闭（最简单可靠）

修改 `manifest.json`：

```json
{
  "app-plus": {
    "splashscreen": {
      "alwaysShowBeforeRender": true,
      "waiting": true,
      "autoclose": true,
      "delay": 0
    }
  }
}
```

**优点**：
- 官方原生支持，最稳定
- 不需要额外代码
- 自动检测首页渲染状态

**缺点**：
- 如果首页渲染时间过长，启动页显示时间也会变长

---

### 方案二：手动控制 + 强制超时（当前已实施）

已在代码中添加：
1. `manifest.json`: `autoclose: false`
2. `App.vue`: 全局轮询检测
3. `pages/index/index.vue`: onReady 关闭启动页

**验证方式**：
- 重新云打包生成 APK
- 安装测试

---

### 方案三：延迟自动关闭（推荐作为备选）

```json
{
  "app-plus": {
    "splashscreen": {
      "alwaysShowBeforeRender": false,
      "waiting": false,
      "autoclose": true,
      "delay": 5000
    }
  }
}
```

设置5秒延迟，确保页面有足够时间加载。

---

## 立即执行计划

### 第一步：使用最可靠的方案重新打包

1. 修改 `manifest.json` 使用方案一配置
2. 删除 `App.vue` 和 `index.vue` 中的手动关闭代码（避免冲突）
3. 重新云打包
4. 测试验证

### 第二步：如果方案一不成功，使用方案三

设置5秒自动关闭延迟。

### 第三步：最后备选 - 自定义基座调试

使用 HBuilderX 自定义基座真机运行，查看具体错误。

---

## 当前已完成的修复

✅ `manifest.json`: 关闭自动关闭机制  
✅ `App.vue`: 添加全局轮询检测  
✅ `pages/index/index.vue`: onReady 关闭启动页  
✅ `axios` 依赖已添加  
✅ 所有依赖版本已统一

**下一步**：重新云打包并测试
