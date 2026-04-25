const BaseAdapter = require('./baseAdapter');
const { 
  CLIENT_TYPES, 
  SENSITIVE_FIELDS, 
  ORDER_STATUS_NAMES, 
  TICKET_STATUS_NAMES
} = require('./constants');

/**
 * 微信小程序数据适配器
 * 简化数据结构，移除复杂字段，优化小程序性能
 */
class MiniprogramAdapter extends BaseAdapter {
  constructor() {
    super();
    // 小程序敏感字段列表
    this.sensitiveFields = SENSITIVE_FIELDS[CLIENT_TYPES.MINIPROGRAM];
  }

  toNumber(value) {
    const n = typeof value === 'string' ? Number(value) : value;
    return Number.isFinite(n) ? n : 0;
  }

  /**
   * 适配用户数据 - 小程序版本
   */
  adaptUser(user) {
    if (!user) return null;
    
    const converted = this.convertObjectKeys(user, this.toCamelCase.bind(this));
    return this.filterSensitiveFields({
      ...converted,
      vipStatus: converted.isVip ? 1 : 0,
      createTime: this.formatTime(user.created_at)
    }, this.sensitiveFields);
  }

  /**
   * 适配聚会数据 - 小程序版本
   */
  adaptParty(party) {
    if (!party) return null;

    const converted = this.convertObjectKeys(party, this.toCamelCase.bind(this));
    const images = Array.isArray(converted.images) ? converted.images.slice(0, 3) : [];
    const coverImage = converted.coverImage || images[0] || null;
    const tags = Array.isArray(converted.tags) ? converted.tags.slice(0, 3) : [];

    return {
      ...converted,
      coverImage,
      images,
      tags,
      minPrice: this.toNumber(converted.minPrice),
      maxPrice: this.toNumber(converted.maxPrice),
      maxPeople: converted.maxParticipants || 0,
      currentPeople: converted.currentParticipants || 0,
      priceType: converted.priceMode || 1,
      theme: converted.category || 0,
      genderLimit: converted.genderRestriction || 0,
      minAge: converted.minAge || 0,
      maxAge: converted.maxAge || 0,
      startTime: this.formatTime(converted.startTime),
      endTime: this.formatTime(converted.endTime),
      createTime: this.formatTime(converted.createdAt)
    };
  }

  /**
   * 适配订单数据 - 小程序版本
   */
  adaptOrder(order) {
    if (!order) return null;

    const converted = this.convertObjectKeys(order, this.toCamelCase.bind(this));
    return {
      ...converted,
      totalAmount: this.toNumber(converted.totalAmount),
      discountAmount: this.toNumber(converted.discountAmount),
      finalAmount: this.toNumber(converted.finalAmount),
      statusText: this.getOrderStatusText(converted.status),
      totalPrice: this.formatMoney(converted.totalAmount),
      createTime: this.formatTime(converted.createdAt)
    };
  }

  /**
   * 适配票券数据 - 小程序版本
   */
  adaptTicket(ticket) {
    if (!ticket) return null;
    const converted = this.convertObjectKeys(ticket, this.toCamelCase.bind(this));
    return {
      ...converted,
      statusText: this.getTicketStatusText(converted.status),
      canRefund: this.canRefundTicket(ticket),
      ticketType: converted.ticketTypeId || converted.ticketType || 0,
      createTime: this.formatTime(converted.createdAt)
    };
  }

  /**
   * 适配钱包数据 - 小程序版本
   */
  adaptWallet(wallet) {
    if (!wallet) return null;
    
    return {
      id: wallet.id,
      userId: wallet.user_id,
      balance: this.formatMoney(wallet.balance),
      totalIncome: this.formatMoney(wallet.total_income),
      totalExpense: this.formatMoney(wallet.total_expense),
      // 小程序显示格式化的金额
      balanceText: `¥${this.formatMoney(wallet.balance)}`,
      updateTime: this.formatTime(wallet.updated_at)
    };
  }

  /**
   * 获取订单状态文本
   */
  getOrderStatusText(status) {
    return ORDER_STATUS_NAMES[status] || '未知状态';
  }

  /**
   * 获取票券状态文本
   */
  getTicketStatusText(status) {
    return TICKET_STATUS_NAMES[status] || '未知状态';
  }

  /**
   * 适配单个数据项
   */
  adaptItem(item) {
    if (!item) return item;

    if (item.token !== undefined || item.refreshToken !== undefined || item.refresh_token !== undefined) {
      const converted = this.convertObjectKeys(item, this.toCamelCase.bind(this));
      return this.filterSensitiveFields(converted, this.sensitiveFields);
    }
    
    // 根据数据类型进行适配
    if (item.nickname !== undefined) {
      return this.adaptUser(item);
    } else if (item.title !== undefined && item.start_time !== undefined) {
      return this.adaptParty(item);
    } else if (item.order_no !== undefined) {
      return this.adaptOrder(item);
    } else if (item.ticket_no !== undefined) {
      return this.adaptTicket(item);
    } else if (item.balance !== undefined) {
      return this.adaptWallet(item);
    }
    
    // 默认处理：转换字段名并过滤敏感信息
    const converted = this.convertObjectKeys(item, this.toCamelCase.bind(this));
    return this.filterSensitiveFields(converted, this.sensitiveFields);
  }

  /**
   * 适配分页数据 - 小程序版本
   */
  adaptPagination(data, pagination) {
    const result = super.adaptPagination(data, pagination);
    
    // 小程序使用更简单的分页信息
    return {
      list: result.items, // 小程序使用list而不是items
      page: result.pagination.page,
      pageSize: result.pagination.pageSize,
      total: result.pagination.total,
      hasMore: result.pagination.hasNext // 小程序使用hasMore
    };
  }
}

module.exports = MiniprogramAdapter;
