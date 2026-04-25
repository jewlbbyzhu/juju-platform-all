<template>
  <view class="customer-service-container">
    <!-- 头部信息 -->
    <view class="header-section">
      <view class="service-avatar">
        <image src="/static/logo.png" mode="aspectFill" />
      </view>
      <text class="service-name">聚聚客服</text>
      <text class="service-desc">在线时间：9:00-21:00</text>
    </view>

    <!-- 常见问题 -->
    <view class="faq-section">
      <text class="section-title">常见问题</text>
      <view class="faq-list">
        <view
          v-for="(faq, index) in faqList"
          :key="index"
          class="faq-item"
          @tap="showFaqDetail(faq)"
        >
          <text class="faq-question">{{ faq.question }}</text>
          <text class="faq-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 联系方式 -->
    <view class="contact-section">
      <text class="section-title">联系我们</text>
      <view class="contact-list">
        <view class="contact-item" @tap="makePhoneCall">
          <view class="contact-icon">📞</view>
          <view class="contact-info">
            <text class="contact-title">客服电话</text>
            <text class="contact-value">400-123-4567</text>
          </view>
          <text class="contact-action">拨打</text>
        </view>
        <view class="contact-item" @tap="copyEmail">
          <view class="contact-icon">✉️</view>
          <view class="contact-info">
            <text class="contact-title">客服邮箱</text>
            <text class="contact-value">support@juju.com</text>
          </view>
          <text class="contact-action">复制</text>
        </view>
        <view class="contact-item" @tap="openChat">
          <view class="contact-icon">💬</view>
          <view class="contact-info">
            <text class="contact-title">在线客服</text>
            <text class="contact-value">点击开始对话</text>
          </view>
          <text class="contact-action">进入</text>
        </view>
      </view>
    </view>

    <!-- 服务承诺 -->
    <view class="promise-section">
      <text class="section-title">服务承诺</text>
      <view class="promise-list">
        <view class="promise-item">
          <view class="promise-icon">⚡</view>
          <text class="promise-text">快速响应</text>
        </view>
        <view class="promise-item">
          <view class="promise-icon">🛡️</view>
          <text class="promise-text">安全保障</text>
        </view>
        <view class="promise-item">
          <view class="promise-icon">💯</view>
          <text class="promise-text">满意服务</text>
        </view>
      </view>
    </view>

    <!-- 在线客服按钮 -->
    <view class="chat-button" @tap="openChat">
      <text class="chat-icon">💬</text>
      <text class="chat-text">在线咨询</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// FAQ列表
const faqList = ref([
  {
    question: '如何参加聚会？',
    answer: '在首页浏览聚会列表，选择感兴趣的聚会，点击"立即报名"按钮，选择票型并完成支付即可参加。'
  },
  {
    question: '如何申请退款？',
    answer: '在"我的-我的订单"中找到需要退款的订单，点击"申请退款"按钮，填写退款原因并提交即可。'
  },
  {
    question: '聚会取消怎么办？',
    answer: '如果聚会取消，我们会通过短信和App通知您，并自动为您办理全额退款。'
  },
  {
    question: '如何成为VIP会员？',
    answer: '在"我的-VIP中心"页面，选择适合您的VIP套餐，完成支付即可成为VIP会员。'
  },
  {
    question: '如何发布聚会？',
    answer: '点击首页右上角的"+"按钮，填写聚会信息并提交审核，审核通过后即可发布。'
  },
  {
    question: '如何联系主办方？',
    answer: '在聚会详情页点击"联系主办方"按钮，或在订单详情页点击"联系客服"。'
  }
])

// 显示FAQ详情
const showFaqDetail = (faq: { question: string; answer: string }) => {
  uni.showModal({
    title: faq.question,
    content: faq.answer,
    showCancel: false
  })
}

// 拨打电话
const makePhoneCall = () => {
  uni.makePhoneCall({
    phoneNumber: '400-123-4567'
  })
}

// 复制邮箱
const copyEmail = () => {
  uni.setClipboardData({
    data: 'support@juju.com',
    success: () => {
      uni.showToast({
        title: '已复制',
        icon: 'success'
      })
    }
  })
}

// 打开在线客服
const openChat = () => {
  uni.navigateTo({
    url: '/pages/private-chat/private-chat?userId=0&userName=客服助手'
  })
}
</script>

<style lang="scss" scoped>
.customer-service-container {
  min-height: 100vh;
  background-color: #000;
  padding: 20rpx;
  padding-bottom: 140rpx;
}

// 头部信息
.header-section {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F5C 100%);
  border-radius: 20rpx;
  padding: 40rpx;
  text-align: center;
  margin-bottom: 20rpx;

  .service-avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background-color: #fff;
    margin: 0 auto 20rpx;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    image {
      width: 80%;
      height: 80%;
    }
  }

  .service-name {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 10rpx;
  }

  .service-desc {
    display: block;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

// 常见问题
.faq-section {
  background-color: #1a1a1a;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 20rpx;
    display: block;
  }

  .faq-list {
    .faq-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #333;

      &:last-child {
        border-bottom: none;
      }

      .faq-question {
        flex: 1;
        font-size: 28rpx;
        color: #fff;
        margin-right: 20rpx;
      }

      .faq-arrow {
        font-size: 32rpx;
        color: #999;
      }
    }
  }
}

// 联系方式
.contact-section {
  background-color: #1a1a1a;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 20rpx;
    display: block;
  }

  .contact-list {
    .contact-item {
      display: flex;
      align-items: center;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #333;

      &:last-child {
        border-bottom: none;
      }

      .contact-icon {
        width: 80rpx;
        height: 80rpx;
        background-color: #2a2a2a;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 40rpx;
        margin-right: 20rpx;
      }

      .contact-info {
        flex: 1;

        .contact-title {
          display: block;
          font-size: 28rpx;
          color: #fff;
          margin-bottom: 6rpx;
        }

        .contact-value {
          display: block;
          font-size: 24rpx;
          color: #999;
        }
      }

      .contact-action {
        font-size: 26rpx;
        color: #FF6B35;
        padding: 8rpx 20rpx;
        border: 1rpx solid #FF6B35;
        border-radius: 30rpx;
      }
    }
  }
}

// 服务承诺
.promise-section {
  background-color: #1a1a1a;
  border-radius: 16rpx;
  padding: 30rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 20rpx;
    display: block;
  }

  .promise-list {
    display: flex;
    justify-content: space-around;

    .promise-item {
      text-align: center;

      .promise-icon {
        width: 100rpx;
        height: 100rpx;
        background-color: #2a2a2a;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 48rpx;
        margin-bottom: 16rpx;
      }

      .promise-text {
        font-size: 26rpx;
        color: #fff;
      }
    }
  }
}

// 在线客服按钮
.chat-button {
  position: fixed;
  bottom: 40rpx;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F5C 100%);
  border-radius: 50rpx;
  padding: 24rpx 60rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 8rpx 30rpx rgba(255, 107, 53, 0.4);

  .chat-icon {
    font-size: 36rpx;
    margin-right: 12rpx;
  }

  .chat-text {
    font-size: 30rpx;
    font-weight: bold;
    color: #fff;
  }
}
</style>
