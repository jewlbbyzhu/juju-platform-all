/**
 * 完整的API验证模式定义
 * 使用Joi进行输入验证，防止安全漏洞
 */

const Joi = require('joi');
const { securityRules } = require('../middleware/securityValidator');

// 基础验证规则
const baseSchemas = {
  id: Joi.number().integer().positive(),
  uuid: Joi.string().uuid(),
  pagination: Joi.object({
    page: securityRules.page,
    pageSize: securityRules.pageSize,
    sortBy: securityRules.sortBy,
    sortOrder: securityRules.sortOrder
  }),
  clientInfo: Joi.object({
    type: securityRules.clientType,
    version: securityRules.version,
    platform: securityRules.platform,
    deviceId: securityRules.deviceId
  })
};

// 用户相关验证模式
const userSchemas = {
  // 用户注册
  register: Joi.object({
    nickname: securityRules.safeString.min(2).max(20).required(),
    phone: securityRules.phone.required(),
    password: securityRules.password.required(),
    gender: Joi.number().integer().valid(0, 1, 2).default(0), // 0=未设置, 1=男, 2=女
    birthday: Joi.date().max('now').optional(),
    region: securityRules.safeString.max(100).optional(),
    avatar: securityRules.url.optional(),
    inviteCode: Joi.string().alphanum().length(8).optional()
  }),

  // 用户登录
  login: Joi.object({
    phone: securityRules.phone.required(),
    password: securityRules.password.required(),
    clientInfo: baseSchemas.clientInfo.optional()
  }),

  // 微信登录
  wechatLogin: Joi.object({
    code: Joi.string().required(),
    encryptedData: Joi.string().optional(),
    iv: Joi.string().optional(),
    clientInfo: baseSchemas.clientInfo.optional()
  }),

  // 更新用户资料
  updateProfile: Joi.object({
    nickname: securityRules.safeString.min(2).max(20).optional(),
    gender: Joi.number().integer().valid(0, 1, 2).optional(),
    birthday: Joi.date().max('now').optional(),
    region: securityRules.safeString.max(100).optional(),
    avatar: securityRules.url.optional(),
    bio: securityRules.safeString.max(200).optional()
  }),

  // 修改密码
  changePassword: Joi.object({
    oldPassword: securityRules.password.required(),
    newPassword: securityRules.password.required()
  }),

  // 重置密码
  resetPassword: Joi.object({
    phone: securityRules.phone.required(),
    verificationCode: Joi.string().pattern(/^\d{6}$/).required(),
    newPassword: securityRules.password.required()
  }),

  // 绑定手机号
  bindPhone: Joi.object({
    phone: securityRules.phone.required(),
    verificationCode: Joi.string().pattern(/^\d{6}$/).required()
  })
};

