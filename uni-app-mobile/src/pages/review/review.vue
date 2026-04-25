<template>
  <view class="review-container">
    <!-- 聚会信息 -->
    <view class="party-section">
      <image class="party-image" :src="party.cover_image || '/static/default-party.png'" mode="aspectFill" />
      <view class="party-info">
        <text class="party-title">{{ party.title }}</text>
        <text class="party-time">{{ formatTime(party.start_time) }}</text>
      </view>
    </view>

    <!-- 评分 -->
    <view class="rating-section">
      <text class="section-title">总体评价</text>
      <view class="star-rating">
        <text
          v-for="index in 5"
          :key="index"
          class="star"
          :class="{ active: index <= rating }"
          @tap="setRating(index)"
        >
          ★
        </text>
      </view>
      <text class="rating-text">{{ ratingText }}</text>
    </view>

    <!-- 评价标签 -->
    <view class="tags-section">
      <text class="section-title">选择标签</text>
      <view class="tags-list">
        <view
          v-for="tag in reviewTags"
          :key="tag"
          class="tag-item"
          :class="{ active: selectedTags.includes(tag) }"
          @tap="toggleTag(tag)"
        >
          {{ tag }}
        </view>
      </view>
    </view>

    <!-- 评价内容 -->
    <view class="content-section">
      <text class="section-title">评价内容</text>
      <textarea
        class="review-textarea"
        v-model="content"
        placeholder="分享你的聚会体验，帮助更多人了解这个活动..."
        maxlength="500"
      />
      <text class="word-count">{{ content.length }}/500</text>
    </view>

    <!-- 上传图片 -->
    <view class="images-section">
      <text class="section-title">上传图片（可选）</text>
      <view class="images-list">
        <view
          v-for="(image, index) in images"
          :key="index"
          class="image-item"
        >
          <image :src="image" mode="aspectFill" />
          <view class="delete-btn" @tap="removeImage(index)">×</view>
        </view>
        <view class="upload-btn" @tap="chooseImage" v-if="images.length < 9">
          <text class="upload-icon">+</text>
          <text class="upload-text">{{ images.length }}/9</text>
        </view>
      </view>
    </view>

    <!-- 匿名评价 -->
    <view class="anonymous-section">
      <view class="anonymous-option" @tap="toggleAnonymous">
        <view class="checkbox" :class="{ checked: isAnonymous }">
          <text v-if="isAnonymous">✓</text>
        </view>
        <text class="anonymous-text">匿名评价</text>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <button
        class="submit-btn"
        :class="{ disabled: !canSubmit }"
        :loading="submitting"
        @tap="submitReview"
      >
        提交评价
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 页面参数
const orderId = ref('')
const partyId = ref('')

// 聚会信息
const party = ref({
  id: 0,
  title: '',
  cover_image: '',
  start_time: ''
})

// 评价数据
const rating = ref(5)
const content = ref('')
const selectedTags = ref<string[]>([])
const images = ref<string[]>([])
const isAnonymous = ref(false)
const submitting = ref(false)

// 评价标签
const reviewTags = [
  '氛围很棒',
  '组织有序',
  '认识新朋友',
  '物超所值',
  '场地不错',
  '活动有趣',
  '服务周到',
  '推荐参加'
]

// 评分文本
const ratingText = computed(() => {
  const texts = ['非常差', '差', '一般', '好', '非常好']
  return texts[rating.value - 1] || ''
})

// 是否可以提交
const canSubmit = computed(() => {
  return rating.value > 0 && content.value.trim().length >= 10
})

// 设置评分
const setRating = (value: number) => {
  rating.value = value
}

// 切换标签
const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 9 - images.value.length,
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

// 切换匿名
const toggleAnonymous = () => {
  isAnonymous.value = !isAnonymous.value
}

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 提交评价
const submitReview = async () => {
  if (!canSubmit.value) {
    if (rating.value === 0) {
      uni.showToast({ title: '请选择评分', icon: 'none' })
    } else if (content.value.trim().length < 10) {
      uni.showToast({ title: '评价内容至少10个字', icon: 'none' })
    }
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

    // 提交评价数据
    const reviewData = {
      order_id: orderId.value,
      party_id: partyId.value,
      rating: rating.value,
      content: content.value,
      tags: selectedTags.value,
      images: uploadedImages,
      is_anonymous: isAnonymous.value
    }

    // console.log('提交评价:', reviewData)

    // 模拟提交成功
    uni.showToast({
      title: '评价成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    uni.showToast({
      title: '提交失败，请重试',
      icon: 'none'
    })
  } finally {
    submitting.value = false
  }
}

// 获取聚会信息
const fetchPartyInfo = async (id: string) => {
  // 模拟数据
  party.value = {
    id: parseInt(id),
    title: '周末户外烧烤聚会',
    cover_image: '/static/party-cover.jpg',
    start_time: '2024-12-25 14:00:00'
  }
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.$page?.options || {}

  orderId.value = options.orderId || ''
  partyId.value = options.partyId || ''

  if (partyId.value) {
    fetchPartyInfo(partyId.value)
  }
})
</script>

<style lang="scss" scoped>
.review-container {
  min-height: 100vh;
  background-color: #000;
  padding: 20rpx;
  padding-bottom: 40rpx;
}

.party-section {
  display: flex;
  background-color: #1a1a1a;
  padding: 20rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;

  .party-image {
    width: 120rpx;
    height: 120rpx;
    border-radius: 12rpx;
    margin-right: 20rpx;
  }

  .party-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .party-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #fff;
      margin-bottom: 8rpx;
    }

    .party-time {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 20rpx;
}

.rating-section {
  background-color: #1a1a1a;
  padding: 30rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  text-align: center;

  .star-rating {
    display: flex;
    justify-content: center;
    gap: 20rpx;
    margin-bottom: 16rpx;

    .star {
      font-size: 60rpx;
      color: #333;
      transition: color 0.2s;

      &.active {
        color: #FF6B35;
      }
    }
  }

  .rating-text {
    font-size: 28rpx;
    color: #FF6B35;
  }
}

.tags-section {
  background-color: #1a1a1a;
  padding: 30rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;

    .tag-item {
      padding: 12rpx 24rpx;
      background-color: #2a2a2a;
      border-radius: 30rpx;
      font-size: 26rpx;
      color: #999;
      transition: all 0.2s;

      &.active {
        background-color: #FF6B35;
        color: #fff;
      }
    }
  }
}

.content-section {
  background-color: #1a1a1a;
  padding: 30rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  position: relative;

  .review-textarea {
    width: 100%;
    height: 240rpx;
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

.images-section {
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
      width: 200rpx;
      height: 200rpx;
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
        width: 40rpx;
        height: 40rpx;
        background-color: rgba(0, 0, 0, 0.6);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 28rpx;
      }
    }

    .upload-btn {
      width: 200rpx;
      height: 200rpx;
      background-color: #2a2a2a;
      border-radius: 12rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 2rpx dashed #444;

      .upload-icon {
        font-size: 60rpx;
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

.anonymous-section {
  background-color: #1a1a1a;
  padding: 30rpx;
  border-radius: 16rpx;
  margin-bottom: 20rpx;

  .anonymous-option {
    display: flex;
    align-items: center;

    .checkbox {
      width: 36rpx;
      height: 36rpx;
      border: 2rpx solid #666;
      border-radius: 8rpx;
      margin-right: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 24rpx;

      &.checked {
        background-color: #FF6B35;
        border-color: #FF6B35;
      }
    }

    .anonymous-text {
      font-size: 28rpx;
      color: #fff;
    }
  }
}

.submit-section {
  padding: 20rpx 0;

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
