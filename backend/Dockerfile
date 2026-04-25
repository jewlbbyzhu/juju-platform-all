# ==========================================
# JuJu Backend Dockerfile
# Node.js + Express + MySQL + Redis
# ==========================================

FROM node:18-alpine AS base

# 安装系统依赖
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    dumb-init

WORKDIR /app

# ==========================================
# 依赖安装阶段
# ==========================================
FROM base AS dependencies

COPY package*.json ./

# 安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# ==========================================
# 构建阶段
# ==========================================
FROM base AS builder

COPY package*.json ./
RUN npm ci

COPY . .

# ==========================================
# 生产运行阶段
# ==========================================
FROM base AS production

ENV NODE_ENV=production
ENV PORT=3010

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# 复制生产依赖
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/package.json ./

# 创建必要的目录
RUN mkdir -p logs uploads config certs && \
    chown -R nodejs:nodejs /app

# 切换到非root用户
USER nodejs

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3010/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

EXPOSE 3010

# 使用dumb-init处理信号
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