// 聚会相关验证模式
const partySchemas = {
  // 创建聚会
  createParty: Joi.object({
    title: securityRules.safeString.min(5).max(100).required(),
    description: securityRules.safeString.min(10).max(2000).required(),
    startTime: Joi.date().greater('now').required(),
    endTime: Joi.date().greater(Joi.ref('startTime')).required(),
    registrationDeadline: Joi.date().max(Joi.ref('startTime')).required(),
    location: securityRules.safeString.min(5).max(200).required(),
    latitude: securityRules.latitude.required(),
    longitude: securityRules.longitude.required(),
    maxParticipants: Joi.number().integer().min(2).max(10000).required(),
    category: Joi.number().integer().valid(0, 1, 2, 3).required(), // 0=霓虹, 1=潮酷, 2=高级, 3=未来
    genderRestriction: Joi.number().integer().valid(0, 1, 2).default(0), // 0=无限制, 1=仅男性, 2=仅女性
    minAge: Joi.number().integer().min(16).max(100).optional(),
    maxAge: Joi.number().integer().min(Joi.ref('minAge')).max(100).optional(),
    tags: Joi.array().items(securityRules.safeString.max(20)).max(3).optional(),
    images: Joi.array().items(securityRules.url).min(1).max(5).required(),
    ticketMode: Joi.number().integer().valid(0, 1, 2, 3).required(),
    ticketTypes: Joi.array().items(Joi.object({
      type: Joi.number().integer().valid(1, 2, 3, 4, 5, 6).required(),
      price: securityRules.amount.required(),
      quantity: Joi.number().integer().min(1).max(10000).required()
    })).min(1).max(6).required(),
    earlyBirdDeadline: Joi.date().max(Joi.ref('registrationDeadline')).when('ticketMode', {
      is: Joi.valid(1, 3),
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  }),

  // 更新聚会
  updateParty: Joi.object({
    title: securityRules.safeString.min(5).max(100).optional(),
    description: securityRules.safeString.min(10).max(2000).optional(),
    startTime: Joi.date().greater('now').optional(),
    endTime: Joi.date().greater(Joi.ref('startTime')).optional(),
    registrationDeadline: Joi.date().max(Joi.ref('startTime')).optional(),
    location: securityRules.safeString.min(5).max(200).optional(),
    latitude: securityRules.latitude.optional(),
    longitude: securityRules.longitude.optional(),
    maxParticipants: Joi.number().integer().min(2).max(10000).optional(),
    genderRestriction: Joi.number().integer().valid(0, 1, 2).optional(),
    minAge: Joi.number().integer().min(16).max(100).optional(),
    maxAge: Joi.number().integer().min(Joi.ref('minAge')).max(100).optional(),
    tags: Joi.array().items(securityRules.safeString.max(20)).max(3).optional(),
    images: Joi.array().items(securityRules.url).min(1).max(5).optional()
  }),

  // 聚会查询
  queryParties: Joi.object({
    page: securityRules.page,
    pageSize: securityRules.pageSize,
    sortBy: securityRules.sortBy,
    sortOrder: securityRules.sortOrder,
    category: Joi.number().integer().valid(0, 1, 2, 3).optional(),
    genderRestriction: Joi.number().integer().valid(0, 1, 2).optional(),
    minPrice: securityRules.amount.optional(),
    maxPrice: securityRules.amount.optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().min(Joi.ref('startDate')).optional(),
    location: securityRules.safeString.max(100).optional(),
    latitude: securityRules.latitude.optional(),
    longitude: securityRules.longitude.optional(),
    radius: Joi.number().min(0.1).max(100).optional(), // 搜索半径(km)
    keyword: securityRules.safeString.max(50).optional(),
    tags: Joi.array().items(securityRules.safeString.max(20)).max(5).optional(),
    favoriteOnly: Joi.boolean().optional()
  }),

  // 聚会审核
  auditParty: Joi.object({
    status: Joi.string().valid('approved', 'rejected').required(),
    reason: securityRules.safeString.max(500).when('status', {
      is: 'rejected',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    adminNotes: securityRules.safeString.max(1000).optional()
  })
};

// 订单相关验证模式
const orderSchemas = {
  // 创建订单
  createOrder: Joi.object({
    type: Joi.string().valid('ticket', 'package', 'service_fee').required(),
    partyId: baseSchemas.id.when('type', {
      is: Joi.valid('ticket', 'service_fee'),
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    ticketType: Joi.number().integer().valid(1, 2, 3, 4, 5, 6).when('type', {
      is: 'ticket',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    quantity: Joi.number().integer().min(1).max(10).when('type', {
      is: 'ticket',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    packageType: Joi.string().valid('monthly', 'quarterly', 'yearly').when('type', {
      is: 'package',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    couponCode: Joi.string().alphanum().max(20).optional()
  }),

  // 订单查询
  queryOrders: Joi.object({
    page: securityRules.page,
    pageSize: securityRules.pageSize,
    sortBy: securityRules.sortBy,
    sortOrder: securityRules.sortOrder,
    status: Joi.string().valid('pending', 'paid', 'cancelled', 'refunded').optional(),
    type: Joi.string().valid('ticket', 'package', 'service_fee').optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().min(Joi.ref('startDate')).optional(),
    minAmount: securityRules.amount.optional(),
    maxAmount: securityRules.amount.optional()
  }),

  // 取消订单
  cancelOrder: Joi.object({
    reason: securityRules.safeString.max(200).optional()
  })
};

// 支付相关验证模式
const paymentSchemas = {
  // 发起支付
  initiatePayment: Joi.object({
    orderId: baseSchemas.id.required(),
    paymentMethod: Joi.string().valid('wechat', 'alipay', 'wallet').required(),
    clientInfo: baseSchemas.clientInfo.optional()
  }),

  // 支付回调验证
  paymentCallback: Joi.object({
    orderId: baseSchemas.id.required(),
    transactionId: Joi.string().required(),
    amount: securityRules.amount.required(),
    status: Joi.string().valid('success', 'failed').required(),
    signature: Joi.string().required(),
    timestamp: securityRules.timestamp.required()
  }),

  // 退款申请
  refundRequest: Joi.object({
    orderId: baseSchemas.id.required(),
    reason: securityRules.safeString.max(200).optional(),
    amount: securityRules.amount.optional() // 部分退款金额
  })
};

// 钱包相关验证模式
const walletSchemas = {
  // 钱包充值
  recharge: Joi.object({
    amount: securityRules.amount.min(100).max(100000000).required(), // 1元-100万元
    paymentMethod: Joi.string().valid('wechat', 'alipay').required(),
    clientInfo: baseSchemas.clientInfo.optional()
  }),

  // 钱包提现
  withdraw: Joi.object({
    amount: securityRules.amount.min(100).max(100000000).required(),
    bankCardId: baseSchemas.id.required(),
    password: securityRules.password.required()
  }),

  // 交易记录查询
  queryTransactions: Joi.object({
    page: securityRules.page,
    pageSize: securityRules.pageSize,
    sortBy: securityRules.sortBy,
    sortOrder: securityRules.sortOrder,
    type: Joi.string().valid('recharge', 'withdraw', 'payment', 'refund', 'income').optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().min(Joi.ref('startDate')).optional(),
    minAmount: securityRules.amount.optional(),
    maxAmount: securityRules.amount.optional()
  })
};

// 银行卡相关验证模式
const bankCardSchemas = {
  // 添加银行卡
  addBankCard: Joi.object({
    cardNumber: securityRules.bankCard.required(),
    holderName: securityRules.safeString.min(2).max(50).required(),
    bankName: securityRules.safeString.min(2).max(50).required(),
    cardType: Joi.string().valid('debit', 'credit').default('debit'),
    isDefault: Joi.boolean().default(false)
  }),

  // 更新银行卡
  updateBankCard: Joi.object({
    holderName: securityRules.safeString.min(2).max(50).optional(),
    bankName: securityRules.safeString.min(2).max(50).optional(),
    isDefault: Joi.boolean().optional()
  })
};

// VIP相关验证模式
const vipSchemas = {
  // VIP申请
  applyVip: Joi.object({
    packageType: Joi.string().valid('monthly', 'quarterly', 'yearly').required(),
    realName: securityRules.safeString.min(2).max(50).required(),
    idCard: securityRules.idCard.required(),
    phone: securityRules.phone.required()
  }),

  // VIP续费
  renewVip: Joi.object({
    packageType: Joi.string().valid('monthly', 'quarterly', 'yearly').required()
  })
};

// 收藏相关验证模式
const favoriteSchemas = {
  // 添加收藏
  addFavorite: Joi.object({
    partyId: baseSchemas.id.required()
  }),

  // 收藏查询
  queryFavorites: Joi.object({
    page: securityRules.page,
    pageSize: securityRules.pageSize,
    sortBy: securityRules.sortBy,
    sortOrder: securityRules.sortOrder
  })
};

// 文件上传验证模式
const fileSchemas = {
  // 图片上传
  uploadImage: Joi.object({
    type: Joi.string().valid('avatar', 'party', 'banner', 'document').required(),
    category: Joi.string().valid('user', 'party', 'system').optional()
  }),

  // 文档上传
  uploadDocument: Joi.object({
    type: Joi.string().valid('id_card', 'business_license', 'contract').required(),
    description: securityRules.safeString.max(200).optional()
  })
};

// 管理员相关验证模式
const adminSchemas = {
  // 管理员登录
  adminLogin: Joi.object({
    username: securityRules.username.required(),
    password: securityRules.password.required(),
    captcha: Joi.string().length(4).required(),
    clientInfo: baseSchemas.clientInfo.optional()
  }),

  // 创建管理员
  createAdmin: Joi.object({
    username: securityRules.username.required(),
    password: securityRules.password.required(),
    email: Joi.string().email().required(),
    realName: securityRules.safeString.min(2).max(50).required(),
    role: Joi.string().valid('admin', 'moderator', 'operator').required(),
    permissions: Joi.array().items(Joi.string()).optional()
  }),

  // 更新管理员
  updateAdmin: Joi.object({
    email: Joi.string().email().optional(),
    realName: securityRules.safeString.min(2).max(50).optional(),
    role: Joi.string().valid('admin', 'moderator', 'operator').optional(),
    permissions: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid('active', 'inactive').optional()
  }),

  // 系统配置更新
  updateSystemConfig: Joi.object({
    key: securityRules.safeString.max(100).required(),
    value: Joi.alternatives().try(
      Joi.string().max(1000),
      Joi.number(),
      Joi.boolean(),
      Joi.object()
    ).required(),
    description: securityRules.safeString.max(200).optional()
  })
};

// 通知相关验证模式
const noticeSchemas = {
  // 创建通知
  createNotice: Joi.object({
    title: securityRules.safeString.min(5).max(100).required(),
    content: securityRules.safeString.min(10).max(2000).required(),
    type: Joi.string().valid('system', 'promotion', 'maintenance', 'security').required(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    targetUsers: Joi.array().items(baseSchemas.id).optional(),
    targetClientTypes: Joi.array().items(securityRules.clientType).optional(),
    publishTime: Joi.date().min('now').optional(),
    expireTime: Joi.date().min(Joi.ref('publishTime')).optional()
  }),

  // 更新通知
  updateNotice: Joi.object({
    title: securityRules.safeString.min(5).max(100).optional(),
    content: securityRules.safeString.min(10).max(2000).optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    status: Joi.string().valid('draft', 'published', 'expired').optional(),
    publishTime: Joi.date().min('now').optional(),
    expireTime: Joi.date().min(Joi.ref('publishTime')).optional()
  })
};

// 统计分析验证模式
const analyticsSchemas = {
  // 数据查询
  queryAnalytics: Joi.object({
    metric: Joi.string().valid(
      'user_count', 'party_count', 'order_count', 'revenue',
      'user_growth', 'party_growth', 'order_growth', 'revenue_growth'
    ).required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required(),
    granularity: Joi.string().valid('hour', 'day', 'week', 'month').default('day'),
    filters: Joi.object({
      clientType: securityRules.clientType.optional(),
      category: Joi.number().integer().valid(0, 1, 2, 3).optional(),
      region: securityRules.safeString.max(100).optional()
    }).optional()
  }),

  // 导出数据
  exportData: Joi.object({
    type: Joi.string().valid('users', 'parties', 'orders', 'transactions').required(),
    format: Joi.string().valid('csv', 'excel', 'json').default('csv'),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required(),
    filters: Joi.object().optional()
  })
};

module.exports = {
  baseSchemas,
  userSchemas,
  partySchemas,
  orderSchemas,
  paymentSchemas,
  walletSchemas,
  bankCardSchemas,
  vipSchemas,
  favoriteSchemas,
  fileSchemas,
  adminSchemas,
  noticeSchemas,
  analyticsSchemas
};