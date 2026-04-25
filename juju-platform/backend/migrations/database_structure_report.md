# 数据库表结构对比报告

## 执行时间
- **日期**: 2026-01-15
- **数据库**: hfparty_db_new
- **设计文档**: data-models-final.md

---

## 1. User 表对比

### 设计文档要求
- id: BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- openid: VARCHAR(128) UNIQUE NOT NULL
- unionid: VARCHAR(128) UNIQUE NULL
- phone: VARCHAR(20) UNIQUE NULL
- email: VARCHAR(100) UNIQUE NULL
- nickname: VARCHAR(50) NOT NULL
- avatar: VARCHAR(500) NULL
- gender: TINYINT DEFAULT 0
- birthday: DATE NULL
- province: VARCHAR(50) NULL
- city: VARCHAR(50) NULL
- country: VARCHAR(50) NULL
- language: VARCHAR(20) DEFAULT 'zh_CN'
- status: TINYINT DEFAULT 1
- is_vip: BOOLEAN DEFAULT FALSE
- vip_expires_at: DATETIME NULL
- last_login_at: DATETIME NULL
- last_login_ip: VARCHAR(50) NULL
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE

### 实际数据库结构
- id: BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- openid: VARCHAR(128) UNIQUE NOT NULL
- nickname: VARCHAR(50) NULL
- role: ENUM('guest', 'authorized', 'admin', 'superadmin')
- avatar: VARCHAR(255) NULL
- gender: TINYINT NULL
- region: VARCHAR(50) NULL
- birthday: DATE NULL
- is_vip: TINYINT NOT NULL DEFAULT 0
- created_at: DATETIME NOT NULL
- updated_at: DATETIME NOT NULL
- last_login_at: DATETIME NULL
- partyCount: INT UNSIGNED NOT NULL DEFAULT 0
- rating: DECIMAL(3, 2) NULL DEFAULT 0.00

### 差异分析
| 字段 | 设计文档 | 实际数据库 | 状态 |
|------|----------|------------|------|
| id | ✅ | ✅ | 一致 |
| openid | ✅ | ✅ | 一致 |
| unionid | ✅ | ❌ 缺失 | 需要添加 |
| phone | ✅ | ❌ 缺失 | 需要添加 |
| email | ✅ | ❌ 缺失 | 需要添加 |
| nickname | ✅ | ✅ | 一致 |
| avatar | ✅ | ⚠️ 长度不一致 (500 vs 255) | 需要修改 |
| gender | ✅ | ✅ | 一致 |
| birthday | ✅ | ✅ | 一致 |
| province | ✅ | ❌ 缺失 | 需要添加 |
| city | ✅ | ❌ 缺失 | 需要添加 |
| country | ✅ | ❌ 缺失 | 需要添加 |
| language | ✅ | ❌ 缺失 | 需要添加 |
| status | ✅ | ❌ 缺失 | 需要添加 |
| is_vip | ✅ | ⚠️ 类型不一致 (BOOLEAN vs TINYINT) | 需要修改 |
| vip_expires_at | ✅ | ❌ 缺失 | 需要添加 |
| last_login_at | ✅ | ✅ | 一致 |
| last_login_ip | ✅ | ❌ 缺失 | 需要添加 |
| created_at | ✅ | ✅ | 一致 |
| updated_at | ✅ | ✅ | 一致 |
| role | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| region | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| partyCount | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| rating | ❌ 不应该存在 | ✅ 存在 | 需要删除 |

---

## 2. Wallet 表对比

### 设计文档要求
- id: BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- user_id: BIGINT UNSIGNED UNIQUE NOT NULL
- balance: DECIMAL(10, 2) NOT NULL DEFAULT 0.00
- frozen_balance: DECIMAL(10, 2) NOT NULL DEFAULT 0.00
- total_income: DECIMAL(10, 2) NOT NULL DEFAULT 0.00
- total_expense: DECIMAL(10, 2) NOT NULL DEFAULT 0.00
- password: VARCHAR(100) NULL
- status: TINYINT DEFAULT 1
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE

