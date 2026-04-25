const BaseAdapter = require('./baseAdapter');
const { 
  CLIENT_TYPES, 
  SENSITIVE_FIELDS, 
  MONEY_CONSTANTS 
} = require('./constants');

/**
 * Web管理后台数据适配器
 * 提供完整的管理功能数据，包含敏感信息和管理字段
 */
class WebAdapter extends BaseAdapter {
  constructor() {
    super();
    // Web管理后台不过滤敏感字段，管理员需要查看完整信息
    this.sensitiveFields = SENSITIVE_FIELDS[CLIENT_TYPES.WEB];
  }

  /**
   * 适配用户数据 - Web管理后台版本
   */
  adaptUser(user) {
    if (!user) return null;
    
    const baseUser = super.adaptUser(user);
    
    return {
      ...baseUser,
      // 管理后台需要的完整用户信息
      phone: user.phone,
      wechatOpenid: user.openid || user.wechat_openid,
      realName: user.real_name,
      idCard: user.id_card,
      location: user.location,
      birthday: user.birthday,
      registrationTime: this.formatTime(user.created_at),
      lastLoginTime: this.formatTime(user.last_login_at),
      loginCount: user.login_count || 0,
      // VIP信息
      vipType: user.vip_type,
      vipStartTime: this.formatTime(user.vip_start_time),
      vipEndTime: this.formatTime(user.vip_expires_at),
      // 统计信息
      statistics: {
        participatedCount: user.participated_count || 0,
        createdCount: user.created_count || 0,
        favoriteCount: user.favorite_count || 0,
        totalSpent: this.formatMoney(user.total_spent || 0),
        totalEarned: this.formatMoney(user.total_earned || 0)
      },
      // 风控信息
      riskInfo: {
        riskLevel: user.risk_level || 'low',
        blacklistStatus: user.is_blacklisted || false,
        reportCount: user.report_count || 0,
        lastReportTime: this.formatTime(user.last_report_time)
      },
      // 管理信息
      adminNotes: user.admin_notes,
      status: user.status || 'active',
      updatedAt: this.formatTime(user.updated_at)
    };
  }

  /**
   * 适配聚会数据 - Web管理后台版本
   */
  adaptParty(party) {
    if (!party) return null;
    
    const baseParty = super.adaptParty(party);
    
    return {
      ...baseParty,
      // 管理后台需要的完整聚会信息
      organizer: party.user ? {
        id: party.user.id,
        nickname: party.user.nickname,
        avatar: party.user.avatar
      } : null,
      ticketTypes: party.ticket_types ? party.ticket_types.map(tt => this.adaptTicketType(tt)) : [],
      // 审核信息
      auditInfo: {
        status: party.audit_status || 'pending',
        auditTime: this.formatTime(party.audit_time),
        auditorId: party.auditor_id,
        auditNotes: party.audit_notes,
        auditHistory: party.audit_history ? JSON.parse(party.audit_history) : []
      },
      // 财务信息
      financialInfo: {
        totalRevenue: this.formatMoney(party.total_revenue || 0),
        serviceFee: this.formatMoney(party.service_fee || 0),
        organizerIncome: this.formatMoney(party.organizer_income || 0),
        refundAmount: this.formatMoney(party.refund_amount || 0),
        settlementStatus: party.settlement_status || 'pending'
      },
      // 统计数据
      analytics: {
        viewCount: party.view_count || 0,
        clickCount: party.click_count || 0,
        shareCount: party.share_count || 0,
        favoriteCount: party.favorite_count || 0,
        conversionRate: party.conversion_rate || 0,
        averageRating: party.average_rating || 0,
        reviewCount: party.review_count || 0
      },
      // 地理位置
      coordinates: {
        latitude: party.latitude,
        longitude: party.longitude,
        address: party.address,
        district: party.district,
        city: party.city,
        province: party.province
      },
      // 风控信息
      riskInfo: {
        riskLevel: party.risk_level || 'low',
        flaggedReasons: party.flagged_reasons ? JSON.parse(party.flagged_reasons) : [],
        reportCount: party.report_count || 0,
        lastReportTime: this.formatTime(party.last_report_time)
      },
      // 管理信息
      adminNotes: party.admin_notes,
      internalNotes: party.internal_notes,
      isFeatured: party.is_featured || false,
      recommendWeight: party.recommend_weight || 0,
      updatedAt: this.formatTime(party.updated_at)
    };
  }

