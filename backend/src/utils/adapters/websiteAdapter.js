const BaseAdapter = require('./baseAdapter');
const { 
  CLIENT_TYPES, 
  SENSITIVE_FIELDS 
} = require('./constants');

/**
 * Next.js官方网站数据适配器
 * 提供公开展示数据，优化SEO和性能
 */
class WebsiteAdapter extends BaseAdapter {
  constructor() {
    super();
    // 官方网站过滤所有敏感字段，只保留公开信息
    this.sensitiveFields = SENSITIVE_FIELDS[CLIENT_TYPES.WEBSITE];
  }

  /**
   * 适配用户数据 - 官方网站版本（公开信息）
   */
  adaptUser(user) {
    if (!user) return null;
    
    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      // 只保留基本的公开信息
      isVip: user.is_vip,
      joinDate: this.formatTime(user.created_at, 'YYYY-MM'),
      // 公开统计信息
      publicStats: {
        createdParties: user.created_count || 0,
        // 不显示参与次数等隐私信息
      }
    };
  }

  /**
   * 适配聚会数据 - 官方网站版本（展示用）
   */
  adaptParty(party) {
    if (!party) return null;
    
    // 获取封面图片：优先使用 cover_image/coverImage，其次使用 images 数组
    const coverImage = party.cover_image || party.coverImage || 
                       (party.images && party.images.length > 0 ? party.images[0] : null);
    
    return {
      id: party.id,
      title: party.title,
      description: this.truncateDescription(party.description, 200), // 截断描述
      startTime: this.formatTime(party.start_time),
      endTime: this.formatTime(party.end_time),
      location: this.formatLocation(party.location), // 格式化地址
      maxParticipants: party.max_participants,
      currentParticipants: party.current_participants,
      category: party.category,
      status: party.status,
      auditStatus: party.audit_status,
      // 封面图片
      coverImage: coverImage,
      // 价格信息（如果有票种）
      priceRange: this.calculatePriceRange(party.ticket_types || party.ticketTypes),
      // 组织者公开信息
      organizer: party.user ? {
        id: party.user.id,
        nickname: party.user.nickname,
        avatar: party.user.avatar,
        isVip: party.user.is_vip
      } : null,
      // SEO友好的URL slug
      slug: this.generateSlug(party.title, party.id),
      // 公开统计（简化）
      stats: {
        viewCount: party.view_count || 0,
        participantCount: party.current_participants || 0
      }
    };
  }

  /**
   * 适配聚会列表 - 官方网站首页展示
   */
  adaptPartyList(parties) {
    if (!Array.isArray(parties)) return [];
    
    return parties.map(party => ({
      id: party.id,
      title: party.title,
      description: this.truncateDescription(party.description, 100),
      startTime: this.formatTime(party.start_time, 'MM-DD HH:mm'),
      location: this.formatLocationShort(party.location),
      category: party.category,
      coverImage: party.cover_image || party.coverImage || 
                  (party.images && party.images.length > 0 ? party.images[0] : null),
      priceRange: this.calculatePriceRange(party.ticket_types),
      participantCount: party.current_participants || 0,
      maxParticipants: party.max_participants,
      slug: this.generateSlug(party.title, party.id),
      // 热度指标（用于排序）
      hotScore: this.calculateHotScore(party)
    }));
  }

  /**
   * 适配统计数据 - 官方网站展示
   */
  adaptPlatformStats(stats) {
    if (!stats) return null;
    
    return {
      // 平台总体数据（公开）
      totalUsers: this.formatNumber(stats.total_users),
      totalParties: this.formatNumber(stats.total_parties),
      totalTickets: this.formatNumber(stats.total_tickets),
      // 本月数据
      monthlyStats: {
        newUsers: this.formatNumber(stats.monthly_new_users),
        newParties: this.formatNumber(stats.monthly_new_parties),
        activeUsers: this.formatNumber(stats.monthly_active_users)
      },
      // 城市分布（前10个城市）
      topCities: stats.top_cities ? stats.top_cities.slice(0, 10).map(city => ({
        name: city.name,
        count: this.formatNumber(city.count)
      })) : [],
      // 分类统计
      categoryStats: stats.category_stats ? stats.category_stats.map(cat => ({
        category: cat.category,
        count: this.formatNumber(cat.count),
        percentage: cat.percentage
      })) : []
    };
  }

  /**
   * 适配App版本信息 - 官方网站下载页
   */
  adaptAppVersion(version) {
    if (!version) return null;
    
    return {
      version: version.version,
      platform: version.platform, // ios, android, miniprogram
      downloadUrl: version.download_url,
      qrCode: version.qr_code,
      fileSize: this.formatFileSize(version.file_size),
      releaseDate: this.formatTime(version.release_date, 'YYYY-MM-DD'),
      // 更新说明（公开部分）
      releaseNotes: version.release_notes ? 
        version.release_notes.split('\n').slice(0, 5).join('\n') : '', // 只显示前5行
      // 系统要求
      requirements: {
        ios: version.min_ios_version,
        android: version.min_android_version,
        wechat: version.min_wechat_version
      },
      // 下载统计（如果公开）
      downloadCount: version.download_count ? this.formatNumber(version.download_count) : null
    };
  }

  /**
   * 适配帮助文档数据
   */
  adaptHelpDocument(doc) {
    if (!doc) return null;
    
    return {
      id: doc.id,
      title: doc.title,
      content: doc.content,
      category: doc.category,
      tags: doc.tags || [],
      publishDate: this.formatTime(doc.created_at, 'YYYY-MM-DD'),
      updateDate: this.formatTime(doc.updated_at, 'YYYY-MM-DD'),
      slug: this.generateSlug(doc.title, doc.id),
      // SEO信息
      seo: {
        description: this.truncateDescription(doc.content, 160),
        keywords: doc.tags ? doc.tags.join(', ') : ''
      }
    };
  }

  /**
   * 截断描述文本
   */
  truncateDescription(text, maxLength = 200) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  /**
   * 格式化地址（完整版）
   */
  formatLocation(location) {
    if (!location) return '';
    
    // 如果是详细地址，提取主要部分
    const parts = location.split(/[,，]/);
    if (parts.length > 2) {
      return parts.slice(-2).join(', ').trim();
    }
    
    return location;
  }

  /**
   * 格式化地址（简短版）
   */
  formatLocationShort(location) {
    if (!location) return '';
    
    // 提取城市和区域
    const parts = location.split(/[,，]/);
    if (parts.length > 1) {
      return parts[parts.length - 1].trim();
    }
    
    return location.length > 10 ? location.substring(0, 10) + '...' : location;
  }

  /**
   * 计算价格范围
   */
  calculatePriceRange(ticketTypes) {
    if (!ticketTypes || ticketTypes.length === 0) {
      return { min: '0.00', max: '0.00', text: '免费' };
    }
    
    const prices = ticketTypes.map(tt => tt.price || 0);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === 0 && maxPrice === 0) {
      return { min: '0.00', max: '0.00', text: '免费' };
    }
    
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

  /**
   * 生成SEO友好的URL slug
   */
  generateSlug(title, id) {
    if (!title) return id.toString();
    
    // 简单的slug生成：移除特殊字符，转换为小写，用连字符连接
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // 移除特殊字符
      .replace(/\s+/g, '-') // 空格转连字符
      .replace(/-+/g, '-') // 多个连字符合并
      .trim('-'); // 移除首尾连字符
    
    return `${slug}-${id}`;
  }

  /**
   * 计算热度分数
   */
  calculateHotScore(party) {
    const viewCount = party.view_count || 0;
    const participantCount = party.current_participants || 0;
    const maxParticipants = party.max_participants || 1;
    const likeCount = party.like_count || 0;
    const shareCount = party.share_count || 0;
    
    // 简单的热度算法
    const participationRate = participantCount / maxParticipants;
    const socialScore = likeCount + shareCount * 2;
    const viewScore = Math.log(viewCount + 1);
    
    return Math.round(participationRate * 40 + socialScore * 0.5 + viewScore * 2);
  }

  /**
   * 格式化数字（K, M表示）
   */
  formatNumber(num) {
    if (!num || num < 1000) return num?.toString() || '0';
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    
    return num.toString();
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes) {
    if (!bytes) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
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
    
    // 根据数据类型进行适配（支持驼峰和下划线两种命名）
    if (item.nickname !== undefined) {
      return this.adaptUser(item);
    } else if (item.title !== undefined && (item.start_time !== undefined || item.startTime !== undefined)) {
      return this.adaptParty(item);
    } else if (item.version !== undefined && item.platform !== undefined) {
      return this.adaptAppVersion(item);
    } else if (item.content !== undefined && item.category !== undefined) {
      return this.adaptHelpDocument(item);
    }
    
    // 默认处理：转换字段名并过滤敏感信息
    const converted = this.convertObjectKeys(item, this.toCamelCase.bind(this));
    return this.filterSensitiveFields(converted, this.sensitiveFields);
  }

  /**
   * 适配响应数据 - 官方网站版本
   */
  adaptResponse(data, type = 'default') {
    if (!data) return data;
    
    // 特殊处理聚会列表
    if (type === 'party-list' && Array.isArray(data)) {
      return this.adaptPartyList(data);
    }
    
    // 特殊处理平台统计
    if (type === 'platform-stats') {
      return this.adaptPlatformStats(data);
    }
    
    // 使用基类的默认处理
    return super.adaptResponse(data, type);
  }

  /**
   * 适配分页数据 - 官方网站版本
   */
  adaptPagination(data, pagination) {
    const result = super.adaptPagination(data, pagination);
    
    // 官方网站使用简化的分页格式
    return {
      items: result.items,
      page: result.pagination.page,
      pageSize: result.pagination.pageSize,
      total: result.pagination.total,
      hasMore: result.pagination.hasNext
    };
  }
}

module.exports = WebsiteAdapter;
