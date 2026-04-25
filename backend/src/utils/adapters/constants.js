/**
 * 数据适配器常量定义
 * 统一各平台使用的枚举值和常量
 */

// 客户端类型
const CLIENT_TYPES = {
  MINIPROGRAM: 'miniprogram',
  APP: 'app',
  WEB: 'web',
  WEBSITE: 'website'
};

// 用户状态
const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BANNED: 'banned',
  DELETED: 'deleted'
};

// VIP类型
const VIP_TYPES = {
  NONE: null,
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly'
};

// 聚会状态
const PARTY_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// 聚会分类/主题
const PARTY_CATEGORIES = {
  NEON: 0,      // 霓虹
  COOL: 1,      // 潮酷
  PREMIUM: 2,   // 高级
  FUTURE: 3     // 未来
};

// 聚会分类名称映射
const PARTY_CATEGORY_NAMES = {
  [PARTY_CATEGORIES.NEON]: '霓虹',
  [PARTY_CATEGORIES.COOL]: '潮酷',
  [PARTY_CATEGORIES.PREMIUM]: '高级',
  [PARTY_CATEGORIES.FUTURE]: '未来'
};

// 性别限制
const GENDER_RESTRICTIONS = {
  NONE: 0,      // 无限制
  MALE_ONLY: 1, // 仅限男性
  FEMALE_ONLY: 2 // 仅限女性
};

// 票种模式
const TICKET_MODES = {
  NORMAL: 0,                    // 普通票
  NORMAL_WITH_EARLY: 1,         // 普通票 + 早鸟票
  GENDER_SPLIT: 2,              // 男士票 + 女士票
  GENDER_SPLIT_WITH_EARLY: 3    // 男士票 + 女士票 + 早鸟票
};

// 票种类型
const TICKET_TYPES = {
  NORMAL: 1,          // 普通票
  EARLY_BIRD: 2,      // 早鸟票
  MALE: 3,            // 男性票
  FEMALE: 4,          // 女性票
  MALE_EARLY: 5,      // 男性早鸟票
  FEMALE_EARLY: 6     // 女性早鸟票
};

// 票种类型名称映射
const TICKET_TYPE_NAMES = {
  [TICKET_TYPES.NORMAL]: '普通票',
  [TICKET_TYPES.EARLY_BIRD]: '早鸟票',
  [TICKET_TYPES.MALE]: '男性票',
  [TICKET_TYPES.FEMALE]: '女性票',
  [TICKET_TYPES.MALE_EARLY]: '男性早鸟票',
  [TICKET_TYPES.FEMALE_EARLY]: '女性早鸟票'
};

// 订单状态
const ORDER_STATUS = {
  PENDING: 'pending',     // 待支付
  PAID: 'paid',          // 已支付
  CANCELLED: 'cancelled', // 已取消
  REFUNDED: 'refunded'   // 已退款
};

// 订单状态名称映射
const ORDER_STATUS_NAMES = {
  [ORDER_STATUS.PENDING]: '待支付',
  [ORDER_STATUS.PAID]: '已支付',
  [ORDER_STATUS.CANCELLED]: '已取消',
  [ORDER_STATUS.REFUNDED]: '已退款'
};

// 订单类型
const ORDER_TYPES = {
  TICKET: 'ticket',           // 票务订单
  PACKAGE: 'package',         // VIP套餐订单
  SERVICE_FEE: 'service_fee'  // 服务费订单
};

// 票券状态
const TICKET_STATUS = {
  VALID: 'valid',         // 有效
  USED: 'used',          // 已使用
  EXPIRED: 'expired',     // 已过期
  REFUNDED: 'refunded'   // 已退款
};

// 票券状态名称映射
const TICKET_STATUS_NAMES = {
  [TICKET_STATUS.VALID]: '有效',
  [TICKET_STATUS.USED]: '已使用',
  [TICKET_STATUS.EXPIRED]: '已过期',
  [TICKET_STATUS.REFUNDED]: '已退款'
};

// 支付方式
const PAYMENT_METHODS = {
  WECHAT: 'wechat',       // 微信支付
  ALIPAY: 'alipay',       // 支付宝支付
  WALLET: 'wallet'        // 钱包支付
};

// 支付方式名称映射
const PAYMENT_METHOD_NAMES = {
  [PAYMENT_METHODS.WECHAT]: '微信支付',
  [PAYMENT_METHODS.ALIPAY]: '支付宝支付',
  [PAYMENT_METHODS.WALLET]: '钱包支付'
};

// 支付状态
const PAYMENT_STATUS = {
  PENDING: 'pending',     // 待支付
  SUCCESS: 'success',     // 支付成功
  FAILED: 'failed',       // 支付失败
  CANCELLED: 'cancelled'  // 已取消
};

// 退款状态
const REFUND_STATUS = {
  PENDING: 'pending',     // 待处理
  PROCESSING: 'processing', // 处理中
  SUCCESS: 'success',     // 退款成功
  FAILED: 'failed',       // 退款失败
  REJECTED: 'rejected'    // 已拒绝
};

