const BaseAdapter = require('./baseAdapter');
const { 
  CLIENT_TYPES, 
  SENSITIVE_FIELDS, 
  VIP_TYPES,
  MONEY_CONSTANTS 
} = require('./constants');
const logger = require('../logger');

/**
 * uni-app移动端数据适配器
 * 提供完整功能数据，支持高级特性
 */
class AppAdapter extends BaseAdapter {
  constructor() {
    super();
    // App端敏感字段列表（相对较少）
    this.sensitiveFields = SENSITIVE_FIELDS[CLIENT_TYPES.APP];
  }

  /**
   * 适配用户数据 - App版本
   */
  adaptUser(user) {
    if (!user) return null;
    
    const baseUser = super.adaptUser(user);
    
    return {
      ...baseUser,
      // App端保留更多用户信息
      phone: user.phone,
      location: user.location,
      birthday: user.birthday,
      realName: user.real_name,
      // VIP相关信息
      vipLevel: this.getVipLevel(user),
      vipPrivileges: this.getVipPrivileges(user),
      // 统计信息
      stats: {
        participatedCount: user.participated_count || 0,
        createdCount: user.created_count || 0,
        favoriteCount: user.favorite_count || 0
      },
      // 社交信息
      socialData: {
        followersCount: user.followers_count || 0,
        followingCount: user.following_count || 0,
        likesCount: user.likes_count || 0
      }
    };
  }

  /**
   * 适配聚会数据 - App版本
   */
  adaptParty(party) {
    if (!party) return null;
    
    // 处理 Sequelize 模型实例 - 支持嵌套dataValues
    let rawParty = party;
    if (party.dataValues) {
      rawParty = party.dataValues;
      // 处理嵌套的ticket_types
      if (party.ticket_types && Array.isArray(party.ticket_types)) {
        rawParty.ticket_types = party.ticket_types;
      }
      // 处理嵌套的user
      if (party.user) {
        rawParty.user = party.user;
      }
    }
    
    const baseParty = super.adaptParty(rawParty);
    
    return {
      ...baseParty,
      // App端保留完整信息
      organizer: rawParty.user ? this.adaptUser(rawParty.user) : null,
      ticketTypes: rawParty.ticket_types ? rawParty.ticket_types.map(tt => this.adaptTicketType(tt)) : [],
      // 价格范围
      priceRange: this.calculatePriceRange(rawParty.ticket_types || []),
      // 地理位置信息
      coordinates: {
        latitude: rawParty.latitude,
        longitude: rawParty.longitude
      },
      // 社交数据
      socialData: {
        viewCount: rawParty.view_count || 0,
        likeCount: rawParty.like_count || 0,
        shareCount: rawParty.share_count || 0,
        commentCount: rawParty.comment_count || 0,
        favoriteCount: rawParty.favorite_count || 0
      },
      // 统计数据
      analytics: {
        clickCount: rawParty.click_count || 0,
        conversionRate: rawParty.conversion_rate || 0,
        revenue: this.formatMoney(rawParty.total_revenue || 0)
      },
      // 审核信息
      auditInfo: {
        status: rawParty.audit_status,
        auditTime: this.formatTime(rawParty.audit_time),
        auditNotes: rawParty.audit_notes
      },
      // 推荐权重
      recommendWeight: rawParty.recommend_weight || 0,
      // 是否精选
      isFeatured: rawParty.is_featured || false
    };
  }

  /**
   * 适配票种数据
   */
  adaptTicketType(ticketType) {
    if (!ticketType) return null;
    
    // 处理 Sequelize 模型实例 - 提取 dataValues
    const rawData = ticketType.dataValues || ticketType;
    
    return {
      id: rawData.id,
      partyId: rawData.party_id,
      name: rawData.name,
      description: rawData.description,
      price: this.formatMoney(rawData.price),
      originalPrice: this.formatMoney(rawData.original_price),
      quantity: rawData.available_count,
      soldQuantity: rawData.sold_count,
      remainingQuantity: rawData.available_count - (rawData.sold_count || 0),
      saleStartTime: this.formatTime(rawData.sale_start_time),
      saleEndTime: this.formatTime(rawData.sale_end_time),
      type: rawData.type, // normal, early_bird, male, female, etc.
      isAvailable: this.isTicketTypeAvailable(rawData),
      restrictions: {
        minAge: rawData.min_age,
        maxAge: rawData.max_age,
        gender: rawData.gender_restriction,
        maxPerOrder: rawData.max_per_order || 10
      }
    };
  }