  /**
   * 适配票种数据 - Web管理后台版本
   */
  adaptTicketType(ticketType) {
    if (!ticketType) return null;
    
    return {
      id: ticketType.id,
      partyId: ticketType.party_id,
      name: ticketType.name,
      description: ticketType.description,
      price: this.formatMoney(ticketType.price),
      originalPrice: this.formatMoney(ticketType.original_price),
      quantity: ticketType.available_count,
      soldQuantity: ticketType.sold_count || 0,
      remainingQuantity: ticketType.available_count - (ticketType.sold_count || 0),
      saleStartTime: this.formatTime(ticketType.sale_start_time),
      saleEndTime: this.formatTime(ticketType.sale_end_time),
      type: ticketType.type,
      // 销售统计
      salesStats: {
        totalRevenue: this.formatMoney((ticketType.sold_count || 0) * ticketType.price),
        salesRate: ticketType.available_count > 0 ? 
          ((ticketType.sold_count || 0) / ticketType.available_count * 100).toFixed(2) + '%' : '0%',
        averageSaleTime: ticketType.average_sale_time || 0
      },
      // 限制条件
      restrictions: {
        minAge: ticketType.min_age,
        maxAge: ticketType.max_age,
        genderRestriction: ticketType.gender_restriction,
        maxPerOrder: ticketType.max_per_order || 10,
        requiresApproval: ticketType.requires_approval || false
      },
      createdAt: this.formatTime(ticketType.created_at),
      updatedAt: this.formatTime(ticketType.updated_at)
    };
  }

  /**
   * 适配订单数据 - Web管理后台版本
   */
  adaptOrder(order) {
    if (!order) return null;
    
    const baseOrder = super.adaptOrder(order);
    
    return {
      ...baseOrder,
      // 管理后台需要的完整订单信息
      party: order.party ? {
        id: order.party.id,
        title: order.party.title,
        startTime: this.formatTime(order.party.start_time),
        endTime: this.formatTime(order.party.end_time),
        location: order.party.location
      } : null,
      user: order.user ? {
        id: order.user.id,
        nickname: order.user.nickname,
        avatar: order.user.avatar
      } : null,
      orderItems: order.order_items ? order.order_items.map(item => this.adaptOrderItem(item)) : [],
      payment: order.payment ? this.adaptPayment(order.payment) : null,
      tickets: order.tickets ? order.tickets.map(ticket => this.adaptTicket(ticket)) : [],
      refunds: order.refunds ? order.refunds.map(refund => this.adaptRefund(refund)) : [],
      // 时间信息
      paidAt: this.formatTime(order.paid_at),
      cancelledAt: this.formatTime(order.cancelled_at),
      refundedAt: this.formatTime(order.refunded_at),
      expiredAt: this.formatTime(order.expired_at),
      // 财务信息
      financialInfo: {
        originalAmount: this.formatMoney(order.original_amount || order.total_amount),
        discountAmount: this.formatMoney(order.discount_amount || 0),
        serviceFee: this.formatMoney(order.service_fee || 0),
        refundAmount: this.formatMoney(order.refund_amount || 0),
        finalAmount: this.formatMoney(order.final_amount || order.total_amount)
      },
      // 风控信息
      riskInfo: {
        riskScore: order.risk_score || 0,
        riskLevel: order.risk_level || 'low',
        flaggedReasons: order.flagged_reasons ? JSON.parse(order.flagged_reasons) : [],
        isManualReview: order.is_manual_review || false
      },
      // 管理信息
      adminNotes: order.admin_notes,
      processingNotes: order.processing_notes,
      updatedAt: this.formatTime(order.updated_at)
    };
  }

