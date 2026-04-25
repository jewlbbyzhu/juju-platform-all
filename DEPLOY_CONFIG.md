# JUJU 项目部署配置

## 服务器信息
- **IP**: 122.51.255.13
- **SSH端口**: 22
- **SSH用户**: ubuntu
- **SSH密钥**: ~/.openclaw.pre-migration/workspace/juju-platform-all/backend/cert/hfparty_ssh_key.pem
- **SSH密码**: Zaqzzh.521 (备用)

## 数据库配置
- **MySQL主机**: 122.51.255.13
- **MySQL端口**: 3306
- **数据库名**: hfparty_db_new
- **用户名**: hfparty_user
- **密码**: Zaqzzh.521

## Redis配置
- **Redis主机**: 122.51.255.13
- **Redis端口**: 6379
- **密码**: Zaqzzh.521

## 后端服务
- **本地开发**: http://localhost:3000
- **生产环境**: https://api.hfparty.asia
- **进程管理**: PM2
- **服务路径**: /opt/juju-platform/backend/

## SSH连接命令
```bash
ssh -i ~/.openclaw.pre-migration/workspace/juju-platform-all/backend/cert/hfparty_ssh_key.pem -o StrictHostKeyChecking=no -o IdentitiesOnly=yes ubuntu@122.51.255.13
```

## 重要发现
- SSH密钥文件名: hfparty_ssh_key.pem (不是 hfparty_ssh.pem)
- 必须使用 ubuntu 用户名
- 必须添加 -o IdentitiesOnly=yes 参数
- 服务器上运行着PM2管理的Node.js后端服务
