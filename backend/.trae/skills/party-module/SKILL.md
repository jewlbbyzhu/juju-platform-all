---
name: "party-module"
description: "提供聚聚平台聚会模块API详情，包括聚会列表、详情、创建、审核。当用户询问聚会API、活动列表、聚会详情或聚会管理时调用。"
---

# 聚会模块 API Skill

## 使用范围
- 聚会列表和筛选
- 聚会详情查询
- 聚会创建和管理
- 聚会审核流程

## 内容边界
本Skill仅包含聚会模块API，不涉及：
- 订单相关功能（见 order-module Skill）
- 票券相关功能（见 ticket-module Skill）
- 数据模型定义（见 data-models Skill）

## 聚会状态

| 状态码 | 说明 |
|--------|------|
| -1 | 草稿 |
| 0 | 待审核 |
| 1 | 已发布 |
| 2 | 进行中 |
| 3 | 已结束 |
| 4 | 已取消 |

## API 端点 (V1)

### 获取聚会列表

```http
GET /api/v1/parties/published
```

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码，默认1 |
| pageSize | integer | 否 | 每页数量，默认20 |
| sortBy | string | 否 | 排序字段 |
| category | string | 否 | 分类筛选 |
| minPrice | integer | 否 | 最低价格(分) |
| maxPrice | integer | 否 | 最高价格(分) |
| latitude | float | 否 | 纬度 |
| longitude | float | 否 | 经度 |
| maxDistance | integer | 否 | 最大距离(米) |

**响应示例：**

```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "title": "周末聚会",
        "description": "聚会描述",
        "coverImage": "https://example.com/cover.jpg",
        "category": "社交",
        "startTime": "2026-02-15T14:00:00.000Z",
        "endTime": "2026-02-15T18:00:00.000Z",
        "location": "北京市朝阳区",
        "address": "详细地址",
        "latitude": 39.9042,
        "longitude": 116.4074,
        "minPrice": 9900,
        "maxPrice": 29900,
        "status": 1,
        "organizer": {
          "id": 1,
          "nickname": "组织者",
          "avatar": "https://example.com/avatar.jpg"
        },
        "statistics": {
          "viewCount": 100,
          "favoriteCount": 20,
          "participantCount": 15
        }
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### 获取聚会详情

```http
GET /api/v1/parties/:id
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "周末聚会",
    "description": "聚会详细描述",
    "coverImage": "https://example.com/cover.jpg",
    "images": ["https://example.com/1.jpg", "https://example.com/2.jpg"],
    "category": "社交",
    "startTime": "2026-02-15T14:00:00.000Z",
    "endTime": "2026-02-15T18:00:00.000Z",
    "registrationDeadline": "2026-02-14T12:00:00.000Z",
    "location": "北京市朝阳区",
    "address": "详细地址",
    "latitude": 39.9042,
    "longitude": 116.4074,
    "maxParticipants": 50,
    "minParticipants": 10,
    "minAge": 18,
    "maxAge": 45,
    "genderRestriction": 0,
    "status": 1,
    "organizer": {
      "id": 1,
      "nickname": "组织者",
      "avatar": "https://example.com/avatar.jpg",
      "isVip": true
    },
    "ticketTypes": [
      {
        "id": 1,
        "name": "早鸟票",
        "description": "早鸟优惠",
        "price": 9900,
        "originalPrice": 19900,
        "quantity": 20,
        "soldCount": 15,
        "maxPerUser": 2,
        "saleStartTime": "2026-01-01T00:00:00.000Z",
        "saleEndTime": "2026-02-14T12:00:00.000Z"
      }
    ],
    "statistics": {
      "viewCount": 100,
      "favoriteCount": 20,
      "likeCount": 50,
      "shareCount": 10,
      "participantCount": 15
    },
    "isFavorite": false
  }
}
```

### 搜索聚会

```http
GET /api/v1/parties/search?keyword=聚会&page=1&pageSize=20
```

### 获取我的聚会

```http
GET /api/v1/parties/my
Authorization: Bearer <token>
```

### 取消聚会

```http
POST /api/v1/parties/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "取消原因"
}
```

## API 端点 (V2)

### 创建聚会

```http
POST /api/v2/parties/
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "聚会标题",
  "description": "聚会描述",
  "coverImage": "https://example.com/cover.jpg",
  "images": ["https://example.com/1.jpg"],
  "category": "社交",
  "startTime": "2026-02-15T14:00:00.000Z",
  "endTime": "2026-02-15T18:00:00.000Z",
  "location": "北京市朝阳区",
  "address": "详细地址",
  "latitude": 39.9042,
  "longitude": 116.4074,
  "maxParticipants": 50,
  "minParticipants": 10,
  "ticketTypes": [
    {
      "name": "普通票",
      "description": "普通入场券",
      "price": 19900,
      "quantity": 30,
      "maxPerUser": 5
    }
  ]
}
```

### 审核聚会

```http
PUT /api/v2/parties/:id/audit
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": 1,
  "remark": "审核通过"
}
```

### 获取待审核聚会

```http
GET /api/v2/parties/pending
Authorization: Bearer <token>
```

### 获取聚会统计

```http
GET /api/v2/parties/stats
Authorization: Bearer <token>
```

## 错误码

| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| PARTY_NOT_FOUND | 404 | 聚会不存在 |
| PARTY_FULL | 400 | 聚会已满员 |
| PARTY_ALREADY_STARTED | 400 | 聚会已开始 |
| PARTY_ALREADY_ENDED | 400 | 聚会已结束 |
