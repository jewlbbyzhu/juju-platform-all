<template>
  <view class="refund-container">
    <!-- 退款金额 -->
    <view class="amount-section">
      <text class="section-title">退款金额</text>
      <view class="amount-display">
        <text class="currency">¥</text>
        <text class="amount">{{ order.actual_amount || order.total_amount }}</text>
      </view>
      <text class="amount-tip">最高可退金额 ¥{{ order.actual_amount || order.total_amount }}</text>
    </view>

    <!-- 退款原因 -->
    <view class="reason-section">
      <text class="section-title">退款原因</text>
      <view class="reason-list">
        <view
          v-for="reason in refundReasons"
          :key="reason"
          class="reason-item"
          :class="{ active: selectedReason === reason }"
          @tap="selectReason(reason)"
        >
          <text class="reason-text">{{ reason }}</text>
          <view class="radio">
            <view v-if="selectedReason === reason" class="radio-dot" />
          </view>
        </view>
      </view>
    </view>

    <!-- 详细说明 -->
    <view class="detail-section">
      <text class="section-title">详细说明（选填）</text>
      <textarea
        class="detail-textarea"
        v-model="detail"
        placeholder="请详细描述退款原因，有助于快速处理..."
        maxlength="200"
      />
      <text class="word-count">{{ detail.length }}/200</text>
    </view>

    <!-- 上传凭证 -->
    <view class="evidence-section">
      <text class="section-title">上传凭证（选填）</text>
      <view class="images-list">
        <view
          v-for="(image, index) in images"
          :key="index"
          class="image-item"
        >
          <image :src="image" mode="aspectFill" />
          <view class="delete-btn" @tap="removeImage(index)">×</view>
        </view>
        <view class="upload-btn" @tap="chooseImage" v-if="images.length < 6">
          <text class="upload-icon">+</text>
          <text class="upload-text">{{ images.length }}/6</text>
        </view>
      </view>
    </view>

    <!-- 退款说明 -->
    <view class="tips-section">
      <text class="tips-title">退款说明：</text>
      <text class="tips-item">1. 退款申请提交后，我们将在1-3个工作日内处理</text>
      <text class="tips-item">2. 退款将原路返回至您的支付账户</text>
      <text class="tips-item">3. 退款到账时间取决于银行/支付平台，一般为3-7个工作日</text>
      <text class="tips-item">4. 如有疑问请联系客服：400-123-4567</text>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <button
        class="submit-btn"
        :class="{ disabled: !canSubmit }"
        :loading="submitting"
        @tap="submitRefund"
      >
        提交申请
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 页面参数
const orderId = ref('')

// 订单信息
const order = ref({
  id: 0,
  total_amount: 0,
  actual_amount: 0
})

// 退款数据
const selectedReason = ref('')
const detail = ref('')
const images = ref<string[]>([])
const submitting = ref(false)

// 退款原因选项
const refundReasons = [
  '计划有变，无法参加',
  '聚会时间冲突',
  '聚会地点太远',
  '对聚会内容不满意',
  '重复下单',
  '其他原因'
]

// 是否可以提交
const canSubmit = computed(() => {
  return selectedReason.value !== ''
})

// 选择原因
const selectReason = (reason: string) => {
  selectedReason.value = reason
}

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 6 - images.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      images.value.push(...res.tempFilePaths)
    }
  })
}

// 删除图片
const removeImage = (index: number) => {
  images.value.splice(index, 1)
}

