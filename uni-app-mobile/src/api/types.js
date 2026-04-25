/**
 * @fileoverview 全局类型定义文件
 * @description 为 API 提供 JSDoc 类型定义，用于 API 验证工具进行字段级对比
 */

/**
 * 分页结果
 * @typedef {Object} PageResult
 * @property {Array} list - 数据列表
 * @property {number} total - 总记录数
 * @property {number} page - 当前页码
 * @property {number} pageSize - 每页大小
 * @property {boolean} hasMore - 是否还有更多数据
 */

/**
 * 用户信息
 * @typedef {Object} UserInfo
 * @property {number} id - 用户ID
 * @property {string} nickname - 昵称
 * @property {string} avatar - 头像URL
 * @property {string} phone - 手机号
 * @property {number} gender - 性别 0-未知 1-男 2-女
 * @property {string} birthday - 生日
 * @property {string} bio - 个人简介
 * @property {string} createdAt - 创建时间
 * @property {string} updatedAt - 更新时间
 */

/**
 * VIP套餐
 * @typedef {Object} VipPackage
 * @property {number} id - 套餐ID
 * @property {string} name - 套餐名称
 * @property {string} description - 套餐描述
 * @property {number} price - 价格
 * @property {number} duration - 时长(月)
 * @property {Array<string>} benefits - 权益列表
 * @property {boolean} isRecommended - 是否推荐
 */

/**
 * VIP订阅状态
 * @typedef {Object} VipSubscription
 * @property {boolean} isVip - 是否是VIP
 * @property {string} vipType - VIP类型
 * @property {string} expireTime - 过期时间
 * @property {boolean} autoRenewal - 是否自动续费
 * @property {VipPackage} currentPackage - 当前套餐
 */

/**
 * 活动信息
 * @typedef {Object} Party
 * @property {number} id - 活动ID
 * @property {string} title - 标题
 * @property {string} description - 描述
 * @property {string} coverImage - 封面图
 * @property {string} startTime - 开始时间
 * @property {string} endTime - 结束时间
 * @property {string} location - 地点
 * @property {number} maxParticipants - 最大参与人数
 * @property {number} currentParticipants - 当前参与人数
 * @property {string} status - 状态
 * @property {UserInfo} organizer - 组织者
 */

/**
 * 订单信息
 * @typedef {Object} Order
 * @property {number} id - 订单ID
 * @property {string} orderNo - 订单号
 * @property {number} partyId - 活动ID
 * @property {string} partyTitle - 活动标题
 * @property {number} amount - 金额
 * @property {string} status - 状态
 * @property {string} createdAt - 创建时间
 * @property {string} paidAt - 支付时间
 */

/**
 * 标签信息
 * @typedef {Object} Tag
 * @property {number} id - 标签ID
 * @property {string} name - 标签名称
 * @property {string} icon - 图标
 * @property {number} usageCount - 使用次数
 * @property {boolean} isHot - 是否热门
 */

/**
 * 聊天消息
 * @typedef {Object} ChatMessage
 * @property {number} id - 消息ID
 * @property {number} senderId - 发送者ID
 * @property {string} senderName - 发送者名称
 * @property {string} senderAvatar - 发送者头像
 * @property {string} content - 内容
 * @property {string} type - 类型 text/image/voice
 * @property {string} createdAt - 创建时间
 */

/**
 * 通知消息
 * @typedef {Object} Notification
 * @property {number} id - 通知ID
 * @property {string} title - 标题
 * @property {string} content - 内容
 * @property {string} type - 类型
 * @property {boolean} isRead - 是否已读
 * @property {string} createdAt - 创建时间
 */

/**
 * 推荐活动
 * @typedef {Object} Recommendation
 * @property {number} id - 推荐ID
 * @property {Party} party - 活动信息
 * @property {number} score - 推荐分数
 * @property {string} reason - 推荐理由
 */

// 导出空对象，确保文件可以被导入
export default {}