  /**
   * 适配订单项数据
   */
  adaptOrderItem(orderItem) {
    if (!orderItem) return null;
    
    return {
      id: orderItem.id,
      orderId: orderItem.order_id,
      ticketType: orderItem.ticket_type ? this.adaptTicketType(orderItem.ticket_type) : null,
      quantity: orderItem.quantity,
      unitPrice: this.formatMoney(orderItem.unit_price),
      totalPrice: this.formatMoney(orderItem.total_price),
      discount: this.formatMoney(orderItem.discount || 0),
      discountType: orderItem.discount_type,
      discountReason: orderItem.discount_reason,
      createdAt: this.formatTime(orderItem.created_at)
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
      method: payment.method,
      status: payment.status,
      transactionId: payment.transaction_id,
      paidAt: this.formatTime(payment.paid_at),
      // 支付渠道信息
      channelInfo: {
        channel: payment.channel,
        channelOrderId: payment.channel_order_id,
        channelData: payment.channel_data ? JSON.parse(payment.channel_data) : null,
        fee: this.formatMoney(payment.channel_fee || 0)
      },
      // 对账信息
      reconciliation: {
        isReconciled: payment.is_reconciled || false,
        reconciledAt: this.formatTime(payment.reconciled_at),
        reconciliationId: payment.reconciliation_id
      },
      createdAt: this.formatTime(payment.created_at),
      updatedAt: this.formatTime(payment.updated_at)
    };
  }

  /**
   * 适配票券数据
   */
  adaptTicket(ticket) {
    if (!ticket) return null;
    
    return {
      id: ticket.id,
      ticketNo: ticket.ticket_no,
      orderId: ticket.order_id,
      partyId: ticket.party_id,
      userId: ticket.user_id,
      ticketTypeId: ticket.ticket_type_id,
      status: ticket.status,
      qrCode: ticket.qr_code,
      // 使用信息
      usedAt: this.formatTime(ticket.used_at),
      usedBy: ticket.used_by,
      checkInLocation: ticket.checkin_location,
      // 退款信息
      refundedAt: this.formatTime(ticket.refunded_at),
      refundReason: ticket.refund_reason,
      // 管理信息
      adminNotes: ticket.admin_notes,
      createdAt: this.formatTime(ticket.created_at),
      updatedAt: this.formatTime(ticket.updated_at)
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
      userId: refund.user_id,
      amount: this.formatMoney(refund.amount),
      reason: refund.reason,
      status: refund.status,
      // 审核信息
      auditInfo: {
        auditorId: refund.auditor_id,
        auditTime: this.formatTime(refund.audit_time),
        auditNotes: refund.audit_notes,
        auditResult: refund.audit_result
      },
      // 处理信息
      processedAt: this.formatTime(refund.processed_at),
      refundId: refund.refund_id,
      refundMethod: refund.refund_method,
      estimatedArrival: this.formatTime(refund.estimated_arrival),
      actualArrival: this.formatTime(refund.actual_arrival),
      // 管理信息
      adminNotes: refund.admin_notes,
      processingNotes: refund.processing_notes,
      createdAt: this.formatTime(refund.created_at),
      updatedAt: this.formatTime(refund.updated_at)
    };
  }

