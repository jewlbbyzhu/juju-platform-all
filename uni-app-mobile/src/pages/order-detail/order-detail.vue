<template>
  <view class="order-detail-container">
    <!-- 订单状态 -->
    <view class="status-section">
      <view class="status-icon">
        <text v-if="order.status === 'pending'">⏳</text>
        <text v-else-if="order.status === 'paid'">✅</text>
        <text v-else-if="order.status === 'cancelled'">❌</text>
        <text v-else-if="order.status === 'refunded'">↩️</text>
      </view>
      <text class="status-text">{{ getStatusText(order.status) }}</text>
      <text class="status-desc">{{ getStatusDesc(order.status) }}</text>
    </view>

    <!-- 聚会信息 -->
    <view class="party-section">
      <image class="party-image" :src="order.party_cover || '/static/default-party.png'" mode="aspectFill" />
      <view class="party-info">
        <text class="party-title">{{ order.party_title }}</text>
        <text class="party-time">{{ formatTime(order.party_time) }}</text>
        <text class="party-location">📍 {{ order.party_location }}</text>
      </view>
    </view>

    <!-- 票型信息 -->
    <view class="ticket-section">
      <view class="section-title">票型信息</view>
      <view class="ticket-item">
        <text class="ticket-name">{{ order.ticket_type }}</text>
        <text class="ticket-quantity">x{{ order.quantity }}</text>
        <text class="ticket-price">¥{{ order.unit_price }}</text>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="order-info-section">
      <view class="section-title">订单信息</view>
      <view class="info-item">
        <text class="info-label">订单编号</text>
        <text class="info-value">{{ order.order_no }}</text>
        <text class="copy-btn" @tap="copyOrderNo">复制</text>
      </view>
      <view class="info-item">
        <text class="info-label">创建时间</text>
        <text class="info-value">{{ formatTime(order.created_at) }}</text>
      </view>
      <view class="info-item" v-if="order.paid_at">
        <text class="info-label">支付时间</text>
        <text class="info-value">{{ formatTime(order.paid_at) }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">支付方式</text>
        <text class="info-value">{{ order.payment_method || '未支付' }}</text>
      </view>
    </view>

    <!-- 价格明细 -->
    <view class="price-section">
      <view class="price-item">
        <text class="price-label">票款总额</text>
        <text class="price-value">¥{{ order.total_amount }}</text>
      </view>
      <view class="price-item" v-if="order.discount_amount">
        <text class="price-label">优惠金额</text>
        <text class="price-value discount">-¥{{ order.discount_amount }}</text>
      </view>
      <view class="price-item total">
        <text class="price-label">实付金额</text>
        <text class="price-value total">¥{{ order.actual_amount || order.total_amount }}</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar" v-if="showActions">
      <button 
        v-if="order.status === 'pending'" 
        class="btn-primary" 
        @tap="payOrder"
        :loading="paying"
      >
        立即支付
      </button>
      <button 
        v-if="order.status === 'pending'" 
        class="btn-default" 
        @tap="cancelOrder"
        :loading="cancelling"
      >
        取消订单
      </button>
      <button 
        v-if="order.status === 'paid' && canRefund" 
        class="btn-default" 
        @tap="applyRefund"
      >
        申请退款
      </button>
      <button 
        v-if="order.status === 'paid' && canReview" 
        class="btn-primary" 
        @tap="goToReview"
      >
        去评价
      </button>
      <button class="btn-default" @tap="contactOrganizer">
        联系主办方
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 订单数据
const order = ref({
  id: 0,
  order_no: '',
  status: 'pending' as 'pending' | 'paid' | 'cancelled' | 'refunded',
  party_id: 0,
  party_title: '',
  party_cover: '',
  party_time: '',
  party_location: '',
  ticket_type: '',
  quantity: 1,
  unit_price: 0,
  total_amount: 0,
  discount_amount: 0,
  actual_amount: 0,
  payment_method: '',
  created_at: '',
  paid_at: '',
  can_refund: true,
  can_review: false
})

const loading = ref(false)
const paying = ref(false)
const cancelling = ref(false)

// 是否显示操作按钮
const showActions = computed(() => {
  return ['pending', 'paid'].includes(order.value.status)
})

// 是否可以退款
const canRefund = computed(() => {
  return order.value.can_refund && order.value.status === 'paid'
})

// 是否可以评价
const canReview = computed(() => {
  return order.value.can_review && order.value.status === 'paid'
})

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    cancelled: '已取消',
    refunded: '已退款'
  }
  return statusMap[status] || status
}

// 获取状态描述
const getStatusDesc = (status: string) => {
  const descMap: Record<string, string> = {
    pending: '请在30分钟内完成支付，超时订单将自动取消',
    paid: '支付成功，请准时参加聚会',
    cancelled: '订单已取消',
    refunded: '退款已原路返回，请注意查收'
  }
  return descMap[status] || ''
}

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 复制订单号
const copyOrderNo = () => {
  uni.setClipboardData({
    data: order.value.order_no,
    success: () => {
      uni.showToast({ title: '已复制', icon: 'success' })
    }
  })
}