  /**
   * 适配订单数据 - App版本
   */
  adaptOrder(order) {
    if (!order) return null;
    
    const baseOrder = super.adaptOrder(order);
    
    // 处理 Sequelize 模型实例
    const rawOrder = order.dataValues || order;
    
    return {
      ...baseOrder,
      // App端包含更详细的订单信息
      party: rawOrder.party ? this.adaptParty(rawOrder.party) : null,
      user: rawOrder.user ? this.adaptUser(rawOrder.user) : null,
      orderItems: rawOrder.order_items ? rawOrder.order_items.map(item => this.adaptOrderItem(item)) : [],
      payment: rawOrder.payment ? this.adaptPayment(rawOrder.payment) : null,
      // 退款信息
      refunds: rawOrder.refunds ? rawOrder.refunds.map(refund => this.adaptRefund(refund)) : [],
      // 可操作性
      canCancel: this.canCancelOrder(rawOrder),
      canRefund: this.canRefundOrder(rawOrder),
      canPay: rawOrder.status === 'pending',
      // 时间信息
      paidAt: this.formatTime(rawOrder.paid_at),
      cancelledAt: this.formatTime(rawOrder.cancelled_at),
      refundedAt: this.formatTime(rawOrder.refunded_at)
    };
  }

  /**
   * 适配订单项数据
   */
  adaptOrderItem(orderItem) {
    if (!orderItem) return null;
    
    // 处理 Sequelize 模型实例
    const rawItem = orderItem.dataValues || orderItem;
    
    return {
      id: rawItem.id,
      orderId: rawItem.order_id,
      ticketType: rawItem.ticket_type ? this.adaptTicketType(rawItem.ticket_type) : null,
      ticketTypeName: rawItem.ticket_type_name,
      quantity: rawItem.quantity,
      unitPrice: this.formatMoney(rawItem.price),
      totalPrice: this.formatMoney(rawItem.total_amount),
      discount: this.formatMoney(rawItem.discount || 0)
    };
  }

  /**
   * 适配支付数据
   */
  adaptPayment(payment) {
    if (!payment) return null;
    
    return {
      id: payment.id,
      orderId: payment.order_id,
      amount: this.formatMoney(payment.amount),
      method: payment.method, // wechat, alipay, wallet
      status: payment.status,
      transactionId: payment.transaction_id,
      paidAt: this.formatTime(payment.paid_at),
      // 支付渠道特定信息
      channelData: payment.channel_data ? JSON.parse(payment.channel_data) : null
    };
  }

  /**
   * 适配退款数据
   */
  adaptRefund(refund) {
    if (!refund) return null;
    
    return {
      id: refund.id,
      orderId: refund.order_id,
      amount: this.formatMoney(refund.amount),
      reason: refund.reason,
      status: refund.status,
      processedAt: this.formatTime(refund.processed_at),
      refundId: refund.refund_id,
      // 退款到账信息
      refundMethod: refund.refund_method,
      estimatedArrival: this.formatTime(refund.estimated_arrival)
    };
  }

  /**
   * 适配钱包数据 - App版本
   */
  adaptWallet(wallet) {
    if (!wallet) return null;
    
    return {
      id: wallet.id,
      userId: wallet.user_id,
      balance: this.formatMoney(wallet.balance),
      frozenAmount: this.formatMoney(wallet.frozen_amount || 0),
      availableAmount: this.formatMoney((wallet.balance || 0) - (wallet.frozen_amount || 0)),
      totalIncome: this.formatMoney(wallet.total_income),
      totalExpense: this.formatMoney(wallet.total_expense),
      // 银行卡信息
      bankCards: wallet.bank_cards ? wallet.bank_cards.map(card => this.adaptBankCard(card)) : [],
      // 交易记录
      recentTransactions: wallet.recent_transactions ? 
        wallet.recent_transactions.map(tx => this.adaptTransaction(tx)) : [],
      // 提现限制
      withdrawalLimits: {
        dailyLimit: this.formatMoney(wallet.daily_withdrawal_limit || MONEY_CONSTANTS.DAILY_WITHDRAWAL_LIMIT),
        monthlyLimit: this.formatMoney(wallet.monthly_withdrawal_limit || MONEY_CONSTANTS.MONTHLY_WITHDRAWAL_LIMIT),
        minAmount: this.formatMoney(wallet.min_withdrawal_amount || MONEY_CONSTANTS.MIN_WITHDRAWAL)
      }
    };
  }

  /**
   * 适配银行卡数据
   */
  adaptBankCard(bankCard) {
    if (!bankCard) return null;
    
    return {
      id: bankCard.id,
      userId: bankCard.user_id,
      bankName: bankCard.bank_name,
      cardNumber: this.maskCardNumber(bankCard.card_number),
      cardType: bankCard.card_type,
      holderName: bankCard.holder_name,
      isDefault: bankCard.is_default,
      status: bankCard.status,
      addedAt: this.formatTime(bankCard.created_at)
    };
  }

  /**
   * 适配交易记录
   */
  adaptTransaction(transaction) {
    if (!transaction) return null;
    
    return {
      id: transaction.id,
      type: transaction.type, // recharge, withdraw, payment, refund, income
      amount: this.formatMoney(transaction.amount),
      balance: this.formatMoney(transaction.balance_after),
      description: transaction.description,
      status: transaction.status,
      createdAt: this.formatTime(transaction.created_at),
      // 关联信息
      relatedOrderId: transaction.related_order_id,
      relatedPartyId: transaction.related_party_id
    };
  }

