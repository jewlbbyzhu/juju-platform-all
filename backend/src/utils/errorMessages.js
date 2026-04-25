const errorMessages = {
  AUTH: {
    INVALID_CREDENTIALS: '用户名或密码错误，请检查后重试',
    TOKEN_EXPIRED: '登录已过期，请重新登录',
    TOKEN_INVALID: '登录状态无效，请重新登录',
    UNAUTHORIZED: '您没有权限执行此操作',
    FORBIDDEN: '访问被拒绝',
    LOGIN_FAILED: '登录失败，请检查用户名和密码',
    USER_NOT_FOUND: '用户不存在',
    USER_ALREADY_EXISTS: '用户已存在',
    PASSWORD_WEAK: '密码强度不足，请使用更复杂的密码',
    PASSWORD_INCORRECT: '密码错误',
    TOO_MANY_ATTEMPTS: '登录尝试次数过多，请稍后再试',
    ACCOUNT_LOCKED: '账户已被锁定，请联系管理员'
  },
  VALIDATION: {
    REQUIRED_FIELD: '必填字段不能为空',
    INVALID_EMAIL: '邮箱格式不正确',
    INVALID_PHONE: '手机号格式不正确',
    INVALID_PASSWORD: '密码格式不正确',
    INVALID_DATE: '日期格式不正确',
    INVALID_NUMBER: '数字格式不正确',
    INVALID_TYPE: '数据类型不正确',
    INVALID_LENGTH: '数据长度不符合要求',
    INVALID_FORMAT: '数据格式不正确',
    INVALID_RANGE: '数值超出允许范围',
    INVALID_ENUM: '选择的值不在允许范围内'
  },
  USER: {
    NOT_FOUND: '用户不存在',
    ALREADY_EXISTS: '用户已存在',
    PROFILE_UPDATE_FAILED: '个人资料更新失败',
    PASSWORD_UPDATE_FAILED: '密码修改失败',
    AVATAR_UPLOAD_FAILED: '头像上传失败',
    INVALID_STATUS: '用户状态不正确',
    INVALID_VIP_STATUS: 'VIP状态不正确'
  },
  PARTY: {
    NOT_FOUND: '聚会不存在',
    CREATE_FAILED: '聚会创建失败',
    UPDATE_FAILED: '聚会更新失败',
    DELETE_FAILED: '聚会删除失败',
    INVALID_STATUS: '聚会状态不正确',
    ALREADY_STARTED: '聚会已经开始，无法修改',
    ALREADY_ENDED: '聚会已结束',
    TICKET_SOLD_OUT: '票已售罄',
    INVALID_TIME: '聚会时间设置不正确',
    INVALID_LOCATION: '聚会地址不正确'
  },
  TICKET: {
    NOT_FOUND: '票据不存在',
    ALREADY_USED: '票据已使用',
    EXPIRED: '票据已过期',
    INVALIDATED: '票据已失效',
    VERIFY_FAILED: '票据验证失败',
    USE_FAILED: '票据使用失败',
    INVALID_CODE: '票据码不正确',
    INVALID_TYPE: '票据类型不正确',
    INVALID_STATUS: '票据状态不正确'
  },
  ORDER: {
    NOT_FOUND: '订单不存在',
    CREATE_FAILED: '订单创建失败',
    UPDATE_FAILED: '订单更新失败',
    CANCEL_FAILED: '订单取消失败',
    INVALID_STATUS: '订单状态不正确',
    ALREADY_PAID: '订单已支付',
    NOT_PAID: '订单未支付',
    PAYMENT_TIMEOUT: '支付超时',
    INVALID_AMOUNT: '订单金额不正确',
    INVALID_QUANTITY: '订单数量不正确'
  },
  PAYMENT: {
    NOT_FOUND: '支付记录不存在',
    CREATE_FAILED: '支付创建失败',
    PROCESS_FAILED: '支付处理失败',
    REFUND_FAILED: '退款失败',
    INVALID_STATUS: '支付状态不正确',
    INVALID_METHOD: '支付方式不正确',
    INSUFFICIENT_BALANCE: '余额不足',
    PAYMENT_TIMEOUT: '支付超时',
    PAYMENT_CANCELLED: '支付已取消',
    PAYMENT_FAILED: '支付失败'
  },
  REFUND: {
    NOT_FOUND: '退款记录不存在',
    CREATE_FAILED: '退款申请失败',
    PROCESS_FAILED: '退款处理失败',
    AUDIT_FAILED: '退款审核失败',
    INVALID_STATUS: '退款状态不正确',
    ALREADY_PROCESSED: '退款已处理',
    AMOUNT_EXCEEDED: '退款金额超过可退金额',
    REASON_REQUIRED: '退款原因不能为空',
    AUDIT_REJECTED: '退款审核未通过'
  },
  WALLET: {
    NOT_FOUND: '钱包不存在',
    CREATE_FAILED: '钱包创建失败',
    INSUFFICIENT_BALANCE: '余额不足',
    WITHDRAW_FAILED: '提现失败',
    RECHARGE_FAILED: '充值失败',
    INVALID_AMOUNT: '金额不正确',
    INVALID_PASSWORD: '支付密码错误',
    TRANSACTION_FAILED: '交易失败'
  },
  VIP: {
    NOT_FOUND: 'VIP会员不存在',
    PURCHASE_FAILED: 'VIP购买失败',
    INVALID_TYPE: 'VIP类型不正确',
    INVALID_STATUS: 'VIP状态不正确',
    ALREADY_VIP: '您已经是VIP会员',
    EXPIRED: 'VIP会员已过期',
    RENEWAL_FAILED: 'VIP续费失败'
  },
  FAVORITE: {
    ALREADY_FAVORITED: '已收藏',
    NOT_FAVORITED: '未收藏',
    ADD_FAILED: '收藏失败',
    REMOVE_FAILED: '取消收藏失败',
    NOT_FOUND: '收藏不存在'
  },
  NOTIFICATION: {
    NOT_FOUND: '通知不存在',
    MARK_READ_FAILED: '标记已读失败',
    DELETE_FAILED: '删除通知失败'
  },
  SETTLEMENT: {
    NOT_FOUND: '结算记录不存在',
    PROCESS_FAILED: '结算处理失败',
    INVALID_STATUS: '结算状态不正确',
    ALREADY_PROCESSED: '已结算',
    CANNOT_SETTLE: '无法结算'
  },
  SERVER: {
    INTERNAL_ERROR: '服务器内部错误，请稍后重试',
    DATABASE_ERROR: '数据库错误，请稍后重试',
    NETWORK_ERROR: '网络错误，请检查网络连接',
    TIMEOUT: '请求超时，请稍后重试',
    UNAVAILABLE: '服务暂时不可用，请稍后重试',
    MAINTENANCE: '系统维护中，请稍后访问'
  },
  FILE: {
    UPLOAD_FAILED: '文件上传失败',
    INVALID_TYPE: '文件类型不支持',
    INVALID_SIZE: '文件大小超出限制',
    NOT_FOUND: '文件不存在',
    DELETE_FAILED: '文件删除失败'
  },
  RATE_LIMIT: {
    TOO_MANY_REQUESTS: '请求过于频繁，请稍后再试',
    IP_BLOCKED: 'IP地址已被限制'
  }
};

const getErrorMessage = (key, defaultMessage = '操作失败，请稍后重试') => {
  const keys = key.split('.');
  let message = errorMessages;
  
  for (const k of keys) {
    if (message && message[k]) {
      message = message[k];
    } else {
      return defaultMessage;
    }
  }
  
  return typeof message === 'string' ? message : defaultMessage;
};

module.exports = {
  errorMessages,
  getErrorMessage
};
