export interface Faq {
  question: string;
  answer: string;
}

export const FAQ_LIST: readonly Faq[] = [
  {
    question: '如何参加聚会？',
    answer:
      '在首页浏览聚会列表，选择感兴趣的聚会，点击立即报名按钮，选择票型并完成支付即可参加。',
  },
  {
    question: '如何申请退款？',
    answer:
      '在我的-我的订单中找到需要退款的订单，点击申请退款按钮，填写退款原因并提交即可。',
  },
  {
    question: '聚会取消怎么办？',
    answer: '如果聚会取消，我们会通过短信和App通知您，并自动为您办理全额退款。',
  },
  {
    question: '如何成为VIP会员？',
    answer:
      '在我的-VIP中心页面，选择适合您的VIP套餐，完成支付即可成为VIP会员。',
  },
];

export const SERVICE_PHONE = '400-123-4567';
export const SERVICE_NICKNAME = '聚聚客服';
export const SERVICE_AVAILABLE_HOURS = '9:00-21:00';
export const SERVICE_AVATAR_INITIALS = 'JU';
export const CONVERSATION_ID = 'customer-service';
