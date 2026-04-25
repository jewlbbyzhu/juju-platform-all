<template>
  <view class="ticket-selection-container">
    <view class="party-summary">
      <image class="party-thumb" :src="party.images?.[0] || '/static/default-party.png'" mode="aspectFill"></image>
      <view class="party-info">
        <text class="party-title">{{ party.title }}</text>
        <text class="party-time">{{ formatDateTime(party.start_time) }}</text>
        <view class="party-location">
          <text class="location-icon">📍</text>
          <text class="location-text">{{ party.address }}</text>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="content-scroll">
      <view class="section">
        <view class="section-header">
          <text class="section-title">选择票型</text>
          <text class="section-subtitle">已选: {{ selectedTicket?.name || '未选择' }}</text>
        </view>

        <view class="ticket-list">
          <view 
            class="ticket-card" 
            :class="{ selected: selectedTicket?.id === ticket.id, 'early-bird': isEarlyBird(ticket) }"
            v-for="ticket in party.ticket_types" 
            :key="ticket.id"
            @tap="selectTicket(ticket)"
          >
            <view class="ticket-header">
              <text class="ticket-name">{{ ticket.name }}</text>
              <view class="ticket-badges">
                <view class="badge" v-if="ticket.type === 2 || ticket.type === 5 || ticket.type === 6">
                  <text>早鸟</text>
                </view>
                <view class="badge" v-if="ticket.type === 3 || ticket.type === 5">
                  <text>男</text>
                </view>
                <view class="badge" v-if="ticket.type === 4 || ticket.type === 6">
                  <text>女</text>
                </view>
                <view class="badge free-badge" v-if="ticket.price === 0">
                  <text>免费</text>
                </view>
              </view>
            </view>

            <view class="ticket-price">
              <text class="current-price">¥{{ ticket.price }}</text>
              <text class="original-price" v-if="ticket.original_price && ticket.original_price > ticket.price">
                ¥{{ ticket.original_price }}
              </text>
              <view class="discount" v-if="getDiscount(ticket)">
                <text>{{ getDiscount(ticket) }}折</text>
              </view>
            </view>

            <view class="ticket-info">
              <view class="info-row">
                <text class="info-label">可用:</text>
                <text class="info-value">{{ ticket.available_count }}张</text>
              </view>
              <view class="info-row" v-if="ticket.max_per_user > 0">
                <text class="info-label">限购:</text>
                <text class="info-value">{{ ticket.max_per_user }}张/人</text>
              </view>
              <view class="info-row" v-if="ticket.early_bird_deadline">
                <text class="info-label">早鸟截止:</text>
                <text class="info-value">{{ formatTime(ticket.early_bird_deadline) }}</text>
              </view>
            </view>

            <view class="ticket-description" v-if="ticket.description">
              <text>{{ ticket.description }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">报名信息</text>
        </view>

        <view class="form-section">
          <view class="form-item">
            <text class="form-label">姓名 *</text>
            <input 
              class="form-input" 
              v-model="formData.name" 
              placeholder="请输入真实姓名"
              maxlength="20"
            />
          </view>

          <view class="form-item">
            <text class="form-label">手机号 *</text>
            <input 
              class="form-input" 
              v-model="formData.phone" 
              type="number"
              placeholder="请输入手机号"
              maxlength="11"
            />
          </view>

          <view class="form-item">
            <text class="form-label">性别 *</text>
            <view class="gender-options">
              <view 
                class="gender-option" 
                :class="{ selected: formData.gender === 1 }"
                @tap="formData.gender = 1"
              >
                <text>男</text>
              </view>
              <view 
                class="gender-option" 
                :class="{ selected: formData.gender === 2 }"
                @tap="formData.gender = 2"
              >
                <text>女</text>
              </view>
            </view>
          </view>

          <view class="form-item">
            <text class="form-label">备注</text>
            <textarea 
              class="form-textarea" 
              v-model="formData.remark" 
              placeholder="选填，如有特殊需求请备注"
              maxlength="200"
            />
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
          <view 
            class="payment-method" 
            :class="{ selected: paymentMethod === 'bankcard' }"
            @tap="selectPaymentMethod('bankcard')"
          >
            <image class="payment-icon" src="/static/bank-card-pay.png" mode="aspectFit"></image>
            <text class="payment-name">银行卡支付</text>
            <view class="check-icon" v-if="paymentMethod === 'bankcard'">
              <text>✓</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="bottom-action-bar">
      <view class="price-summary">
        <text class="summary-label">合计:</text>
        <text class="summary-price">¥{{ selectedTicket?.price || 0 }}</text>
      </view>
      <button 
        class="submit-btn" 
        :disabled="!selectedTicket || !formData.name || !formData.phone || submitting"
        @tap="handleSubmit"
      >
        <text v-if="!submitting">{{ getPaymentButtonText() }}</text>
        <text v-else>提交中...</text>
      </button>
    </view>
  </view>
</template>

<script>
import { orderApi, paymentApi } from '../../api/order'

export default {
  data() {
    return {
      partyId: null,
      party: null,
      selectedTicket: null,
      paymentMethod: 'wechat',
      walletBalance: 0,
      formData: {
        name: '',
        phone: '',
        gender: 1,
        remark: ''
      },
      submitting: false
    }
  },

  onLoad(options) {
    this.partyId = options.partyId
    this.loadPartyDetail()
    this.loadWalletBalance()
  },

  methods: {
    async loadPartyDetail() {
      try {
        const res = await this.$http.get(`/parties/${this.partyId}`)
        if (res.code === 0) {
          this.party = res.data
        }
      } catch (error) {
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    },

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

    selectTicket(ticket) {
      this.selectedTicket = ticket
    },

    selectPaymentMethod(method) {
      this.paymentMethod = method
    },

    getPaymentButtonText() {
      switch (this.paymentMethod) {
        case 'wechat':
          return '微信支付'
        case 'wallet':
          return '钱包支付'
        case 'bankcard':
          return '银行卡支付'
        default:
          return '立即报名'
      }
    },

    validateForm() {
      if (!this.selectedTicket) {
        uni.showToast({
          title: '请选择票型',
          icon: 'none'
        })
        return false
      }

      if (!this.formData.name || this.formData.name.trim() === '') {
        uni.showToast({
          title: '请输入姓名',
          icon: 'none'
        })
        return false
      }

      if (!this.formData.phone || this.formData.phone.length !== 11) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return false
      }

      if (!this.formData.gender) {
        uni.showToast({
          title: '请选择性别',
          icon: 'none'
        })
        return false
      }

      return true
    },

    async handleSubmit() {
      if (!this.validateForm()) return

      this.submitting = true

      try {
        const orderData = {
          party_id: this.partyId,
          ticket_id: this.selectedTicket.id,
          name: this.formData.name,
          phone: this.formData.phone,
          gender: this.formData.gender,
          remark: this.formData.remark
        }

        const res = await orderApi.createOrder(orderData)

        if (res.code === 0) {
          const orderId = res.data.id

          if (this.paymentMethod === 'wechat') {
            await this.handleWeChatPay(orderId)
          } else if (this.paymentMethod === 'wallet') {
            await this.handleWalletPay(orderId)
          } else {
            uni.showToast({
              title: '请选择支付方式',
              icon: 'none'
            })
          }
        } else {
          uni.showToast({
            title: res.message || '创建订单失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      } finally {
        this.submitting = false
      }
    },

    async handleWeChatPay(orderId) {
      try {
        const res = await paymentApi.createPayment(orderId, { payment_method: 'wechat' })

        if (res.code === 0) {
          const paymentData = res.data

          uni.requestPayment({
            provider: 'wxpay',
            timeStamp: paymentData.timeStamp,
            nonceStr: paymentData.nonceStr,
            package: paymentData.package,
            signType: paymentData.signType,
            paySign: paymentData.paySign,
            success: (result) => {
              this.handlePaymentSuccess(orderId)
            },
            fail: (error) => {
              this.handlePaymentFail(error)
            }
          })
        } else {
          uni.showToast({
            title: res.message || '获取支付参数失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.showToast({
          title: '支付失败',
          icon: 'none'
        })
      }
    },

    async handleWalletPay(orderId) {
      try {
        const res = await paymentApi.createPayment(orderId, { payment_method: 'wallet' })

        if (res.code === 0) {
          this.handlePaymentSuccess(orderId)
        } else {
          uni.showToast({
            title: res.message || '钱包支付失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.showToast({
          title: '支付失败',
          icon: 'none'
        })
      }
    },

    handlePaymentSuccess(orderId) {
      uni.showToast({
        title: '报名成功',
        icon: 'success'
      })

      setTimeout(() => {
        uni.redirectTo({
          url: `/pages/my-orders/my-orders`
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

    isEarlyBird(ticket) {
      return ticket.type === 2 || ticket.type === 5 || ticket.type === 6
    },

    getDiscount(ticket) {
      if (!ticket.original_price || ticket.original_price <= ticket.price) return null
      return Math.round((ticket.price / ticket.original_price) * 10) / 10
    },

    formatDateTime(time) {
      if (!time) return ''
      const date = new Date(time)
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${month}月${day}日 ${hours}:${minutes}`
    },

    formatTime(time) {
      if (!time) return ''
      const date = new Date(time)
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${month}-${day} ${hours}:${minutes}`
    }
  }
}
</script>

<style lang="scss" scoped>
.ticket-selection-container {
  min-height: 100vh;
  background: #000000;
  padding-bottom: 150rpx;
}

.party-summary {
  padding: 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.party-thumb {
  width: 100%;
  height: 300rpx;
  border-radius: 20rpx;
}

.party-info {
  padding: 30rpx;
}

.party-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 20rpx;
}

.party-time {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 15rpx;
}

.party-location {
  display: flex;
  align-items: center;
}

.location-icon {
  font-size: 28rpx;
  margin-right: 10rpx;
}

.location-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.content-scroll {
  height: calc(100vh - 150rpx - 500rpx);
}

.section {
  margin: 20rpx;
  background: #1a1a1a;
  border-radius: 20rpx;
  padding: 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.section-subtitle {
  font-size: 24rpx;
  color: #FF6B35;
}

.ticket-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.ticket-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20rpx;
  padding: 30rpx;
  border: 3rpx solid transparent;
  transition: all 0.3s;

  &.selected {
    border-color: #FF6B35;
    background: rgba(255, 107, 53, 0.15);
  }

  &.early-bird {
    border-color: #FFD700;
  }

  &:active {
    transform: scale(0.98);
  }
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.ticket-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
}

.ticket-badges {
  display: flex;
  gap: 10rpx;
}

.badge {
  padding: 6rpx 15rpx;
  border-radius: 15rpx;
  font-size: 20rpx;
  color: #ffffff;
}

.ticket-price {
  display: flex;
  align-items: baseline;
  margin-bottom: 20rpx;
}

.current-price {
  font-size: 48rpx;
  font-weight: bold;
  color: #FF6B35;
}

.original-price {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: line-through;
  margin-left: 15rpx;
}

.discount {
  padding: 6rpx 15rpx;
  background: #FFD700;
  color: #000000;
  border-radius: 15rpx;
  font-size: 20rpx;
  font-weight: bold;
  margin-left: 15rpx;
}

.ticket-info {
  margin-bottom: 15rpx;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.info-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-right: 15rpx;
}

.info-value {
  font-size: 24rpx;
  color: #ffffff;
  font-weight: bold;
}

.ticket-description {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
}

.form-section {
  margin-top: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 15rpx;
  display: block;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15rpx;
  padding: 0 30rpx;
  color: #ffffff;
  font-size: 28rpx;
  border: 2rpx solid transparent;

  &:focus {
    border-color: #FF6B35;
    background: rgba(255, 255, 255, 0.15);
  }
}

.form-textarea {
  width: 100%;
  min-height: 150rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15rpx;
  padding: 20rpx;
  color: #ffffff;
  font-size: 28rpx;
  border: 2rpx solid transparent;

  &:focus {
    border-color: #FF6B35;
    background: rgba(255, 255, 255, 0.15);
  }
}

.gender-options {
  display: flex;
  gap: 20rpx;
}

.gender-option {
  flex: 1;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15rpx;
  border: 2rpx solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 28rpx;
  transition: all 0.3s;

  &.selected {
    border-color: #FF6B35;
    background: rgba(255, 107, 53, 0.15);
    color: #ffffff;
  }

  &:active {
    transform: scale(0.95);
  }
}

.payment-methods {
  display: flex;
  gap: 20rpx;
}

.payment-method {
  flex: 1;
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
  margin-bottom: 15rpx;
}

.payment-name {
  font-size: 28rpx;
  color: #ffffff;
  margin-bottom: 10rpx;
}

.wallet-balance {
  font-size: 24rpx;
  color: #FFD700;
  margin-top: 10rpx;
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

.submit-btn {
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
