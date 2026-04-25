<template>
  <view class="payment-container">
    <view class="order-summary">
      <view class="party-info">
        <image class="party-thumb" :src="party.images?.[0] || '/static/default-party.png'" mode="aspectFill"></image>
        <view class="party-details">
          <text class="party-title">{{ party.title }}</text>
          <text class="party-time">{{ formatDateTime(party.start_time) }}</text>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="content-scroll">
      <view class="section">
        <view class="section-header">
          <text class="section-title">订单信息</text>
        </view>

        <view class="order-info">
          <view class="info-row">
            <text class="info-label">票型</text>
            <text class="info-value">{{ ticket.name }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">姓名</text>
            <text class="info-value">{{ orderInfo.name }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">手机号</text>
            <text class="info-value">{{ orderInfo.phone }}</text>
          </view>
          <view class="info-row" v-if="orderInfo.remark">
            <text class="info-label">备注</text>
            <text class="info-value">{{ orderInfo.remark }}</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">支付方式</text>
        </view>

        <view class="payment-methods">
          <view 
            class="payment-method" 
            :class="{ selected: paymentMethod === 'wechat' }"
            @tap="selectPaymentMethod('wechat')"
          >
            <image class="payment-icon" src="/static/wechat-pay.png" mode="aspectFit"></image>
            <text class="payment-name">微信支付</text>
            <view class="check-icon" v-if="paymentMethod === 'wechat'">
              <text>✓</text>
            </view>
          </view>

          <view 
            class="payment-method" 
            :class="{ selected: paymentMethod === 'alipay' }"
            @tap="selectPaymentMethod('alipay')"
          >
            <image class="payment-icon" src="/static/alipay-pay.png" mode="aspectFit"></image>
            <text class="payment-name">支付宝</text>
            <view class="check-icon" v-if="paymentMethod === 'alipay'">
              <text>✓</text>
            </view>
          </view>

          <view 
            class="payment-method" 
            :class="{ selected: paymentMethod === 'wallet' }"
            @tap="selectPaymentMethod('wallet')"
          >
            <image class="payment-icon" src="/static/wallet-pay.png" mode="aspectFit"></image>
            <text class="payment-name">钱包支付</text>
            <view class="wallet-balance" v-if="walletBalance">
              <text>余额: ¥{{ walletBalance }}</text>
            </view>
            <view class="check-icon" v-if="paymentMethod === 'wallet'">
              <text>✓</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">费用明细</text>
        </view>

        <view class="cost-details">
          <view class="cost-row">
            <text class="cost-label">票款</text>
            <text class="cost-value">¥{{ ticket.price }}</text>
          </view>
          <view class="cost-row" v-if="ticket.original_price && ticket.original_price > ticket.price">
            <text class="cost-label">优惠</text>
            <text class="cost-value discount">-¥{{ (ticket.original_price - ticket.price).toFixed(2) }}</text>
          </view>
          <view class="cost-row total">
            <text class="cost-label">合计</text>
            <text class="cost-value">¥{{ ticket.price }}</text>
          </view>
        </view>
      </view>

      <view class="tips">
        <text class="tips-text">支付成功后，票券将发送至您的票券包</text>
      </view>
    </scroll-view>

    <view class="bottom-action-bar">
      <view class="price-summary">
        <text class="summary-label">应付金额:</text>
        <text class="summary-price">¥{{ ticket.price }}</text>
      </view>
      <button 
        class="pay-btn" 
        :disabled="paying"
        @tap="handlePay"
      >
        <text v-if="!paying">{{ getPayButtonText() }}</text>
        <text v-else>支付中...</text>
      </button>
    </view>
  </view>
</template>

<script>
import { paymentApi } from '../../api/order'

export default {
  data() {
    return {
      orderId: null,
      party: null,
      ticket: null,
      orderInfo: null,
      paymentMethod: 'wechat',
      walletBalance: 0,
      paying: false
    }
  },

  onLoad(options) {
    this.orderId = options.orderId
    this.party = JSON.parse(decodeURIComponent(options.party || '{}'))
    this.ticket = JSON.parse(decodeURIComponent(options.ticket || '{}'))
    this.orderInfo = JSON.parse(decodeURIComponent(options.orderInfo || '{}'))
    this.loadWalletBalance()
  },

  methods: {
    async loadWalletBalance() {
      try {
        const res = await this.$http.get('/wallet')
        if (res.code === 0) {
          this.walletBalance = res.data.balance || 0
        }
      } catch (error) {
        // console.error('加载钱包余额失败:', error)
      }
    },

    selectPaymentMethod(method) {
      this.paymentMethod = method
    },

    getPayButtonText() {
      if (this.paymentMethod === 'wechat') {
        return '微信支付'
      } else if (this.paymentMethod === 'alipay') {
        return '支付宝支付'
      } else if (this.paymentMethod === 'wallet') {
        return '钱包支付'
      }
      return '立即支付'
    },

    async handlePay() {
      if (this.paymentMethod === 'wallet' && this.walletBalance < this.ticket.price) {
        uni.showToast({
          title: '钱包余额不足',
          icon: 'none'
        })
        return
      }

      this.paying = true

      try {
        const res = await paymentApi.createPayment(this.orderId, { payment_method: this.paymentMethod })

        if (res.code === 0) {
          const paymentData = res.data

          if (this.paymentMethod === 'wechat') {
            await this.handleWeChatPay(paymentData)
          } else if (this.paymentMethod === 'alipay') {
            await this.handleAlipayPay(paymentData)
          } else if (this.paymentMethod === 'wallet') {
            await this.handleWalletPay()
          }
        } else {
          uni.showToast({
            title: res.message || '创建支付失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.showToast({
          title: '支付失败',
          icon: 'none'
        })
      } finally {
        this.paying = false
      }
    },

    handleWeChatPay(paymentData) {
      return new Promise((resolve, reject) => {
        uni.requestPayment({
          provider: 'wxpay',
          timeStamp: paymentData.timeStamp,
          nonceStr: paymentData.nonceStr,
          package: paymentData.package,
          signType: paymentData.signType,
          paySign: paymentData.paySign,
          success: () => {
            this.handlePaymentSuccess()
            resolve()
          },
          fail: (error) => {
            this.handlePaymentFail(error)
            reject(error)
          }
        })
      })
    },

    handleAlipayPay(paymentData) {
      return new Promise((resolve, reject) => {
        uni.requestPayment({
          provider: 'alipay',
          orderInfo: paymentData.orderInfo,
          success: () => {
            this.handlePaymentSuccess()
            resolve()
          },
          fail: (error) => {
            this.handlePaymentFail(error)
            reject(error)
          }
        })
      })
    },

    async handleWalletPay() {
      this.handlePaymentSuccess()
    },

    handlePaymentSuccess() {
      uni.showToast({
        title: '支付成功',
        icon: 'success'
      })

      setTimeout(() => {
        uni.redirectTo({
          url: `/pages/my-tickets/my-tickets`
        })
      }, 1500)
    },

    handlePaymentFail(error) {
      uni.showToast({
        title: '支付失败',
        icon: 'none'
      })

      setTimeout(() => {
        uni.redirectTo({
          url: `/pages/my-orders/my-orders`
        })
      }, 1500)
    },

    formatDateTime(time) {
      if (!time) return ''
      const date = new Date(time)
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${month}月${day}日 ${hours}:${minutes}`
    }
  }
}
</script>

<style lang="scss" scoped>
.payment-container {
  min-height: 100vh;
  background: #000000;
  padding-bottom: 150rpx;
}

.order-summary {
  padding: 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.party-info {
  display: flex;
  gap: 30rpx;
}

.party-thumb {
  width: 200rpx;
  height: 200rpx;
  border-radius: 20rpx;
}

.party-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.party-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 20rpx;
}

.party-time {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.content-scroll {
  height: calc(100vh - 150rpx - 350rpx);
}

.section {
  margin: 20rpx;
  background: #1a1a1a;
  border-radius: 20rpx;
  padding: 30rpx;
}

.section-header {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 25rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.6);
}

.info-value {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: bold;
  text-align: right;
  flex: 1;
  margin-left: 30rpx;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.payment-method {
  position: relative;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  border: 3rpx solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;

  &.selected {
    border-color: #FF6B35;
    background: rgba(255, 107, 53, 0.15);
  }

  &:active {
    transform: scale(0.98);
  }
}

.payment-icon {
  width: 60rpx;
  height: 60rpx;
  margin-right: 20rpx;
}

.payment-name {
  font-size: 28rpx;
  color: #ffffff;
}

.wallet-balance {
  margin-left: auto;
  font-size: 24rpx;
  color: #FFD700;
}

.check-icon {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 40rpx;
  height: 40rpx;
  background: #FF6B35;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 24rpx;
}

.cost-details {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.cost-row {
  display: flex;
  justify-content: space-between;
  align-items: center;

  &.total {
    padding-top: 20rpx;
    border-top: 1rpx solid rgba(255, 255, 255, 0.1);
    margin-top: 10rpx;
  }
}

.cost-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.6);
}

.cost-value {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: bold;

  &.discount {
    color: #4CAF50;
  }
}

.tips {
  margin: 30rpx 40rpx;
  padding: 20rpx;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 15rpx;
  border-left: 4rpx solid #FF6B35;
}

.tips-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
}

.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30rpx 40rpx;
  background: linear-gradient(to top, #1a1a1a 0%, rgba(26, 26, 26, 0.95) 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}

.price-summary {
  display: flex;
  align-items: baseline;
}

.summary-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-right: 15rpx;
}

.summary-price {
  font-size: 48rpx;
  font-weight: bold;
  color: #FF6B35;
}

.pay-btn {
  flex: 1;
  height: 90rpx;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  box-shadow: 0 10rpx 30rpx rgba(255, 107, 53, 0.4);

  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.3);
  }

  &::after {
    border: none;
  }
}
</style>