### 实际数据库结构
- ❌ 表不存在

### 差异分析
| 字段 | 设计文档 | 实际数据库 | 状态 |
|------|----------|------------|------|
| 整个表 | ✅ | ❌ 不存在 | 需要创建 |

---

## 3. BankCard 表对比

### 设计文档要求
- id: BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- user_id: BIGINT UNSIGNED NOT NULL
- card_number: VARCHAR(50) NOT NULL
- card_holder: VARCHAR(50) NOT NULL
- bank_name: VARCHAR(50) NOT NULL
- bank_code: VARCHAR(20) NULL
- phone: VARCHAR(20) NOT NULL
- is_default: BOOLEAN DEFAULT FALSE
- status: TINYINT DEFAULT 1
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE

### 实际数据库结构
- ❌ 表不存在

### 差异分析
| 字段 | 设计文档 | 实际数据库 | 状态 |
|------|----------|------------|------|
| 整个表 | ✅ | ❌ 不存在 | 需要创建 |

---

## 4. Party 表对比

### 设计文档要求
- id: BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- user_id: BIGINT UNSIGNED NOT NULL
- title: VARCHAR(200) NOT NULL
- description: TEXT NULL
- cover_image: VARCHAR(500) NULL
- images: JSON NULL
- category: VARCHAR(50) NOT NULL
- tags: JSON NULL
- start_time: DATETIME NOT NULL
- end_time: DATETIME NOT NULL
- location: VARCHAR(200) NOT NULL
- address: VARCHAR(500) NULL
- latitude: DECIMAL(10, 7) NULL
- longitude: DECIMAL(10, 7) NULL
- max_participants: INT UNSIGNED NOT NULL
- current_participants: INT UNSIGNED NOT NULL DEFAULT 0
- min_price: DECIMAL(10, 2) NOT NULL DEFAULT 0.00
- max_price: DECIMAL(10, 2) NOT NULL DEFAULT 0.00
- status: TINYINT DEFAULT 0
- audit_status: TINYINT DEFAULT 0
- audit_reason: VARCHAR(500) NULL
- view_count: INT UNSIGNED NOT NULL DEFAULT 0
- favorite_count: INT UNSIGNED NOT NULL DEFAULT 0
- is_featured: BOOLEAN DEFAULT FALSE
- is_hot: BOOLEAN DEFAULT FALSE
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE

### 实际数据库结构
- id: BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- organizer_id: BIGINT UNSIGNED NULL
- vip_id: BIGINT UNSIGNED NULL
- ticket_type_id: BIGINT UNSIGNED NULL
- title: VARCHAR(255) NOT NULL
- description: TEXT NULL
- image1_path: VARCHAR(255) NULL
- image2_path: VARCHAR(255) NULL
- image3_path: VARCHAR(255) NULL
- image4_path: VARCHAR(255) NULL
- image5_path: VARCHAR(255) NULL
- start_time: DATETIME NOT NULL
- end_time: DATETIME NOT NULL
- province: VARCHAR(50) NULL
- city: VARCHAR(50) NULL
- address: VARCHAR(255) NULL
- latitude: DECIMAL(10, 7) NULL
- longitude: DECIMAL(10, 7) NULL
- max_participants: INT UNSIGNED NOT NULL
- current_participants: INT UNSIGNED NOT NULL DEFAULT 0
- status: ENUM('draft', 'ongoing', 'ended', 'cancelled') DEFAULT 'draft'
- earlybird_deadline: DATETIME NULL
- registration_deadline: DATETIME NULL
- gender_restriction: TINYINT NOT NULL DEFAULT 0
- min_age: TINYINT NULL
- max_age: TINYINT NULL
- created_at: DATETIME NOT NULL
- updated_at: DATETIME NOT NULL
- category: TINYINT NOT NULL DEFAULT 0
- tags: JSON NULL