  /**
   * 适配钱包数据 - Web管理后台版本
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
      // 限制信息
      limits: {
        dailyWithdrawalLimit: this.formatMoney(wallet.daily_withdrawal_limit || MONEY_CONSTANTS.DAILY_WITHDRAWAL_LIMIT),
        monthlyWithdrawalLimit: this.formatMoney(wallet.monthly_withdrawal_limit || MONEY_CONSTANTS.MONTHLY_WITHDRAWAL_LIMIT),
        minWithdrawalAmount: this.formatMoney(wallet.min_withdrawal_amount || MONEY_CONSTANTS.MIN_WITHDRAWAL),
        maxWithdrawalAmount: this.formatMoney(wallet.max_withdrawal_amount || MONEY_CONSTANTS.MAX_WITHDRAWAL)
      },
      // 统计信息
      statistics: {
        todayIncome: this.formatMoney(wallet.today_income || 0),
        todayExpense: this.formatMoney(wallet.today_expense || 0),
        monthlyIncome: this.formatMoney(wallet.monthly_income || 0),
        monthlyExpense: this.formatMoney(wallet.monthly_expense || 0),
        transactionCount: wallet.transaction_count || 0
      },
      // 风控信息
      riskInfo: {
        riskLevel: wallet.risk_level || 'low',
        isMonitored: wallet.is_monitored || false,
        suspiciousTransactionCount: wallet.suspicious_transaction_count || 0,
        lastSuspiciousTime: this.formatTime(wallet.last_suspicious_time)
      },
      // 管理信息
      adminNotes: wallet.admin_notes,
      status: wallet.status || 'active',
      createdAt: this.formatTime(wallet.created_at),
      updatedAt: this.formatTime(wallet.updated_at)
    };
  }

  /**
   * 适配管理员数据
   */
  adaptAdmin(admin) {
    if (!admin) return null;
    
    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      realName: admin.real_name,
      phone: admin.phone,
      avatar: admin.avatar,
      // 角色权限
      roles: admin.roles ? admin.roles.map(role => this.adaptRole(role)) : [],
      permissions: admin.permissions || [],
      // 状态信息
      status: admin.status,
      isActive: admin.is_active,
      lastLoginAt: this.formatTime(admin.last_login_at),
      lastLoginIp: admin.last_login_ip,
      loginCount: admin.login_count || 0,
      // 操作统计
      operationStats: {
        todayOperations: admin.today_operations || 0,
        totalOperations: admin.total_operations || 0,
        auditCount: admin.audit_count || 0,
        approvalCount: admin.approval_count || 0
      },
      createdAt: this.formatTime(admin.created_at),
      updatedAt: this.formatTime(admin.updated_at)
    };
  }

  /**
   * 适配角色数据
   */
  adaptRole(role) {
    if (!role) return null;
    
    return {
      id: role.id,
      name: role.name,
      displayName: role.display_name,
      description: role.description,
      permissions: role.permissions || [],
      isSystem: role.is_system || false,
      createdAt: this.formatTime(role.created_at),
      updatedAt: this.formatTime(role.updated_at)
    };
  }

  /**
   * 适配单个数据项
   */
  adaptItem(item) {
    if (!item) return item;

    if (item.token !== undefined || item.refreshToken !== undefined || item.refresh_token !== undefined) {
      return this.convertObjectKeys(item, this.toCamelCase.bind(this));
    }
    
    // 根据数据类型进行适配
    if (item.nickname !== undefined) {
      return this.adaptUser(item);
    } else if (item.title !== undefined && item.start_time !== undefined) {
      return this.adaptParty(item);
    } else if (item.order_no !== undefined) {
      return this.adaptOrder(item);
    } else if (item.balance !== undefined) {
      return this.adaptWallet(item);
    } else if (item.username !== undefined && item.roles !== undefined) {
      return this.adaptAdmin(item);
    } else if (item.name !== undefined && item.permissions !== undefined) {
      return this.adaptRole(item);
    }
    
    // 默认处理：转换字段名
    return this.convertObjectKeys(item, this.toCamelCase.bind(this));
  }

  /**
   * 适配分页数据 - Web管理后台版本
   */
  adaptPagination(data, pagination) {
    const result = super.adaptPagination(data, pagination);
    
    // Web管理后台使用标准的分页格式
    return {
      data: result.items,
      pagination: {
        current: result.pagination.page,
        pageSize: result.pagination.pageSize,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
        hasNext: result.pagination.hasNext,
        hasPrev: result.pagination.hasPrev,
        // 管理后台特有的分页信息
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: true
      }
    };
  }
}

module.exports = WebAdapter;