// 退款状态名称映射
const REFUND_STATUS_NAMES = {
  [REFUND_STATUS.PENDING]: '待处理',
  [REFUND_STATUS.PROCESSING]: '处理中',
  [REFUND_STATUS.SUCCESS]: '退款成功',
  [REFUND_STATUS.FAILED]: '退款失败',
  [REFUND_STATUS.REJECTED]: '已拒绝'
};

// 钱包交易类型
const TRANSACTION_TYPES = {
  RECHARGE: 'recharge',   // 充值
  WITHDRAW: 'withdraw',   // 提现
  PAYMENT: 'payment',     // 支付
  REFUND: 'refund',      // 退款
  INCOME: 'income',      // 收入
  FEE: 'fee'            // 手续费
};

// 钱包交易类型名称映射
const TRANSACTION_TYPE_NAMES = {
  [TRANSACTION_TYPES.RECHARGE]: '充值',
  [TRANSACTION_TYPES.WITHDRAW]: '提现',
  [TRANSACTION_TYPES.PAYMENT]: '支付',
  [TRANSACTION_TYPES.REFUND]: '退款',
  [TRANSACTION_TYPES.INCOME]: '收入',
  [TRANSACTION_TYPES.FEE]: '手续费'
};

// 审核状态
const AUDIT_STATUS = {
  PENDING: 'pending',     // 待审核
  APPROVED: 'approved',   // 已通过
  REJECTED: 'rejected'    // 已拒绝
};

// 审核状态名称映射
const AUDIT_STATUS_NAMES = {
  [AUDIT_STATUS.PENDING]: '待审核',
  [AUDIT_STATUS.APPROVED]: '已通过',
  [AUDIT_STATUS.REJECTED]: '已拒绝'
};

// 风险等级
const RISK_LEVELS = {
  LOW: 'low',           // 低风险
  MEDIUM: 'medium',     // 中风险
  HIGH: 'high',         // 高风险
  CRITICAL: 'critical'  // 严重风险
};

// 风险等级名称映射
const RISK_LEVEL_NAMES = {
  [RISK_LEVELS.LOW]: '低风险',
  [RISK_LEVELS.MEDIUM]: '中风险',
  [RISK_LEVELS.HIGH]: '高风险',
  [RISK_LEVELS.CRITICAL]: '严重风险'
};

// 敏感字段列表（按客户端类型）
const SENSITIVE_FIELDS = {
  [CLIENT_TYPES.MINIPROGRAM]: [
    'phone', 'openid', 'wechat_openid', 'real_name', 'id_card',
    'bank_card_number', 'analytics', 'admin_notes'
  ],
  [CLIENT_TYPES.APP]: [
    'openid', 'wechat_openid', 'admin_notes', 'internal_notes'
  ],
  [CLIENT_TYPES.WEB]: [
    // Web管理后台不过滤敏感字段
  ],
  [CLIENT_TYPES.WEBSITE]: [
    'phone', 'openid', 'wechat_openid', 'real_name', 'id_card', 'bank_card_number',
    'admin_notes', 'internal_notes', 'analytics', 'risk_info', 'audit_info',
    'financial_info', 'processing_notes', 'channel_data'
  ]
};

// 数据适配类型
const ADAPT_TYPES = {
  DEFAULT: 'default',
  LIST: 'list',
  DETAIL: 'detail',
  SUMMARY: 'summary',
  PARTY_LIST: 'party-list',
  PLATFORM_STATS: 'platform-stats'
};

// 时间格式
const TIME_FORMATS = {
  FULL: 'YYYY-MM-DD HH:mm:ss',
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm',
  MONTH: 'YYYY-MM',
  SHORT_DATE: 'MM-DD',
  SHORT_DATETIME: 'MM-DD HH:mm'
};

// 金额相关常量
const MONEY_CONSTANTS = {
  FEN_TO_YUAN: 100,           // 分转元的倍数
  MIN_WITHDRAWAL: 100,        // 最小提现金额（分）
  MAX_WITHDRAWAL: 1000000,    // 最大提现金额（分）
  DAILY_WITHDRAWAL_LIMIT: 50000,    // 日提现限额（分）
  MONTHLY_WITHDRAWAL_LIMIT: 2000000  // 月提现限额（分）
};

// 分页默认值
const PAGINATION_DEFAULTS = {
  PAGE: 1,
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};

module.exports = {
  CLIENT_TYPES,
  USER_STATUS,
  VIP_TYPES,
  PARTY_STATUS,
  PARTY_CATEGORIES,
  PARTY_CATEGORY_NAMES,
  GENDER_RESTRICTIONS,
  TICKET_MODES,
  TICKET_TYPES,
  TICKET_TYPE_NAMES,
  ORDER_STATUS,
  ORDER_STATUS_NAMES,
  ORDER_TYPES,
  TICKET_STATUS,
  TICKET_STATUS_NAMES,
  PAYMENT_METHODS,
  PAYMENT_METHOD_NAMES,
  PAYMENT_STATUS,
  REFUND_STATUS,
  REFUND_STATUS_NAMES,
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_NAMES,
  AUDIT_STATUS,
  AUDIT_STATUS_NAMES,
  RISK_LEVELS,
  RISK_LEVEL_NAMES,
  SENSITIVE_FIELDS,
  ADAPT_TYPES,
  TIME_FORMATS,
  MONEY_CONSTANTS,
  PAGINATION_DEFAULTS
};