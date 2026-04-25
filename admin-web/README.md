# 聚聚管理后台

基于 Vue 3 + TypeScript + Element Plus 的现代化管理后台系统。

## 技术栈

- **前端框架**: Vue 3.4+ (Composition API)
- **类型系统**: TypeScript 5.0+
- **构建工具**: Vite 5.0+
- **UI组件库**: Element Plus 2.4+
- **状态管理**: Pinia 2.1+
- **路由管理**: Vue Router 4.2+
- **HTTP客户端**: Axios 1.6+
- **图表库**: ECharts 5.4+
- **代码规范**: ESLint + Prettier
- **测试框架**: Vitest + Vue Test Utils

## 项目结构

```
admin-web/
├── src/
│   ├── api/                    # API接口层
│   ├── assets/                 # 静态资源
│   ├── components/             # 公共组件
│   ├── composables/            # 组合式函数
│   ├── layouts/                # 布局组件
│   ├── router/                 # 路由配置
│   ├── stores/                 # Pinia状态管理
│   ├── types/                  # TypeScript类型
│   ├── utils/                  # 工具函数
│   └── views/                  # 页面视图
├── tests/                      # 测试文件
├── vite.config.ts             # Vite配置
├── tsconfig.json              # TypeScript配置
└── package.json               # 项目配置
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

### 运行测试

```bash
npm test
```

### 代码检查

```bash
npm run lint
```

### 代码格式化

```bash
npm run format
```

## 功能特性

- ✅ 现代化的 Vue 3 Composition API
- ✅ TypeScript 类型安全
- ✅ Element Plus UI 组件库
- ✅ Pinia 状态管理
- ✅ Vue Router 路由管理
- ✅ Axios HTTP 客户端
- ✅ ESLint + Prettier 代码规范
- ✅ Vitest 单元测试
- ✅ 响应式布局设计
- ✅ 暗黑模式支持
- ✅ 权限控制系统

## 环境变量

创建 `.env.local` 文件配置本地环境变量：

```bash
# API 基础地址
VITE_API_BASE_URL=http://localhost:3001/api/v1

# 应用标题
VITE_APP_TITLE=聚聚管理后台
```

## 部署

1. 构建生产版本：
   ```bash
   npm run build
   ```

2. 将 `dist` 目录部署到 Web 服务器

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

[MIT License](LICENSE)