### 差异分析
| 字段 | 设计文档 | 实际数据库 | 状态 |
|------|----------|------------|------|
| id | ✅ | ✅ | 一致 |
| user_id | ✅ | ❌ 缺失 (organizer_id) | 需要修改 |
| title | ✅ | ⚠️ 长度不一致 (200 vs 255) | 需要修改 |
| description | ✅ | ✅ | 一致 |
| cover_image | ✅ | ❌ 缺失 | 需要添加 |
| images | ✅ | ❌ 缺失 | 需要添加 |
| category | ✅ | ⚠️ 类型不一致 (VARCHAR(50) vs TINYINT) | 需要修改 |
| tags | ✅ | ✅ | 一致 |
| start_time | ✅ | ✅ | 一致 |
| end_time | ✅ | ✅ | 一致 |
| location | ✅ | ❌ 缺失 | 需要添加 |
| address | ✅ | ⚠️ 长度不一致 (500 vs 255) | 需要修改 |
| latitude | ✅ | ✅ | 一致 |
| longitude | ✅ | ✅ | 一致 |
| max_participants | ✅ | ✅ | 一致 |
| current_participants | ✅ | ✅ | 一致 |
| min_price | ✅ | ❌ 缺失 | 需要添加 |
| max_price | ✅ | ❌ 缺失 | 需要添加 |
| status | ✅ | ⚠️ 类型不一致 (TINYINT vs ENUM) | 需要修改 |
| audit_status | ✅ | ❌ 缺失 | 需要添加 |
| audit_reason | ✅ | ❌ 缺失 | 需要添加 |
| view_count | ✅ | ❌ 缺失 | 需要添加 |
| favorite_count | ✅ | ❌ 缺失 | 需要添加 |
| is_featured | ✅ | ❌ 缺失 | 需要添加 |
| is_hot | ✅ | ❌ 缺失 | 需要添加 |
| created_at | ✅ | ✅ | 一致 |
| updated_at | ✅ | ✅ | 一致 |
| organizer_id | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| vip_id | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| ticket_type_id | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| image1_path | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| image2_path | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| image3_path | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| image4_path | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| image5_path | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| province | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| city | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| earlybird_deadline | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| registration_deadline | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| gender_restriction | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| min_age | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| max_age | ❌ 不应该存在 | ✅ 存在 | 需要删除 |

---

## 5. TicketType 表对比

### 设计文档要求
- id: BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- party_id: BIGINT UNSIGNED NOT NULL
- name: VARCHAR(100) NOT NULL
- description: TEXT NULL
- price: DECIMAL(10, 2) NOT NULL
- original_price: DECIMAL(10, 2) NULL
- quantity: INT UNSIGNED NOT NULL DEFAULT 0
- sold_quantity: INT UNSIGNED NOT NULL DEFAULT 0
- max_per_user: INT UNSIGNED NOT NULL DEFAULT 0
- sale_start_time: DATETIME NULL
- sale_end_time: DATETIME NULL
- status: TINYINT DEFAULT 1
- sort_order: INT UNSIGNED NOT NULL DEFAULT 0
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE

### 实际数据库结构
- id: BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- party_id: BIGINT UNSIGNED NOT NULL
- ticket_type: TINYINT NOT NULL
- normal_ticket: BIGINT UNSIGNED NOT NULL
- man_ticket: BIGINT UNSIGNED NOT NULL
- woman_ticket: BIGINT UNSIGNED NOT NULL
- early_ticket: BIGINT UNSIGNED NOT NULL
- early_man: BIGINT UNSIGNED NOT NULL
- early_woman: BIGINT UNSIGNED NOT NULL

