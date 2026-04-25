/* eslint-disable no-unused-vars */
const logger = require('../logger');

/**
 * 数据适配器基类
 * 定义通用的数据转换方法
 */
class BaseAdapter {
  /**
   * 金额转换：分转元
   */
  formatMoney(fen) {
    if (fen === null || fen === undefined) return '0.00';
    return (fen / 100).toFixed(2);
  }

  /**
   * 时间格式化
   */
  formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!date) return '';
    
    let d;
    if (typeof date === 'string') {
      d = new Date(date);
    } else if (date instanceof Date) {
      d = date;
    } else {
      return '';
    }
    
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  /**
   * 字段名转换：下划线转驼峰
   */
  toCamelCase(str) {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
  }

  /**
   * 字段名转换：驼峰转下划线
   */
  toSnakeCase(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * 对象字段名转换
   */
  convertObjectKeys(obj, converter) {
    if (!obj || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.convertObjectKeys(item, converter));
    }
    
    const result = {};
    Object.keys(obj).forEach(key => {
      const newKey = converter(key);
      const value = obj[key];
      
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[newKey] = this.convertObjectKeys(value, converter);
      } else if (Array.isArray(value)) {
        result[newKey] = value.map(item => 
          typeof item === 'object' ? this.convertObjectKeys(item, converter) : item
        );
      } else {
        result[newKey] = value;
      }
    });
    
    return result;
  }

  /**
   * 过滤敏感字段
   */
  filterSensitiveFields(obj, sensitiveFields = []) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const result = { ...obj };
    sensitiveFields.forEach(field => {
      delete result[field];
      delete result[this.toCamelCase(field)];
    });
    
    return result;
  }

  /**
   * 检查票券是否可以退款
   */
  canRefundTicket(ticket) {
    if (!ticket || !ticket.party) return true;
    
    const partyStartTime = new Date(ticket.party.start_time);
    const now = new Date();
    
    return partyStartTime > now;
  }

  /**
   * 适配用户数据 - 基础实现
   */
  adaptUser(user) {
    if (!user) return null;
    
    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      gender: user.gender,
      isVip: user.is_vip,
      vipExpiresAt: user.vip_expires_at,
      createdAt: this.formatTime(user.created_at)
    };
  }

  /**
   * 适配聚会数据 - 基础实现
   */
  adaptParty(party) {
    if (!party) return null;
    
    logger.info(`DEBUG adaptParty: cover_image=${party.cover_image}, type=${typeof party.cover_image}`);
    
    return {
      id: party.id,
      title: party.title,
      description: party.description,
      startTime: this.formatTime(party.start_time),
      endTime: this.formatTime(party.end_time),
      location: party.location,
      address: party.address,
      city: party.city,
      province: party.province,
      coverImage: party.cover_image,
      maxParticipants: party.max_participants,
      currentParticipants: party.current_participants,
      priceMode: party.price_mode,
      genderRestriction: party.gender_restriction,
      minAge: party.min_age,
      maxAge: party.max_age,
      category: party.category,
      status: party.status,
      images: party.images || [],
      tags: party.tags || [],
      createdAt: this.formatTime(party.created_at)
    };
  }

  /**
   * 适配订单数据 - 基础实现
   */
  adaptOrder(order) {
    if (!order) return null;
    
    return {
      id: order.id,
      orderNo: order.order_no,
      userId: order.user_id,
      partyId: order.party_id,
      totalAmount: this.formatMoney(order.total_amount),
      status: order.status,
      createdAt: this.formatTime(order.created_at)
    };
  }

  /**
   * 适配分页数据
   */
  adaptPagination(data, pagination) {
    return {
      items: Array.isArray(data) ? data.map(item => this.adaptItem(item)) : [],
      pagination: {
        page: pagination.page || 1,
        pageSize: pagination.pageSize || 20,
        total: pagination.total || 0,
        totalPages: Math.ceil((pagination.total || 0) / (pagination.pageSize || 20)),
        hasNext: (pagination.page || 1) * (pagination.pageSize || 20) < (pagination.total || 0),
        hasPrev: (pagination.page || 1) > 1
      }
    };
  }

  /**
   * 适配单个数据项 - 子类需要重写
   */
  adaptItem(item) {
    return item;
  }

  /**
   * 适配响应数据 - 主要入口方法
   */
  adaptResponse(data, type = 'default') {
    logger.info(`DEBUG adaptResponse called with data type: ${typeof data}, isArray: ${Array.isArray(data)}`);
    if (!data) return data;
    
    // 处理分页数据
    if (data.items && data.pagination) {
      return this.adaptPagination(data.items, data.pagination);
    }
    
    // 处理数组数据
    if (Array.isArray(data)) {
      return data.map(item => this.adaptItem(item));
    }
    
    // 处理单个对象
    logger.info('DEBUG adaptResponse: calling adaptItem');
    return this.adaptItem(data);
  }
}

module.exports = BaseAdapter;