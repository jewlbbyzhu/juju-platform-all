# ==========================================
# JuJu Admin Web Dockerfile
# Vite + React + TypeScript
# ==========================================

# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build

# 生产运行阶段 - 使用Nginx
FROM nginx:1.25-alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制Nginx配置
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
