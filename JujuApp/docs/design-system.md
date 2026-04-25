# 聚聚 (JUJU) 设计系统 2026

> 聚会社交平台 - 发现身边的精彩聚会

## 品牌理念

**聚聚** —— 让每一次聚会都成为值得期待的相遇

- **温暖**: 像朋友邀请一样亲切
- **活力**: 充满派对能量的社交氛围
- **发现**: 探索身边有趣的人和活动

## 色彩系统

### 主色
```
聚聚红 (JUJU Red):     #FF4D6D  → 热情、活力、派对
聚聚粉 (JUJU Pink):    #FF8FA3  → 温暖、友好、亲切
聚聚紫 (JUJU Purple):  #7B61FF  → 夜生活、独特、高端
```

### 背景色
```
纯白背景: #FFFFFF       → 主背景，清爽干净
浅灰背景: #F8F9FA       → 卡片、输入框
米白背景: #FFF5F7       → 温暖氛围区域
深色背景: #1A1A2E       → 夜间模式（可选）
```

### 文字色
```
主文字:   #1A1A2E       → 标题、重要内容
次文字:   #6B7280       → 描述、辅助信息
禁用文字: #9CA3AF       → 禁用状态
反白文字: #FFFFFF       → 深色背景上的文字
```

### 功能色
```
成功绿:   #10B981       → 成功、已购票
警告黄:   #F59E0B       → 警告、即将售罄
错误红:   #EF4444       → 错误、取消
信息蓝:   #3B82F6       → 提示、链接
```

## 字体系统

### 字体选择
```
主字体: DM Sans (Google Fonts)
备用: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif

Google Fonts 链接:
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet">
```

### 字号规范
| 用途 | 大小 | 字重 | 行高 |
|-----|-----|-----|-----|
| 大标题 | 28px | 700 | 1.2 |
| 页面标题 | 24px | 700 | 1.3 |
| 卡片标题 | 18px | 600 | 1.4 |
| 正文 | 16px | 400 | 1.5 |
| 小字 | 14px | 400 | 1.5 |
| 标签 | 12px | 500 | 1.4 |

## 组件规范

### 按钮

**主按钮 (Primary)**
```css
background: linear-gradient(135deg, #FF4D6D 0%, #FF8FA3 100%);
color: #FFFFFF;
border-radius: 12px;
padding: 14px 24px;
font-weight: 600;
box-shadow: 0 4px 12px rgba(255, 77, 109, 0.3);
```

**次级按钮 (Secondary)**
```css
background: #FFFFFF;
color: #FF4D6D;
border: 2px solid #FF4D6D;
border-radius: 12px;
padding: 12px 22px;
font-weight: 600;
```

**圆形按钮 (Circular)**
```css
background: #FF4D6D;
width: 56px;
height: 56px;
border-radius: 50%;
box-shadow: 0 4px 16px rgba(255, 77, 109, 0.4);
```

### 卡片

**聚会卡片 (Party Card)**
```css
background: #FFFFFF;
border-radius: 20px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
overflow: hidden;
```

**VIP卡片**
```css
background: linear-gradient(135deg, #7B61FF 0%, #A78BFA 100%);
border-radius: 20px;
color: #FFFFFF;
```

### 输入框

**标准输入**
```css
background: #F8F9FA;
border: 2px solid transparent;
border-radius: 12px;
padding: 14px 16px;
font-size: 16px;

/* Focus状态 */
border-color: #FF4D6D;
background: #FFFFFF;
```

## 布局系统

### 间距
- 基础单位: 8px
- 常用间距: 8, 12, 16, 20, 24, 32, 40, 48

### 圆角
- 小圆角: 8px (按钮、输入框)
- 中圆角: 12px (小卡片)
- 大圆角: 20px (大卡片、图片)
- 圆形: 50% (头像、图标按钮)

### 阴影
```css
/* 轻微阴影 */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

/* 中等阴影 */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

/* 强调阴影 (主按钮) */
box-shadow: 0 4px 16px rgba(255, 77, 109, 0.3);

/* 悬浮阴影 */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
```

## 图标系统

使用 Phosphor Icons 或 Heroicons
- 线性风格
- 圆角端点
- 一致的字重

## 图片处理

### 聚会封面图
- 比例: 16:10
- 圆角: 16px
- 渐变遮罩: 底部渐变保证文字可读性

### 用户头像
- 圆形
- 边框: 3px solid #FFFFFF
- VIP标识: 金色边框 + 皇冠图标

## 动效规范

### 过渡时间
- 快速: 150ms (按钮点击)
- 标准: 250ms (页面切换)
- 慢速: 350ms (弹窗出现)

### 缓动函数
```css
/* 标准 */
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

/* 弹性 */
transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
```

## 页面模板

### 首页
- 顶部搜索栏 (白色卡片 + 阴影)
- 分类标签横向滚动
- 聚会卡片瀑布流/网格
- 底部导航栏

### 聚会详情
- 大图封面 (带渐变遮罩)
- 聚会信息卡片
- 票券选择区域
- 购票按钮 (固定在底部)

### 个人中心
- 用户信息头部 (渐变背景)
- 功能列表
- 设置入口

---

> 设计系统版本: v2.0
> 更新日期: 2026-04-09
> 适用于: 聚聚 APP v1.1+
