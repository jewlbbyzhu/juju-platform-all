# 聚聚官方网站

聚聚官方网站是一个基于 Next.js 14 构建的现代化官方网站，采用 App Router 架构，结合 Tailwind CSS 和 Framer Motion，提供高性能、SEO 友好的用户体验。

## 技术栈

- **框架**: Next.js 16.1.2 (App Router)
- **语言**: TypeScript 5.0+
- **样式**: Tailwind CSS 4.0+
- **动画**: Framer Motion 12.26+
- **状态管理**: Zustand 5.0+
- **表单**: React Hook Form 7.71+
- **验证**: Zod 4.3+
- **图标**: Lucide React 0.562+
- **工具**: clsx, tailwind-merge, class-variance-authority

## 项目结构

```
official-website/
├── src/
│   ├── app/                    # App Router 页面
│   │   ├── download/           # 下载页面
│   │   ├── help/               # 帮助中心
│   │   ├── login/              # 登录页面
│   │   ├── layout.tsx          # 根布局
│   │   ├── page.tsx            # 首页
│   │   ├── globals.css         # 全局样式
│   │   ├── sitemap.ts          # Sitemap
│   │   ├── robots.ts           # Robots.txt
│   │   ├── manifest.ts         # PWA Manifest
│   │   └── not-found.tsx       # 404页面
│   ├── components/             # 组件
│   │   ├── auth/               # 认证组件
│   │   ├── download/           # 下载组件
│   │   ├── dynamic/            # 动态导入组件
│   │   ├── error/              # 错误处理组件
│   │   ├── layout/             # 布局组件
│   │   ├── marketing/          # 营销组件
│   │   ├── seo/               # SEO组件
│   │   └── ui/                 # UI组件
│   ├── lib/                   # 工具库
│   │   ├── api.ts              # API 封装
│   │   ├── constants.ts        # 常量
│   │   └── utils.ts           # 工具函数
│   ├── store/                 # 状态管理
│   │   └── auth.ts            # 认证状态
│   └── types/                 # TypeScript 类型
│       └── index.ts
├── public/                    # 静态资源
├── .env.example               # 环境变量示例
├── .env.development          # 开发环境变量
├── .env.production           # 生产环境变量
├── next.config.ts            # Next.js 配置
└── package.json
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看网站。

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

### 代码检查

```bash
npm run lint
```

## 功能特性

### 已实现

- ✅ 首页 (Hero, Features, PartyPreview)
- ✅ 下载页面 (PlatformSelector, DownloadButton, QRCode)
- ✅ 登录页面 (LoginForm)
- ✅ 帮助中心 (HelpPage)
- ✅ 布局组件 (Header, Footer)
- ✅ 认证系统 (Zustand 状态管理)
- ✅ SEO 优化 (Metadata, Open Graph, Sitemap, Robots.txt)
- ✅ 结构化数据 (JSON-LD)
- ✅ PWA Manifest
- ✅ 性能优化 (图片优化、动态导入、代码压缩)
- ✅ 响应式设计 (移动端、平板、桌面端)
- ✅ 动画效果 (Framer Motion)
- ✅ 错误处理 (404页面、错误边界、API错误处理)
- ✅ 环境变量配置

### 待实现

- ⏳ 帮助文档详情页
- ⏳ 搜索功能
- ⏳ 管理员 SSO 跳转完善
- ⏳ E2E 测试
- ⏳ 图片资源

## 环境变量

复制 `.env.example` 为 `.env.local` 并配置：

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_ADMIN_WEB_URL=http://localhost:5173
```

### 环境变量说明

- `NEXT_PUBLIC_BASE_URL`: 网站基础URL
- `NEXT_PUBLIC_BACKEND_API_URL`: 后端API地址
- `NEXT_PUBLIC_ADMIN_WEB_URL`: 管理后台地址（用于SSO跳转）

## API 集成

### 认证 API

- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/logout` - 用户登出
- `GET /api/v1/auth/me` - 获取当前用户信息

### 内容 API

- `GET /api/v1/parties/featured` - 获取热门聚会
- `GET /api/v1/help/articles` - 获取帮助文档
- `GET /api/v1/help/search` - 搜索帮助文档

## 部署

### Vercel 部署（推荐）

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量：
   - `NEXT_PUBLIC_BASE_URL`: `https://your-domain.com`
   - `NEXT_PUBLIC_BACKEND_API_URL`: `https://api.your-domain.com/api/v1`
   - `NEXT_PUBLIC_ADMIN_WEB_URL`: `https://admin.your-domain.com`
4. 自动部署

### Docker 部署

```bash
# 构建镜像
docker build -t juju-website .

# 运行容器
docker run -p 3000:3000 -e NEXT_PUBLIC_BASE_URL=https://your-domain.com juju-website
```

### 传统服务器部署

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 使用 PM2 启动
pm2 start npm --name "juju-website" -- start

# 或使用 Node.js 直接启动
NODE_ENV=production npm start
```

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 性能优化

### 图片优化

- 使用 AVIF 和 WebP 格式
- 响应式图片（srcset）
- 懒加载（lazy loading）
- 优先加载关键图片

### 代码优化

- 动态导入（Code Splitting）
- SWC 压缩
- 包优化（optimizePackageImports）
- React 严格模式

### 缓存策略

- 静态资源缓存
- API 响应缓存
- 浏览器缓存

## SEO 优化

### Meta 标签

- Title 和 Description
- Open Graph 标签
- Twitter Card 标签
- Canonical URL

### 结构化数据

- Organization Schema
- WebSite Schema
- BreadcrumbList Schema

### 搜索引擎优化

- Sitemap.xml
- Robots.txt
- PWA Manifest

## 测试

### 单元测试

```bash
npm run test
```

### E2E 测试

```bash
npm run test:e2e
```

### Lighthouse 测试

使用 Chrome DevTools 的 Lighthouse 进行性能测试，目标：
- Performance > 90
- SEO > 95
- Accessibility > 90
- Best Practices > 90

## 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证。
