<template>
  <view class="container">
    <view class="header">
      <text class="title">帮助中心</text>
    </view>
    <view class="faq-list">
      <view class="faq-item" v-for="(item, index) in faqs" :key="index">
        <text class="question">Q: {{item.q}}</text>
        <text class="answer">A: {{item.a}}</text>
      </view>
    </view>
    <view class="contact">
      <text class="contact-text">仍有问题？联系客服</text>
      <button class="contact-btn" @tap="goToService">联系客服</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      faqs: [
        { q: '如何创建聚会？', a: '点击底部TabBar的"发布"按钮，填写聚会信息即可创建。' },
        { q: '如何购票？', a: '在聚会详情页选择票型，点击"立即购票"完成支付。' },
        { q: '支持哪些支付方式？', a: '目前支持微信支付、支付宝和钱包余额支付。' },
        { q: '如何申请退款？', a: '在"我的订单"中找到对应订单，点击"申请退款"。' },
        { q: '如何成为VIP？', a: '进入"VIP中心"页面，选择适合的VIP套餐开通。' }
      ]
    }
  },
  methods: {
    goToService() {
      uni.navigateTo({ url: '/pages/customer-service/customer-service' })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #0a0a0a;
  padding: 30rpx;
}
.header {
  margin-bottom: 40rpx;
}
.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}
.faq-item {
  background: #1a1a1a;
  border-radius: 16rpx;
  padding: 30rpx;
}
.question {
  display: block;
  font-size: 30rpx;
  color: #FF6B35;
  font-weight: bold;
  margin-bottom: 16rpx;
}
.answer {
  display: block;
  font-size: 28rpx;
  color: #cccccc;
  line-height: 1.6;
}
.contact {
  margin-top: 60rpx;
  text-align: center;
}
.contact-text {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}
.contact-btn {
  width: 300rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #FF6B35, #FF8E53);
  border: none;
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #ffffff;
}
</style>
