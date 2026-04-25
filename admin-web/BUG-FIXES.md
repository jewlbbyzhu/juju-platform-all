# Admin-Web Bug 修复记录

## 已修复的问题

### 1. 用户管理模块

#### 1.1 注册时间和最后登录时间显示问题 ✅
**问题**: 用户列表中注册时间和最后登录时间没有正常显示
**原因**: 表格列配置使用了驼峰命名 `createdAt` 和 `lastLoginAt`，但后端返回的是下划线命名 `created_at` 和 `last_login_at`
**修复**: 修改 `src/views/users/index.vue` 中的列配置
```typescript
// 修复前
{ prop: 'createdAt', label: '注册时间', ... }
{ prop: 'lastLoginAt', label: '最后登录', ... }

// 修复后
{ prop: 'created_at', label: '注册时间', ... }
{ prop: 'last_login_at', label: '最后登录', ... }
```

#### 1.2 用户详情地区显示问题 ✅
**问题**: 地区应该显示 province + city
**修复**: 修改 `src/views/users/detail.vue`
```vue
<!-- 修复前 -->
{{ userDetail.province || userDetail.city || '-' }}

<!-- 修复后 -->
{{ (userDetail.province && userDetail.city) ? `${userDetail.province} ${userDetail.city}` : (userDetail.province || userDetail.city || '-') }}
```

---

### 2. 聚会管理模块

#### 2.1 页面布局问题 ✅
**问题**: 聚会列表和审核页面顶部导航栏和左侧导航栏消失，标题和面包屑不显示
**原因**: 路由配置没有使用 AdminLayout 布局组件
**修复**: 修改路由配置文件
- `src/router/modules/party.ts`
- `src/router/modules/order.ts`
- `src/router/modules/system.ts`
- `src/router/modules/app.ts`

```typescript
// 修复前
{
  path: '/parties',
  component: () => import('@/views/parties/index.vue'),
  ...
}

// 修复后
{
  path: '/parties',
  component: () => import('@/layouts/AdminLayout.vue'),
  redirect: '/parties/list',
  children: [
    {
      path: 'list',
      component: () => import('@/views/parties/index.vue'),
      ...
    }
  ]
}
```

#### 2.2 审核页面状态显示问题 ✅
**问题**: 审核页面应该显示 audit_status 而不是聚会 status
**修复**: 修改 `src/views/parties/audit.vue`
```typescript
// 修复列配置
{ prop: 'audit_status', label: '审核状态', slot: 'auditStatus' }

// 添加审核状态显示函数
const getAuditStatusLabel = (status: PartyAuditStatus) => {
  const labels = {
    [PartyAuditStatus.PENDING]: '待审核',
    [PartyAuditStatus.APPROVED]: '已通过',
    [PartyAuditStatus.REJECTED]: '已拒绝'
  }
  return labels[status] || '未知'
}

const getAuditStatusTagType = (status: PartyAuditStatus) => {
  const types = {
    [PartyAuditStatus.PENDING]: 'warning',
    [PartyAuditStatus.APPROVED]: 'success',
    [PartyAuditStatus.REJECTED]: 'danger'
  }
  return types[status] || 'info'
}
```

#### 2.3 草稿状态筛选问题 ✅
**问题**: 草稿状态筛选没有正确识别
**原因**: `PartyStatus.DRAFT = 0`，在条件判断 `if (filterForm.status)` 中 0 被视为 false
**修复**: 修改 `src/views/parties/index.vue`
```typescript
// 修复前
if (filterForm.status) {
  params.status = filterForm.status
}

// 修复后
if (filterForm.status !== undefined) {
  params.status = filterForm.status
}
```

---

### 3. 财务管理模块

#### 3.1 银行卡显示问题 ✅
**问题**: 提现信息中银行卡显示 undefined
**修复**: 修改 `src/views/finance/index.vue`，添加安全判断
```vue
<template #default="{ row }">
  <div v-if="row.bankCard && row.bankCard.bankName && row.bankCard.cardNumber">
    <div>{{ row.bankCard.bankName }}</div>
    <div class="card-number">**** **** **** {{ row.bankCard.cardNumber.slice(-4) }}</div>
  </div>
  <div v-else-if="row.bank_card">
    <div>{{ row.bank_card.bank_name || '未知银行' }}</div>
    <div class="card-number">**** **** **** {{ (row.bank_card.card_number || '****').slice(-4) }}</div>
  </div>
  <div v-else class="text-gray">未绑定银行卡</div>
</template>
```

---

## 待修复/需要后端配合的问题

### 1. 用户管理模块

#### 1.1 VIP状态筛选问题
**问题**: VIP状态筛选没有正确识别VIP用户和普通用户
**状态**: 需要检查后端API是否正确支持按VIP状态筛选

#### 1.2 封禁用户提示 reason is not allowed
**问题**: 封禁用户时提示 "reason is not allowed"
**状态**: 需要后端确认 API 是否接受 reason 字段

#### 1.3 用户头像显示问题
**问题**: 用户列表和详情页头像没有正常显示
**状态**: 需要检查：
- 后端是否正确返回头像URL
- 头像URL是否可访问
- 是否需要默认头像

---

### 2. 聚会管理模块

#### 2.1 聚会详情封面图
**问题**: 聚会详情页的聚会图片没有正常显示
**状态**: 需要检查：
- 后端是否正确返回封面图URL
- 图片URL是否可访问

#### 2.2 审核通过提示 audit_status is required
**问题**: 审核通过聚会时提示 "audit_status is required"
**状态**: 需要后端确认 API 参数要求

---

### 3. 订单管理模块

#### 3.1 API错误
**问题**: 没有正确获取数据
**状态**: 需要检查：
- 后端API是否正常
- 请求参数是否正确
- 错误日志

---

### 4. 财务管理模块

#### 4.1 API错误
**问题**: 没有正确获取数据
**状态**: 需要检查后端API

#### 4.2 提现审核状态筛选
**问题**: 提现审核状态筛选有问题
**状态**: 需要检查后端是否支持按状态筛选

---

### 5. 内容管理模块

#### 5.1 Banner创建API错误
**问题**: 无法创建banner
**状态**: 需要检查：
- 后端API路径是否正确 `/content/banners`
- 请求参数格式
- 图片上传是否正常

#### 5.2 公告创建后显示问题
**问题**: 建立公告后没有正常显示
**状态**: 需要检查：
- 创建API是否成功
- 列表查询API是否正常

---

### 6. 系统设置和App管理

#### 6.1 页面显示问题
**问题**: 系统设置和App管理所有模块页面都没有正常显示
**状态**: 已修复路由配置，需要重新测试

---

## 测试检查清单

### 修复后需要测试的功能

- [ ] 用户列表日期显示
- [ ] 用户详情地区显示
- [ ] 聚会列表布局
- [ ] 聚会审核布局
- [ ] 聚会审核状态显示
- [ ] 草稿状态筛选
- [ ] 订单列表布局
- [ ] 财务银行卡显示
- [ ] 系统设置页面显示
- [ ] App管理页面显示

---

## 建议的后续优化

1. **统一API响应格式**: 确保所有API返回统一的数据格式
2. **错误处理优化**: 添加更详细的错误提示
3. **图片加载优化**: 添加默认图片和加载失败处理
4. **数据验证**: 前端提交数据前进行更严格的验证
5. **日志记录**: 添加前端错误日志收集