  /**
   * 获取VIP等级
   */
  getVipLevel(user) {
    if (!user.is_vip) return 0;
    
    // 根据VIP类型返回等级
    if (user.vip_type === VIP_TYPES.YEARLY) return 3;
    if (user.vip_type === VIP_TYPES.QUARTERLY) return 2;
    if (user.vip_type === VIP_TYPES.MONTHLY) return 1;
    
    return 0;
  }

  /**
   * 获取VIP特权
   */
  getVipPrivileges(user) {
    const level = this.getVipLevel(user);
    
    const privileges = {
      0: [], // 普通用户
      1: ['快速审核', 'VIP标识', '2个免费名额/月', '手续费3%'], // 月付VIP
      2: ['极速审核', 'VIP标识', '专属客服', '3个免费名额/月', '手续费2%'], // 季付VIP
      3: ['极速审核', 'VIP标识', '专属客服', '3个免费名额/月', '手续费2%', 'VIP专属聚会'] // 年付VIP
    };
    
    return privileges[level] || [];
  }

  /**
   * 判断票种是否可用
   */
  isTicketTypeAvailable(ticketType) {
    const now = new Date();
    const saleStart = new Date(ticketType.sale_start_time);
    const saleEnd = new Date(ticketType.sale_end_time);
    const remaining = ticketType.available_count - (ticketType.sold_count || 0);
    
    return now >= saleStart && now <= saleEnd && remaining > 0;
  }

  /**
   * 判断订单是否可取消
   */
  canCancelOrder(order) {
    return order.status === 'pending';
  }

  /**
   * 判断订单是否可退款
   */
  canRefundOrder(order) {
    if (order.status !== 'paid') return false;
    
    // 检查聚会是否已开始
    if (order.party && new Date(order.party.start_time) <= new Date()) {
      return false;
    }
    
    return true;
  }

  /**
   * 银行卡号脱敏
   */
  maskCardNumber(cardNumber) {
    if (!cardNumber) return '';
    
    const str = cardNumber.toString();
    if (str.length <= 8) return str;
    
    return str.substring(0, 4) + '****' + str.substring(str.length - 4);
  }

  /**
   * 适配单个数据项
   */
  adaptItem(item) {
    if (!item) return item;
    
    // 处理 Sequelize 模型实例 - 提取 dataValues
    const rawItem = item.dataValues || item;

    if (rawItem.token !== undefined || rawItem.refreshToken !== undefined || rawItem.refresh_token !== undefined) {
      const converted = this.convertObjectKeys(rawItem, this.toCamelCase.bind(this));
      return this.filterSensitiveFields(converted, this.sensitiveFields);
    }
    
    // 调试信息
    logger.info(`DEBUG adaptItem: title=${rawItem.title}, start_time=${rawItem.start_time}, startTime=${rawItem.startTime}, order_no=${rawItem.order_no}`);
    
    // 根据数据类型进行适配（支持驼峰和下划线两种命名）
    if (rawItem.nickname !== undefined) {
      return this.adaptUser(rawItem);
    } else if (rawItem.title !== undefined && (rawItem.start_time !== undefined || rawItem.startTime !== undefined)) {
      return this.adaptParty(rawItem);
    } else if (rawItem.order_no !== undefined || rawItem.orderNo !== undefined) {
      return this.adaptOrder(rawItem);
    } else if (rawItem.balance !== undefined) {
      return this.adaptWallet(rawItem);
    } else if (rawItem.card_number !== undefined || rawItem.cardNumber !== undefined) {
      return this.adaptBankCard(rawItem);
    }
    
    // 默认处理：转换字段名并过滤敏感信息
    logger.info('DEBUG adaptItem: falling back to default conversion');
    const converted = this.convertObjectKeys(rawItem, this.toCamelCase.bind(this));
    return this.filterSensitiveFields(converted, this.sensitiveFields);
  }

  /**
   * 计算价格范围
   */
  calculatePriceRange(ticketTypes) {
    if (!ticketTypes || ticketTypes.length === 0) {
      return { min: '0.00', max: '0.00', text: '免费' };
    }
    
    const prices = ticketTypes.map(tt => {
      const price = tt.price || tt.dataValues?.price || 0;
      return parseFloat(price);
    }).filter(p => p > 0);
    
    if (prices.length === 0) {
      return { min: '0.00', max: '0.00', text: '免费' };
    }
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return { 
        min: this.formatMoney(minPrice), 
        max: this.formatMoney(maxPrice), 
        text: `¥${this.formatMoney(minPrice)}` 
      };
    }
    
    return { 
      min: this.formatMoney(minPrice), 
      max: this.formatMoney(maxPrice), 
      text: `¥${this.formatMoney(minPrice)} - ¥${this.formatMoney(maxPrice)}` 
    };
  }
}

module.exports = AppAdapter;
