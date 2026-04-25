/**
 * 帮助文档数据强制初始化脚本
 * 删除现有帮助文档并重新创建
 */

const path = require('path')

// 加载环境变量
const envPath = path.join(__dirname, '..', '.env.production')
console.log('Loading env from:', envPath)
require('dotenv').config({ path: envPath })

const { sequelize } = require('../src/config/database')
const Announcement = require('../src/models/Announcement')
const logger = require('../src/utils/logger')

// 帮助文档数据 - 按分类组织
const helpArticles = [
  // ========== 快速入门 (getting-started) ==========
  {
    title: '如何注册聚聚账号',
    content: `# 如何注册聚聚账号\n\n## 注册步骤\n\n1. 打开聚聚APP或访问官网\n2. 点击"注册"按钮\n3. 输入手机号码并获取验证码\n4. 设置登录密码\n5. 完善个人资料（头像、昵称等）\n\n## 注意事项\n\n- 请使用真实有效的手机号码\n- 密码长度至少8位，包含字母和数字\n- 一个手机号只能注册一个账号\n\n## 常见问题\n\n**Q: 收不到验证码怎么办？**\nA: 请检查手机信号，或稍等60秒后重新获取。如仍有问题，请联系客服。\n\n**Q: 可以用邮箱注册吗？**\nA: 目前仅支持手机号注册，邮箱功能将在后续版本支持。`,
    category: 'getting-started',
    type: 'help',
    status: 'published',
    published_at: new Date()
  },
  {
    title: '如何创建我的第一个聚会',
    content: `# 如何创建我的第一个聚会\n\n## 创建步骤\n\n1. 登录聚聚APP\n2. 点击底部"+"按钮或"创建聚会"\n3. 填写聚会信息：\n   - 聚会标题\n   - 聚会描述\n   - 时间地点\n   - 人数限制\n   - 费用说明\n4. 上传聚会封面图片\n5. 设置票种类型（免费/收费）\n6. 提交审核\n\n## 审核说明\n\n- 聚会创建后需要平台审核\n- 审核时间通常为1-2小时\n- 审核通过后会自动发布\n\n## 小贴士\n\n- 详细的描述能吸引更多人参加\n- 清晰的封面图片能提升点击率\n- 合理设置人数限制，避免超员`,
    category: 'getting-started',
    type: 'help',
    status: 'published',
    published_at: new Date()
  },
  {
    title: '如何参加感兴趣的聚会',
    content: `# 如何参加感兴趣的聚会\n\n## 参加步骤\n\n1. 浏览首页或搜索感兴趣的聚会\n2. 点击聚会卡片查看详情\n3. 点击"立即报名"按钮\n4. 选择票种类型\n5. 确认报名信息\n6. 完成支付（如为收费聚会）\n7. 等待组织者确认\n\n## 报名状态\n\n- **待确认**：等待组织者审核\n- **已通过**：报名成功，可以参加\n- **已拒绝**：报名人数已满或不符合要求\n\n## 取消报名\n\n如需取消报名，请在"我的"-"我的报名"中找到对应聚会，点击"取消报名"。\n\n## 注意事项\n\n- 请仔细阅读聚会详情和要求\n- 遵守聚会规则，准时参加\n- 如有变动请提前告知组织者`,
    category: 'getting-started',
    type: 'help',
    status: 'published',
    published_at: new Date()
  },
  {
    title: '聚聚APP下载与安装',
    content: `# 聚聚APP下载与安装\n\n## 下载方式\n\n### iOS用户\n1. 打开App Store\n2. 搜索"聚聚"\n3. 点击"获取"下载安装\n\n### Android用户\n1. 打开应用商店（华为、小米、OPPO、vivo等）\n2. 搜索"聚聚"\n3. 点击"安装"\n\n### 官网下载\n访问 https://www.hfparty.asia 扫码下载\n\n## 系统要求\n\n- iOS 12.0 或更高版本\n- Android 6.0 或更高版本\n\n## 更新说明\n\n- APP会自动检测新版本\n- 建议开启自动更新以获得最佳体验\n- 重大更新会在公告中提前通知`,
    category: 'getting-started',
    type: 'help',
    status: 'published',
    published_at: new Date()
  },
  {
    title: '新手必读：聚聚使用指南',
    content: `# 新手必读：聚聚使用指南\n\n## 什么是聚聚？\n\n聚聚是一个专注于线下社交活动的平台，帮助用户发现和参与各种有趣的聚会活动，结识志同道合的朋友。\n\n## 主要功能\n\n### 发现聚会\n- 浏览首页推荐的热门聚会\n- 按分类筛选（运动、美食、旅行、学习等）\n- 搜索关键词查找特定活动\n\n### 创建聚会\n- 轻松创建自己的聚会活动\n- 管理报名人员和活动详情\n- 与参与者实时沟通\n\n### 社交互动\n- 关注感兴趣的用户\n- 点赞、评论聚会活动\n- 私信交流\n\n## 安全提示\n\n- 保护个人隐私，不要轻易透露敏感信息\n- 参加聚会时注意人身安全\n- 遇到问题及时联系平台客服\n\n## 客服支持\n\n- 在线客服：APP内"我的"-"帮助与反馈"\n- 客服邮箱：support@hfparty.asia\n- 客服电话：400-XXX-XXXX`,
    category: 'getting-started',
    type: 'help',
    status: 'published',
    published_at: new Date()
  },

  // ========== 账户管理 (account) ==========
  {
    title: '如何修改个人资料',
    content: `# 如何修改个人资料\n\n## 修改步骤\n\n1. 打开聚聚APP，点击"我的"\n2. 点击头像进入个人主页\n3. 点击"编辑资料"\n4. 修改需要更新的信息：\n   - 头像\n   - 昵称\n   - 性别\n   - 生日\n   - 个性签名\n   - 兴趣爱好\n5. 点击"保存"\n\n## 资料完善度\n\n- 完善度越高，越容易获得其他用户的信任\n- 建议至少上传头像和填写昵称\n- 详细的个人介绍能增加交友机会\n\n## 注意事项\n\n- 昵称不能包含敏感词汇\n- 头像不能包含违规内容\n- 个人资料会公开展示给其他用户`,
    category: 'account',
    type: 'help',
    status: 'published',
    published_at: new Date()
  },
  {
    title: '如何修改密码',
    content: `# 如何修改密码\n\n## 修改步骤\n\n1. 打开聚聚APP，点击"我的"\n2. 进入"设置"\n3. 选择"账号与安全"\n4. 点击"修改密码"\n5. 输入原密码\n6. 输入新密码（8-20位，包含字母和数字）\n7. 确认新密码\n8. 点击"确定"\n\n## 忘记密码\n\n如果忘记密码，可以通过以下方式重置：\n1. 在登录页面点击"忘记密码"\n2. 输入注册手机号\n3. 获取验证码\n4. 设置新密码\n\n## 密码安全建议\n\n- 定期更换密码（建议3个月一次）\n- 不要使用简单密码（如123456、生日等）\n- 不同平台使用不同密码\n- 开启指纹/面容ID登录更安全`,
    category: 'account',
    type: 'help',
    status: 'published',
    published_at: new Date()
  },
  {
    title: '如何绑定/解绑手机号',
    content: `# 如何绑定/解绑手机号\n\n## 更换手机号\n\n1. 打开聚聚APP，点击"我的"\n2. 进入"设置"-"账号与安全"\n3. 点击"手机号"\n4. 验证当前手机号\n5. 输入新手机号\n6. 获取并输入验证码\n7. 点击"确认更换"\n\n## 注意事项\n\n- 一个手机号只能绑定一个账号\n- 更换手机号需要验证原手机号\n- 如原手机号已停用，请联系客服处理\n\n## 解绑说明\n\n聚聚账号必须绑定手机号，暂不支持完全解绑。如需注销账号，请联系客服。`,
    category: 'account',
    type: 'help',
    status: 'published',
    published_at: new Date()
  },
  {
    title: '账号注销说明',
    content: `# 账号注销说明\n\n## 注销前须知\n\n账号注销是不可逆操作，注销后：\n- 所有个人资料将被删除\n- 发布的聚会将被下架\n- 历史订单记录将被清除\n- 积分、优惠券等权益将失效\n\n## 注销条件\n\n1. 账号无未完成的订单\n2. 账号无未处理的纠纷\n3. 账号无冻结资金\n4. 账号处于正常状态\n\n## 注销流程\n\n1. 联系在线客服申请注销\n2. 客服核实账号状态\n3. 确认注销意愿\n4. 等待7天冷静期\n5. 正式注销账号\n\n## 温馨提示\n\n- 注销前请备份重要数据\n- 冷静期内可以撤销注销申请\n- 注销后无法恢复账号`,
    category: 'account',
    type: 'help',
    status: 'published',
    published_at: new Date()
  },

  // ========== 聚会活动 (parties) ==========
  {
    title: '聚会审核规则说明',
    content: `# 聚会审核规则说明\n\n## 审核目的\n\n为了确保平台活动质量，维护良好的社区环境，所有聚会创建后都需要经过平台审核。\n\n## 审核内容\n\n1. **标题和描述**\n   - 不能包含敏感词汇\n   - 不能含有虚假宣传\n   - 内容要清晰完整\n\n2. **图片内容**\n   - 不能含有违法违规内容\n   - 不能含有低俗色情内容\n   - 图片要清晰、真实\n\n3. **活动信息**\n   - 时间地点要明确\n   - 费用说明要清晰\n   - 人数限制要合理\n\n## 审核时间\n\n- 工作日：1-2小时\n- 周末/节假日：2-4小时\n- 特殊情况可能延长\n\n## 审核结果\n\n- **通过**：聚会自动发布\n- **拒绝**：会告知具体原因，可修改后重新提交\n\n## 常见拒绝原因\n\n- 信息填写不完整\n- 含有违规内容\n- 活动类型不符合平台规定\n- 联系方式不规范`,
    category: 'parties',
    type: 'help',
    status: 'published',
    published_at: new Date()
  },
  {
    title: '如何管理聚会报名人员',
    content: `# 如何管理聚会报名人员\n\n## 查看报名列表\n\n1. 打开"我的"-"我创建的"\n2. 选择要管理的聚会\n3. 点击"报名管理"\n4. 查看所有报名人员\n\n## 报名状态管理\n\n### 确认报名\n- 点击"通过"确认报名\n- 报名人会收到通知\n- 确认后报名成功\n\n### 拒绝报名\n- 点击"拒绝"取消报名\n- 可填写拒绝原因\n- 报名人会收到通知\n\n### 标记签到\n- 聚会当天可标记签到\n- 方便统计实际到场人数\n\n## 批量操作\n\n- 支持批量通过/拒绝\n- 支持导出报名名单\n- 支持发送群消息\n\n## 注意事项\n\n- 请及时处理报名申请\n- 公平对待每个报名者\n- 如有变动及时通知参与者`,
    category: 'parties',
    type: 'help',
    status: 'published',
    published_at: new Date()
  },
  {
    title: '聚会取消与退款规则',
    content: `# 聚会取消与退款规则\n\n## 组织者取消聚会\n\n### 取消条件\n- 聚会开始前可以随时取消\n- 取消后所有报名者会收到通知\n- 已收款的需要处理退款\n\n### 取消步骤\n1. 进入"我的"-"我创建的"\n2. 选择要取消的聚会\n3. 点击"取消聚会"\n4. 填写取消原因\n5. 确认取消\n\n## 参与者取消报名\n\n### 取消时间\n- 聚会开始前24小时：全额退款\n- 聚会开始前12-24小时：退款80%\n- 聚会开始前12小时内：退款50%\n- 聚会开始后：不退款\n\n### 取消步骤\n1. 进入"我的"-"我的报名"\n2. 选择要取消的报名\n3. 点击"取消报名"\n4. 确认取消\n\n## 退款说明\n\n- 退款将原路返回支付账户\n- 退款时间：3-7个工作日\n- 如有疑问请联系客服`,
    category: 'parties',
    type: 'help',
    status: 'published',
    published_at: new Date()
  },

  // ========== 支付问题 (payments) ==========
  {
    title: '支持的支付方式',
    content: `# 支持的支付方式\n\n## 目前支持的支付方式\n\n### 微信支付\n- 需要在手机上安装微信APP\n- 支持微信零钱和绑定的银行卡\n\n### 支付宝\n- 需要在手机上安装支付宝APP\n- 支持余额和绑定的银行卡\n\n## 支付流程\n\n1. 选择要参加的聚会\n2. 点击"立即报名"\n3. 选择支付方式\n4. 完成支付\n5. 等待组织者确认\n\n## 支付安全\n\n- 所有支付通过官方渠道完成\n- 平台不存储支付密码\n- 支持支付密码和指纹/面容验证\n\n## 常见问题\n\n**Q: 支付失败怎么办？**\nA: 请检查网络连接，或更换支付方式重试。\n\n**Q: 可以开发票吗？**\nA: 可以，请在支付后联系客服申请发票。`,
    category: 'payments',
    type: 'help',
    status: 'published',
    published_at: new Date()
  },
  {
    title: '如何申请退款',
    content: `# 如何申请退款\n\n## 退款条件\n\n1. 聚会尚未开始\n2. 符合退款时间规定\n3. 非特殊说明不可退款的聚会\n\n## 退款流程\n\n### 自动退款\n- 在"我的报名"中取消报名\n- 系统自动计算退款金额\n- 退款原路返回\n\n### 人工退款\n- 联系客服说明退款原因\n- 客服核实情况后处理\n- 3-7个工作日到账\n\n## 退款时间\n\n| 取消时间 | 退款比例 |\n|---------|---------|\n| 开始前24小时以上 | 100% |\n| 开始前12-24小时 | 80% |\n| 开始前12小时内 | 50% |\n| 开始后 | 0% |\n\n## 特殊情况\n\n如因组织者原因取消聚会，将全额退款。\n\n## 退款查询\n\n可在"我的"-"钱包"-"交易记录"中查看退款状态。`,
    category: 'payments',
    type: 'help',
    status: 'published',
    published_at: new Date()
  },

  // ========== VIP服务 (vip) ==========
  {
    title: 'VIP会员权益介绍',
    content: `# VIP会员权益介绍\n\n## VIP等级\n\n### 普通VIP\n- 价格：29元/月\n- 创建聚会优先审核\n- 每月5次置顶机会\n- 专属客服通道\n\n### 高级VIP\n- 价格：99元/季\n- 包含普通VIP所有权益\n- 每月15次置顶机会\n- 聚会推广位展示\n- 数据分析报告\n\n### 至尊VIP\n- 价格：299元/年\n- 包含高级VIP所有权益\n- 无限次置顶\n- 专属活动页面\n- 1对1专属顾问\n\n## 如何开通\n\n1. 打开"我的"-"VIP中心"\n2. 选择VIP等级\n3. 选择支付方式\n4. 完成支付即可开通\n\n## 续费说明\n\n- 到期前7天会提醒续费\n- 支持自动续费\n- 续费可享受优惠价格`,
    category: 'vip',
    type: 'help',
    status: 'published',
    published_at: new Date()
  },
  {
    title: '如何开通VIP会员',
    content: `# 如何开通VIP会员\n\n## 开通步骤\n\n1. 打开聚聚APP\n2. 点击"我的"\n3. 进入"VIP中心"\n4. 选择VIP等级：\n   - 普通VIP（月卡）\n   - 高级VIP（季卡）\n   - 至尊VIP（年卡）\n5. 点击"立即开通"\n6. 选择支付方式\n7. 完成支付\n\n## 支付方式\n\n- 微信支付\n- 支付宝\n- 余额支付（如有）\n\n## 开通成功\n\n- 立即享受VIP权益\n- 个人主页显示VIP标识\n- 获得专属客服通道\n\n## 常见问题\n\n**Q: VIP可以退款吗？**\nA: VIP服务为虚拟商品，开通后不支持退款。\n\n**Q: 可以升级VIP等级吗？**\nA: 可以，补差价即可升级。\n\n**Q: VIP到期后会怎样？**\nA: 权益自动失效，可续费恢复。`,
    category: 'vip',
    type: 'help',
    status: 'published',
    published_at: new Date()
  }
]

async function seedHelpArticles() {
  try {
    logger.info('开始强制初始化帮助文档数据...')

    // 测试数据库连接
    await sequelize.authenticate()
    logger.info('数据库连接成功')

    // 同步模型（添加新字段）
    logger.info('同步数据库模型...')
    await sequelize.sync({ alter: true })
    logger.info('数据库模型同步完成')

    // 删除现有的帮助文档
    logger.info('删除现有帮助文档...')
    const deletedCount = await Announcement.destroy({
      where: { type: 'help' }
    })
    logger.info(`已删除 ${deletedCount} 条现有帮助文档`)

    // 批量创建帮助文档
    logger.info('开始创建新的帮助文档...')
    for (const article of helpArticles) {
      await Announcement.create(article)
      logger.info(`创建帮助文档: [${article.category}] ${article.title}`)
    }

    logger.info(`成功创建 ${helpArticles.length} 条帮助文档`)
    process.exit(0)
  } catch (error) {
    logger.error('初始化帮助文档失败:', error)
    process.exit(1)
  }
}

// 执行初始化
seedHelpArticles()