### 差异分析
| 字段 | 设计文档 | 实际数据库 | 状态 |
|------|----------|------------|------|
| id | ✅ | ✅ | 一致 |
| party_id | ✅ | ✅ | 一致 |
| name | ✅ | ❌ 缺失 | 需要添加 |
| description | ✅ | ❌ 缺失 | 需要添加 |
| price | ✅ | ❌ 缺失 | 需要添加 |
| original_price | ✅ | ❌ 缺失 | 需要添加 |
| quantity | ✅ | ❌ 缺失 | 需要添加 |
| sold_quantity | ✅ | ❌ 缺失 | 需要添加 |
| max_per_user | ✅ | ❌ 缺失 | 需要添加 |
| sale_start_time | ✅ | ❌ 缺失 | 需要添加 |
| sale_end_time | ✅ | ❌ 缺失 | 需要添加 |
| status | ✅ | ❌ 缺失 | 需要添加 |
| sort_order | ✅ | ❌ 缺失 | 需要添加 |
| created_at | ✅ | ❌ 缺失 | 需要添加 |
| updated_at | ✅ | ❌ 缺失 | 需要添加 |
| ticket_type | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| normal_ticket | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| man_ticket | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| woman_ticket | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| early_ticket | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| early_man | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| early_woman | ❌ 不应该存在 | ✅ 存在 | 需要删除 |

---

## 6. Order 表对比

### 设计文档要求
- id: BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- order_no: VARCHAR(50) UNIQUE NOT NULL
- user_id: BIGINT UNSIGNED NOT NULL
- party_id: BIGINT UNSIGNED NOT NULL
- total_amount: DECIMAL(10, 2) NOT NULL
- discount_amount: DECIMAL(10, 2) NOT NULL DEFAULT 0.00
- final_amount: DECIMAL(10, 2) NOT NULL
- payment_method: VARCHAR(20) NULL
- payment_status: TINYINT DEFAULT 0
- payment_time: DATETIME NULL
- status: TINYINT DEFAULT 0
- cancel_reason: VARCHAR(500) NULL
- cancel_time: DATETIME NULL
- remark: VARCHAR(500) NULL
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE

### 实际数据库结构
- id: BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- order_no: VARCHAR(50) UNIQUE NOT NULL
- user_id: BIGINT UNSIGNED NOT NULL
- party_id: BIGINT UNSIGNED NULL
- refund_id: BIGINT UNSIGNED NULL
- order_type: ENUM('ticket', 'service', 'package')
- order_name: TINYINT NOT NULL
- quantity: INT UNSIGNED NOT NULL
- unit_price: BIGINT NOT NULL
- amount: BIGINT NOT NULL
- status: ENUM('pending', 'paid', 'cancelled', 'refunded') DEFAULT 'pending'
- payment_method: VARCHAR(20) NULL
- registration_at: DATETIME NOT NULL
- paid_at: DATETIME NULL
- cancelled_at: DATETIME NULL
- updated_at: DATETIME NOT NULL

### 差异分析
| 字段 | 设计文档 | 实际数据库 | 状态 |
|------|----------|------------|------|
| id | ✅ | ✅ | 一致 |
| order_no | ✅ | ✅ | 一致 |
| user_id | ✅ | ✅ | 一致 |
| party_id | ✅ | ✅ | 一致 |
| total_amount | ✅ | ❌ 缺失 | 需要添加 |
| discount_amount | ✅ | ❌ 缺失 | 需要添加 |
| final_amount | ✅ | ❌ 缺失 | 需要添加 |
| payment_method | ✅ | ✅ | 一致 |
| payment_status | ✅ | ❌ 缺失 | 需要添加 |
| payment_time | ✅ | ❌ 缺失 | 需要添加 |
| status | ✅ | ⚠️ 类型不一致 (TINYINT vs ENUM) | 需要修改 |
| cancel_reason | ✅ | ❌ 缺失 | 需要添加 |
| cancel_time | ✅ | ❌ 缺失 | 需要添加 |
| remark | ✅ | ❌ 缺失 | 需要添加 |
| created_at | ✅ | ❌ 缺失 | 需要添加 |
| updated_at | ✅ | ✅ | 一致 |
| refund_id | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| order_type | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| order_name | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| quantity | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| unit_price | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| amount | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| registration_at | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| paid_at | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| cancelled_at | ❌ 不应该存在 | ✅ 存在 | 需要删除 |

---