// 提交退款申请
const submitRefund = async () => {
  if (!canSubmit.value) {
    uni.showToast({ title: '请选择退款原因', icon: 'none' })
    return
  }

  submitting.value = true

  try {
    // 上传图片
    const uploadedImages: string[] = []
    for (const image of images.value) {
      // 实际应调用上传API
      uploadedImages.push(image)
    }

    // 提交退款数据
    const refundData = {
      order_id: orderId.value,
      reason: selectedReason.value,
      detail: detail.value,
      images: uploadedImages,
      amount: order.value.actual_amount || order.value.total_amount
    }

    // console.log('提交退款:', refundData)

    // 模拟提交成功
    uni.showModal({
      title: '申请已提交',
      content: '退款申请已提交，我们将在1-3个工作日内处理',
      showCancel: false,
      success: () => {
        uni.navigateBack()
      }
    })
  } catch (error) {
    uni.showToast({
      title: '提交失败，请重试',
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
}

// 获取订单信息
const fetchOrderInfo = async (id: string) => {
  // 模拟数据
  order.value = {
    id: parseInt(id),
    total_amount: 256,
    actual_amount: 236
  }
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.$page?.options || {}

  orderId.value = options.orderId || ''

  if (orderId.value) {
    fetchOrderInfo(orderId.value)
  }
})
</script>

<style lang="scss" scoped>
.refund-container {
  min-height: 100vh;
  background-color: #000;
  padding: 20rpx;
  padding-bottom: 140rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 20rpx;
}

.amount-section {
  background-color: #1a1a1a;
  padding: 40rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  text-align: center;

  .amount-display {
    margin: 20rpx 0;

    .currency {
      font-size: 40rpx;
      color: #FF6B35;
      margin-right: 8rpx;
    }

    .amount {
      font-size: 72rpx;
      font-weight: bold;
      color: #FF6B35;
    }
  }

  .amount-tip {
    font-size: 24rpx;
    color: #999;
  }
}

.reason-section {
  background-color: #1a1a1a;
  padding: 30rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;

  .reason-list {
    .reason-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #333;

      &:last-child {
        border-bottom: none;
      }

      &.active {
        .reason-text {
          color: #FF6B35;
        }
      }

      .reason-text {
        font-size: 28rpx;
        color: #fff;
      }

      .radio {
        width: 36rpx;
        height: 36rpx;
        border: 2rpx solid #666;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        .radio-dot {
          width: 20rpx;
          height: 20rpx;
          background-color: #FF6B35;
          border-radius: 50%;
        }
      }
    }
  }
}

.detail-section {
  background-color: #1a1a1a;
  padding: 30rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  position: relative;

  .detail-textarea {
    width: 100%;
    height: 200rpx;
    background-color: #2a2a2a;
    border-radius: 12rpx;
    padding: 20rpx;
    font-size: 28rpx;
    color: #fff;
    box-sizing: border-box;

    &::placeholder {
      color: #666;
    }
  }

  .word-count {
    position: absolute;
    bottom: 40rpx;
    right: 40rpx;
    font-size: 24rpx;
    color: #666;
  }
}

.evidence-section {
  background-color: #1a1a1a;
  padding: 30rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;

  .images-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;

    .image-item {
      position: relative;
      width: 180rpx;
      height: 180rpx;
      border-radius: 12rpx;
      overflow: hidden;

      image {
        width: 100%;
        height: 100%;
      }

      .delete-btn {
        position: absolute;
        top: 8rpx;
        right: 8rpx;
        width: 36rpx;
        height: 36rpx;
        background-color: rgba(0, 0, 0, 0.6);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 24rpx;
      }
    }

    .upload-btn {
      width: 180rpx;
      height: 180rpx;
      background-color: #2a2a2a;
      border-radius: 12rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 2rpx dashed #444;

      .upload-icon {
        font-size: 48rpx;
        color: #666;
        margin-bottom: 8rpx;
      }

      .upload-text {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

.tips-section {
  background-color: #1a1a1a;
  padding: 30rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;

  .tips-title {
    display: block;
    font-size: 28rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 16rpx;
  }

  .tips-item {
    display: block;
    font-size: 24rpx;
    color: #999;
    line-height: 1.8;
  }
}

.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #1a1a1a;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #333;

  .submit-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: linear-gradient(135deg, #FF6B35 0%, #FF8F5C 100%);
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    border-radius: 44rpx;
    border: none;

    &.disabled {
      background: #333;
      color: #666;
    }

    &::after {
      border: none;
    }
  }
}
</style>
