#!/bin/bash
# MySQL setup script

# Create database
sudo mysql -u root -e "CREATE DATABASE IF NOT EXISTS juju_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Create user
sudo mysql -u root -e "CREATE USER IF NOT EXISTS 'juju_user'@'localhost' IDENTIFIED BY 'JujuPass123!';"

# Grant privileges
sudo mysql -u root -e "GRANT ALL PRIVILEGES ON juju_platform.* TO 'juju_user'@'localhost';"

# Flush privileges
sudo mysql -u root -e "FLUSH PRIVILEGES;"

# Show databases
sudo mysql -u root -e "SHOW DATABASES;"

echo "MySQL setup completed!"