## 7. Payment 表对比

### 设计文档要求
- id: BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- order_id: BIGINT UNSIGNED NOT NULL
- user_id: BIGINT UNSIGNED NOT NULL
- payment_no: VARCHAR(50) UNIQUE NOT NULL
- transaction_id: VARCHAR(100) NULL
- payment_method: VARCHAR(20) NOT NULL
- amount: DECIMAL(10, 2) NOT NULL
- status: TINYINT DEFAULT 0
- payment_time: DATETIME NULL
- callback_data: JSON NULL
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE

### 实际数据库结构
- ❌ 表不存在

### 差异分析
| 字段 | 设计文档 | 实际数据库 | 状态 |
|------|----------|------------|------|
| 整个表 | ✅ | ❌ 不存在 | 需要创建 |

---

## 8. Refund 表对比

### 设计文档要求
- id: BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- order_id: BIGINT UNSIGNED NOT NULL
- payment_id: BIGINT UNSIGNED NOT NULL
- user_id: BIGINT UNSIGNED NOT NULL
- refund_no: VARCHAR(50) UNIQUE NOT NULL
- refund_id: VARCHAR(100) NULL
- amount: DECIMAL(10, 2) NOT NULL
- reason: VARCHAR(500) NULL
- status: TINYINT DEFAULT 0
- audit_status: TINYINT DEFAULT 0
- audit_reason: VARCHAR(500) NULL
- refund_time: DATETIME NULL
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE

### 实际数据库结构
- ❌ 表不存在

### 差异分析
| 字段 | 设计文档 | 实际数据库 | 状态 |
|------|----------|------------|------|
| 整个表 | ✅ | ❌ 不存在 | 需要创建 |

---

## 9. Ticket 表对比

### 设计文档要求
- id: BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- user_id: BIGINT UNSIGNED NOT NULL
- order_id: BIGINT UNSIGNED NOT NULL
- ticket_type_id: BIGINT UNSIGNED NOT NULL
- party_id: BIGINT UNSIGNED NOT NULL
- ticket_code: VARCHAR(50) UNIQUE NOT NULL
- qr_code: VARCHAR(500) NULL
- status: TINYINT DEFAULT 0
- used_at: DATETIME NULL
- expires_at: DATETIME NULL
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE

### 实际数据库结构
- id: BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- ticket_no: VARCHAR(50) UNIQUE NOT NULL
- order_id: BIGINT UNSIGNED NOT NULL
- user_id: BIGINT UNSIGNED NOT NULL
- party_id: BIGINT UNSIGNED NOT NULL
- qr_code: VARCHAR(255) NULL
- status: ENUM('valid', 'used', 'refunded') DEFAULT 'valid'
- used_at: DATETIME NULL
- created_at: DATETIME NOT NULL
- updated_at: DATETIME NOT NULL
- code: VARCHAR(50) NULL

### 差异分析
| 字段 | 设计文档 | 实际数据库 | 状态 |
|------|----------|------------|------|
| id | ✅ | ✅ | 一致 |
| user_id | ✅ | ✅ | 一致 |
| order_id | ✅ | ✅ | 一致 |
| ticket_type_id | ✅ | ❌ 缺失 | 需要添加 |
| party_id | ✅ | ✅ | 一致 |
| ticket_code | ✅ | ❌ 缺失 (ticket_no) | 需要添加 |
| qr_code | ✅ | ⚠️ 长度不一致 (500 vs 255) | 需要修改 |
| status | ✅ | ⚠️ 类型不一致 (TINYINT vs ENUM) | 需要修改 |
| used_at | ✅ | ✅ | 一致 |
| expires_at | ✅ | ❌ 缺失 | 需要添加 |
| created_at | ✅ | ✅ | 一致 |
| updated_at | ✅ | ✅ | 一致 |
| ticket_no | ❌ 不应该存在 | ✅ 存在 | 需要删除 |
| code | ❌ 不应该存在 | ✅ 存在 | 需要删除 |

---

## 10. WalletTransaction 表对比

