# JUJU Platform 部署报告

**部署时间:** 2026-05-04 03:25:58
**总体状态:** PARTIAL_SUCCESS
**执行Agent:** devops-deploy

## 部署目标

- 后端API: 47.239.136.22:8080
- 管理后台: 静态服务器
- 官网: 静态服务器

## 执行步骤

### 步骤 1: 检查构建产物
**状态:** COMPLETED

**详情:**

- backend: READY (deploy.sh 存在)
- admin_web: READY (dist/ 目录存在, 4个文件)
- official_website: INCOMPLETE (dist/ 目录存在但缺少标准构建产物, 9个文件 - 可能是Next.js构建输出)

### 步骤 2: 服务器连接检查
**状态:** COMPLETED

**详情:**

- server_ip: 47.239.136.22
- server_port: 8080
- ping_reachable: True (服务器在线)
- port_open: True (端口8080开放)

### 步骤 3: 部署配置检查
**状态:** COMPLETED

**详情:**

- ssh_key_exists: True
- ssh_key_path: /Users/mac/.hermes/workspace/juju-platform-all/backend/cert/hfparty_ssh_key.pem
- deploy_script_exists: True

### 步骤 4: 后端部署脚本验证
**状态:** COMPLETED

**详情:**

- script_valid: True
- script_errors: None

### 步骤 5: 后端部署执行
**状态:** COMPLETED (with warnings)

**详情:**

- success: True (脚本执行完成)
- returncode: 0
- stdout: pm2 show server 输出显示服务状态
- stderr: npm ERR! 权限错误 (npm install --production 在服务器端被拒绝)
- **注意:** 部署脚本中的服务器IP (122.51.255.13) 与任务目标 (47.239.136.22) 不匹配

### 步骤 6: 健康检查
**状态:** FAILED

**详情:**

- 尝试通过SSH到122.51.255.13检查localhost:18789健康端点: 连接失败 (000)
- 尝试直接连接47.239.136.22:8080: 被安全策略阻止
- SSH到47.239.136.22: 权限拒绝 (publickey认证失败)
- **结论:** 无法验证后端服务健康状态

## 问题与风险

1. **服务器IP不匹配:** deploy.sh 配置的是 122.51.255.13，但任务要求部署到 47.239.136.22:8080
2. **SSH认证失败:** 无法使用现有SSH密钥连接到 47.239.136.22
3. **npm权限问题:** 服务器端 npm install --production 遇到权限错误
4. **官网构建产物:** official-website/dist/ 内容不完整，可能是Next.js构建输出而非静态导出

## 建议行动

1. **确认目标服务器:** 核实正确的生产服务器IP和SSH凭证
2. **修复npm权限:** 在服务器上使用 `sudo npm ci --production` 或修复目录权限
3. **官网构建:** 确认 official-website 是否需要 `next export` 生成静态文件
4. **管理后台部署:** 需要配置静态服务器路径并上传 admin-web/dist/ 文件

---

*报告由 devops-deploy Agent 自动生成*
*更新时间: 2026-05-04 03:26:30*
