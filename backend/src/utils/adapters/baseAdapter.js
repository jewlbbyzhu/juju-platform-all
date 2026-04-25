/* eslint-disable no-unused-vars */
const logger = require('../logger');

/**
 * 数据适配器基类
 * 定义通用的数据转换方法
 */
class BaseAdapter {
  /**
   * 金额转换：分转元
   * 如果金额已经是以元为单位（大于100或有小数），则直接返回
   */
  formatMoney(fen) {
    if (fen === null || fen === undefined) return '0.00';
    // 如果已经是元为单位（有小数点或值小于100），直接格式化
    if (typeof fen === 'string' && fen.includes('.')) {
      return parseFloat(fen).toFixed(2);
    }
    // 如果值小于100，假设已经是元
    if (parseFloat(fen) < 100 && parseFloat(fen) > 0) {
      return parseFloat(fen).toFixed(2);
    }
    // 否则转换为元（分转元）
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
    
    // 处理 Sequelize 模型实例
    const rawParty = party.dataValues || party;
    
    return {
      id: rawParty.id,
      title: rawParty.title,
      description: rawParty.description,
      startTime: this.formatTime(rawParty.start_time),
      endTime: this.formatTime(rawParty.end_time),
      location: rawParty.location,
      address: rawParty.address,
      city: rawParty.city,
      province: rawParty.province,
      coverImage: rawParty.cover_image,
      maxParticipants: rawParty.max_participants,
      currentParticipants: rawParty.current_participants,
      priceMode: rawParty.price_mode,
      genderRestriction: rawParty.gender_restriction,
      minAge: rawParty.min_age,
      maxAge: rawParty.max_age,
      category: rawParty.category,
      status: rawParty.status,
      images: rawParty.images || [],
      tags: rawParty.tags || [],
      createdAt: this.formatTime(rawParty.created_at)
    };
  }

  /**
   * 适配订单数据 - 基础实现
   */
  adaptOrder(order) {
    if (!order) return null;
    
    // 处理 Sequelize 模型实例
    const rawOrder = order.dataValues || order;
    
    return {
      id: rawOrder.id,
      orderNo: rawOrder.order_no,
      userId: rawOrder.user_id,
      partyId: rawOrder.party_id,
      totalAmount: this.formatMoney(rawOrder.total_amount),
      finalAmount: this.formatMoney(rawOrder.final_amount),
      discountAmount: this.formatMoney(rawOrder.discount_amount),
      paymentStatus: rawOrder.payment_status,
      status: rawOrder.status,
      remark: rawOrder.remark,
      createdAt: this.formatTime(rawOrder.created_at)
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
    if (!data) return data;
    
    // 处理分页数据
    if (data.items && data.pagination) {
      return this.adaptPagination(data.items, data.pagination);
    }
    
    // 处理数组数据
    if (Array.isArray(data)) {
      return data.map(item => this.adaptItem(item));
    }
    
    // 处理嵌套的数据结构（如 {data: [...], total: N}）
    if (typeof data === 'object' && !Array.isArray(data)) {
      // 检查是否有嵌套数组需要适配
      const adaptedData = {};
      for (const key in data) {
        if (Array.isArray(data[key])) {
          // 适配数组字段
          adaptedData[key] = data[key].map(item => this.adaptItem(item));
        } else if (typeof data[key] === 'object' && data[key] !== null) {
          // 递归处理嵌套对象
          adaptedData[key] = this.adaptResponse(data[key], type);
        } else {
          adaptedData[key] = data[key];
        }
      }
      return adaptedData;
    }
    
    // 处理单个对象
    return this.adaptItem(data);
  }
}

module.exports = BaseAdapter;