### 设计文档要求
- id: BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- user_id: BIGINT UNSIGNED NOT NULL
- wallet_id: BIGINT UNSIGNED NOT NULL
- type: VARCHAR(20) NOT NULL
- amount: DECIMAL(10, 2) NOT NULL
- balance_before: DECIMAL(10, 2) NOT NULL
- balance_after: DECIMAL(10, 2) NOT NULL
- transaction_type: VARCHAR(50) NOT NULL
- related_id: BIGINT UNSIGNED NULL
- description: VARCHAR(500) NULL
- status: TINYINT DEFAULT 1
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE

### 实际数据库结构
- ❌ 表不存在

### 差异分析
| 字段 | 设计文档 | 实际数据库 | 状态 |
|------|----------|------------|------|
| 整个表 | ✅ | ❌ 不存在 | 需要创建 |

---

## 11. VIPMembership 表对比

### 设计文档要求
- id: BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- user_id: BIGINT UNSIGNED NOT NULL
- membership_type: VARCHAR(20) NOT NULL
- start_date: DATE NOT NULL
- end_date: DATE NOT NULL
- status: TINYINT DEFAULT 1
- payment_id: BIGINT UNSIGNED NULL
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE

### 实际数据库结构
- ❌ 表不存在

### 差异分析
| 字段 | 设计文档 | 实际数据库 | 状态 |
|------|----------|------------|------|
| 整个表 | ✅ | ❌ 不存在 | 需要创建 |

---

## 12. Favorite 表对比

### 设计文档要求
- id: BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- user_id: BIGINT UNSIGNED NOT NULL
- party_id: BIGINT UNSIGNED NOT NULL
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE

### 实际数据库结构
- id: BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- user_id: BIGINT UNSIGNED NOT NULL
- party_id: BIGINT UNSIGNED NOT NULL
- created_at: DATETIME NOT NULL
- updated_at: DATETIME NOT NULL

### 差异分析
| 字段 | 设计文档 | 实际数据库 | 状态 |
|------|----------|------------|------|
| id | ✅ | ✅ | 一致 |
| user_id | ✅ | ✅ | 一致 |
| party_id | ✅ | ✅ | 一致 |
| created_at | ✅ | ⚠️ 缺少 DEFAULT | 需要修改 |
| updated_at | ✅ | ⚠️ 缺少 ON UPDATE | 需要修改 |

---

## 13. Notification 表对比

### 设计文档要求
- id: BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- user_id: BIGINT UNSIGNED NOT NULL
- type: VARCHAR(50) NOT NULL
- title: VARCHAR(200) NOT NULL
- content: TEXT NOT NULL
- data: JSON NULL
- is_read: BOOLEAN DEFAULT FALSE
- read_at: DATETIME NULL
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE

### 实际数据库结构
- ❌ 表不存在

### 差异分析
| 字段 | 设计文档 | 实际数据库 | 状态 |
|------|----------|------------|------|
| 整个表 | ✅ | ❌ 不存在 | 需要创建 |

---

## 14. Admin 表对比

### 设计文档要求
- id: BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- username: VARCHAR(50) UNIQUE NOT NULL
- password: VARCHAR(255) NOT NULL
- real_name: VARCHAR(50) NOT NULL
- email: VARCHAR(100) UNIQUE NOT NULL
- phone: VARCHAR(20) NOT NULL
- role_id: BIGINT UNSIGNED NOT NULL
- avatar: VARCHAR(500) NULL
- status: TINYINT DEFAULT 1
- last_login_at: DATETIME NULL
- last_login_ip: VARCHAR(50) NULL
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE

### 实际数据库结构
- ❌ 表不存在

### 差异分析
| 字段 | 设计文档 | 实际数据库 | 状态 |
|------|----------|------------|------|
| 整个表 | ✅ | ❌ 不存在 | 需要创建 |

---

## 15. Role 表对比

