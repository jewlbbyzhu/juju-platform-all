# 飞书机器人图片权限配置指南

## 问题
飞书机器人无法发送图片消息

## 解决方案

### 步骤1: 登录飞书开放平台
1. 访问 https://open.feishu.cn/
2. 使用管理员账号登录
3. 找到您的机器人应用

### 步骤2: 添加图片权限
1. 进入 **应用能力** → **权限管理**
2. 添加以下权限：
   - `im:chat:send_message` (发送消息)
   - `im:message:send_image` (发送图片)
   - `im:message:send_file` (发送文件)

### 步骤3: 重新发布应用
1. 点击 **版本管理与发布**
2. 创建新版本
3. 提交审核（如果是企业内部应用，审核会立即通过）

### 步骤4: 验证配置
发送测试消息给机器人，检查是否能收到图片。

## 临时解决方案

如果暂时无法配置权限，可以使用以下方法查看截图：

### 方法1: HTTP服务器
```bash
cd ~/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp/screenshots
python3 -m http.server 8080
```
然后在浏览器访问 `http://localhost:8080`

### 方法2: SCP下载
```bash
scp -r mac@your-server:~/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp/screenshots/ ~/Downloads/juju-screenshots/
```

### 方法3: 直接打开
```bash
open ~/.openclaw.pre-migration/workspace/juju-platform-all/JujuApp/screenshots/
```