// 支付订单
const payOrder = async () => {
  paying.value = true
  try {
    // 调用支付API
    uni.navigateTo({
      url: `/pages/payment/payment?orderId=${order.value.id}&amount=${order.value.actual_amount || order.value.total_amount}`
    })
  } finally {
    paying.value = false
  }
}

// 取消订单
const cancelOrder = () => {
  uni.showModal({
    title: '确认取消',
    content: '取消后无法恢复，是否确认取消订单？',
    success: async (res) => {
      if (res.confirm) {
        cancelling.value = true
        try {
          // 调用取消API
          uni.showToast({ title: '取消成功', icon: 'success' })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } finally {
          cancelling.value = false
        }
      }
    }
  })
}

// 申请退款
const applyRefund = () => {
  uni.navigateTo({
    url: `/pages/refund-apply/refund-apply?orderId=${order.value.id}`
  })
}

// 去评价
const goToReview = () => {
  uni.navigateTo({
    url: `/pages/review/review?orderId=${order.value.id}&partyId=${order.value.party_id}`
  })
}

// 联系主办方
const contactOrganizer = () => {
  uni.showActionSheet({
    itemList: ['在线客服', '拨打电话'],
    success: (res) => {
      if (res.tapIndex === 0) {
        // 打开客服聊天
        uni.navigateTo({
          url: '/pages/customer-service/customer-service'
        })
      } else {
        // 拨打电话
        uni.makePhoneCall({
          phoneNumber: '400-123-4567'
        })
      }
    }
  })
}

// 获取订单详情
const fetchOrderDetail = async (orderId: string) => {
  loading.value = true
  try {
    // 模拟数据，实际应调用API
    order.value = {
      id: parseInt(orderId),
      order_no: 'ORD' + Date.now(),
      status: 'pending',
      party_id: 1,
      party_title: '周末户外烧烤聚会',
      party_cover: '/static/party-cover.jpg',
      party_time: '2024-12-25 14:00:00',
      party_location: '北京市朝阳区公园',
      ticket_type: '普通票',
      quantity: 2,
      unit_price: 128,
      total_amount: 256,
      discount_amount: 20,
      actual_amount: 236,
      payment_method: '',
      created_at: new Date().toISOString(),
      paid_at: '',
      can_refund: true,
      can_review: false
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const { id } = currentPage.$page?.options || {}
  
  if (id) {
    fetchOrderDetail(id)
  }
})
</script>

<style lang="scss" scoped>
.order-detail-container {
  min-height: 100vh;
  background-color: #000;
  padding-bottom: 120rpx;
}

.status-section {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F5C 100%);
  padding: 60rpx 40rpx;
  text-align: center;

  .status-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
  }

  .status-text {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 10rpx;
  }

  .status-desc {
    display: block;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.party-section {
  display: flex;
  padding: 30rpx;
  background-color: #1a1a1a;
  margin: 20rpx;
  border-radius: 16rpx;

  .party-image {
    width: 160rpx;
    height: 160rpx;
    border-radius: 12rpx;
    margin-right: 20rpx;
  }

  .party-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .party-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #fff;
      margin-bottom: 10rpx;
    }

    .party-time {
      font-size: 26rpx;
      color: #999;
      margin-bottom: 6rpx;
    }

    .party-location {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 20rpx;
}

.ticket-section,
.order-info-section,
.price-section {
  background-color: #1a1a1a;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
}

.ticket-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #333;

  &:last-child {
    border-bottom: none;
  }

  .ticket-name {
    font-size: 28rpx;
    color: #fff;
    flex: 1;
  }

  .ticket-quantity {
    font-size: 26rpx;
    color: #999;
    margin: 0 20rpx;
  }

  .ticket-price {
    font-size: 28rpx;
    color: #FF6B35;
    font-weight: bold;
  }
}

.info-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;

  .info-label {
    font-size: 26rpx;
    color: #999;
    width: 160rpx;
  }

  .info-value {
    flex: 1;
    font-size: 26rpx;
    color: #fff;
  }

  .copy-btn {
    font-size: 24rpx;
    color: #FF6B35;
    padding: 4rpx 16rpx;
    border: 1rpx solid #FF6B35;
    border-radius: 8rpx;
  }
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;

  &.total {
    border-top: 1rpx solid #333;
    margin-top: 20rpx;
    padding-top: 20rpx;
  }

  .price-label {
    font-size: 26rpx;
    color: #999;
  }

  .price-value {
    font-size: 28rpx;
    color: #fff;

    &.discount {
      color: #4CAF50;
    }

    &.total {
      font-size: 36rpx;
      color: #FF6B35;
      font-weight: bold;
    }
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #1a1a1a;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  gap: 20rpx;
  border-top: 1rpx solid #333;

  button {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    font-size: 28rpx;
    margin: 0;

    &.btn-primary {
      background: linear-gradient(135deg, #FF6B35 0%, #FF8F5C 100%);
      color: #fff;
      border: none;
    }

    &.btn-default {
      background-color: transparent;
      color: #fff;
      border: 1rpx solid #666;
    }

    &::after {
      border: none;
    }
  }
}
</style>