### 设计文档要求
- id: BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- name: VARCHAR(50) UNIQUE NOT NULL
- code: VARCHAR(50) UNIQUE NOT NULL
- description: VARCHAR(200) NULL
- permissions: JSON NOT NULL
- is_system: BOOLEAN DEFAULT FALSE
- status: TINYINT DEFAULT 1
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE

### 实际数据库结构
- ❌ 表不存在

### 差异分析
| 字段 | 设计文档 | 实际数据库 | 状态 |
|------|----------|------------|------|
| 整个表 | ✅ | ❌ 不存在 | 需要创建 |

---

## 16. Permission 表对比

### 设计文档要求
- id: BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- name: VARCHAR(100) NOT NULL
- code: VARCHAR(100) UNIQUE NOT NULL
- description: VARCHAR(200) NULL
- module: VARCHAR(50) NOT NULL
- parent_id: BIGINT UNSIGNED NULL
- sort_order: INT UNSIGNED NOT NULL DEFAULT 0
- is_system: BOOLEAN DEFAULT TRUE
- status: TINYINT DEFAULT 1
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE

### 实际数据库结构
- ❌ 表不存在

### 差异分析
| 字段 | 设计文档 | 实际数据库 | 状态 |
|------|----------|------------|------|
| 整个表 | ✅ | ❌ 不存在 | 需要创建 |

---

## 17. AppVersion 表对比

### 设计文档要求
- id: BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- platform: VARCHAR(20) NOT NULL
- version_code: INT UNSIGNED NOT NULL
- version_name: VARCHAR(20) NOT NULL
- download_url: VARCHAR(500) NOT NULL
- file_size: BIGINT UNSIGNED NOT NULL
- file_md5: VARCHAR(32) NOT NULL
- update_type: VARCHAR(20) DEFAULT 'optional'
- update_content: TEXT NOT NULL
- min_support_version: INT UNSIGNED NOT NULL
- status: TINYINT DEFAULT 1
- created_by: BIGINT UNSIGNED NOT NULL
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE

### 实际数据库结构
- ❌ 表不存在

### 差异分析
| 字段 | 设计文档 | 实际数据库 | 状态 |
|------|----------|------------|------|
| 整个表 | ✅ | ❌ 不存在 | 需要创建 |

---

## 18. SystemConfig 表对比

### 设计文档要求
- id: BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
- key: VARCHAR(100) UNIQUE NOT NULL
- value: TEXT NOT NULL
- description: VARCHAR(200) NULL
- type: VARCHAR(20) DEFAULT 'string'
- status: TINYINT DEFAULT 1
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE

### 实际数据库结构
- ❌ 表不存在

### 差异分析
| 字段 | 设计文档 | 实际数据库 | 状态 |
|------|----------|------------|------|
| 整个表 | ✅ | ❌ 不存在 | 需要创建 |

---

## 总结

### 需要创建的表（8个）
1. wallets
2. bank_cards
3. payments
4. refunds
5. wallet_transactions
6. vip_memberships
7. notifications
8. admins
9. roles
10. permissions
11. app_versions
12. system_configs

### 需要完全重构的表（3个）
1. ticket_type - 需要完全重构
2. parties - 需要大量修改
3. orders - 需要大量修改
4. tickets - 需要大量修改

### 需要部分修改的表（2个）
1. users - 需要添加和删除字段
2. favorites - 需要修改字段属性

### 主要问题
1. **表不存在** - 8个核心表不存在
2. **字段缺失** - 大量字段缺失
3. **字段类型不一致** - ENUM vs TINYINT
4. **字段长度不一致** - VARCHAR 长度不一致
5. **字段冗余** - 存在大量不应该存在的字段
6. **外键缺失** - 所有外键约束缺失
7. **索引缺失** - 大量索引缺失

### 建议
1. **创建新的迁移脚本** - 完全重构数据库结构
2. **数据迁移** - 保留现有数据，迁移到新结构
3. **分阶段执行** - 分多个阶段执行，降低风险
4. **充分测试** - 在测试环境充分测试
5. **备份** - 执行前完整备份数据库
