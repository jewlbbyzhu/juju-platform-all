<template>
  <view class="create-post-container">
    <view class="header">
      <view class="header-btn" @tap="goBack">
        <text>取消</text>
      </view>
      <text class="header-title">发布动态</text>
      <view class="header-btn primary" @tap="publishPost">
        <text>发布</text>
      </view>
    </view>

    <view class="content">
      <textarea 
        class="post-input" 
        v-model="content" 
        placeholder="分享你的精彩时刻..."
        :maxlength="500"
        :show-confirm-bar="false"
      ></textarea>
      <text class="char-count">{{ content.length }}/500</text>

      <view class="image-section">
        <view class="image-list">
          <view 
            class="image-item" 
            v-for="(img, index) in images" 
            :key="index"
          >
            <image class="image-preview" :src="img" mode="aspectFill"></image>
            <view class="image-delete" @tap="removeImage(index)">
              <text class="delete-icon">×</text>
            </view>
          </view>
          <view class="image-item add" @tap="chooseImage" v-if="images.length < 9">
            <text class="add-icon">+</text>
            <text class="add-text">添加图片</text>
          </view>
        </view>
      </view>

      <view class="party-section" v-if="selectedParty">
        <view class="party-card">
          <image class="party-thumb" :src="selectedParty.images?.[0] || '/static/default-party.png'" mode="aspectFill"></image>
          <view class="party-info">
            <text class="party-name">{{ selectedParty.title }}</text>
            <text class="party-time">{{ formatPartyTime(selectedParty.start_time) }}</text>
          </view>
          <view class="party-remove" @tap="removeParty">
            <text class="remove-icon">×</text>
          </view>
        </view>
      </view>

      <view class="options-section">
        <view class="option-item" @tap="selectParty">
          <text class="option-icon">🎉</text>
          <text class="option-text">{{ selectedParty ? '更换聚会' : '关联聚会' }}</text>
          <text class="option-arrow">›</text>
        </view>

        <view class="option-item" @tap="toggleLocation">
          <text class="option-icon">📍</text>
          <text class="option-text">{{ location ? location.name : '添加位置' }}</text>
          <text class="option-arrow">›</text>
        </view>

        <view class="option-item" @tap="toggleVisibility">
          <text class="option-icon">👁️</text>
          <text class="option-text">{{ visibility === 'public' ? '公开' : '仅好友可见' }}</text>
          <text class="option-arrow">›</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { socialApi } from '@/api/social'
import { partyApi } from '@/api/party'

export default {
  data() {
    return {
      content: '',
      images: [],
      selectedParty: null,
      location: null,
      visibility: 'public'
    }
  },

  onLoad(options) {
    if (options.partyId) {
      this.loadParty(options.partyId)
    }
  },

  methods: {
    goBack() {
      if (this.content || this.images.length > 0) {
        uni.showModal({
          title: '提示',
          content: '确定要放弃编辑吗?',
          success: (res) => {
            if (res.confirm) {
              uni.navigateBack()
            }
          }
        })
      } else {
        uni.navigateBack()
      }
    },

    async loadParty(partyId) {
      try {
        const res = await partyApi.getPartyDetail(partyId)
        if (res.code === 0) {
          this.selectedParty = res.data
        }
      } catch (error) {
        uni.showToast({
          title: '加载聚会信息失败',
          icon: 'none'
        })
      }
    },

    chooseImage() {
      const maxCount = 9 - this.images.length
      uni.chooseImage({
        count: maxCount,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.images = [...this.images, ...res.tempFilePaths]
        }
      })
    },

    removeImage(index) {
      this.images.splice(index, 1)
    },

    selectParty() {
      uni.navigateTo({
        url: '/pages/select-party/select-party',
        success: (res) => {
          uni.$once('partySelected', (party) => {
            this.selectedParty = party
          })
        }
      })
    },

    removeParty() {
      this.selectedParty = null
    },

    toggleLocation() {
      uni.chooseLocation({
        success: (res) => {
          this.location = {
            name: res.name,
            address: res.address,
            latitude: res.latitude,
            longitude: res.longitude
          }
        }
      })
    },

    toggleVisibility() {
      uni.showActionSheet({
        itemList: ['公开', '仅好友可见'],
        success: (res) => {
          this.visibility = res.tapIndex === 0 ? 'public' : 'friends'
        }
      })
    },

    async publishPost() {
      if (!this.content && this.images.length === 0) {
        uni.showToast({
          title: '请输入内容或添加图片',
          icon: 'none'
        })
        return
      }

      uni.showLoading({
        title: '发布中...'
      })

      try {
        const data = {
          content: this.content,
          images: this.images,
          party_id: this.selectedParty?.id,
          location: this.location,
          visibility: this.visibility
        }

        const res = await socialApi.createPost(data)

        if (res.code === 0) {
          uni.hideLoading()
          uni.showToast({
            title: '发布成功',
            icon: 'success'
          })

          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.hideLoading()
          uni.showToast({
            title: res.message || '发布失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '发布失败',
          icon: 'none'
        })
      }
    },

    formatPartyTime(time) {
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
@import '../../styles/variables';

.create-post-container {
  min-height: 100vh;
  background: $bg-secondary;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background: $bg-primary;
  border-bottom: 1rpx solid $border-light;
}

.header-btn {
  padding: 10rpx 20rpx;
  font-size: 28rpx;
  color: $text-secondary;

  &.primary {
    color: $primary;
    font-weight: bold;
  }
}

.header-title {
  font-size: 32rpx;
  font-weight: bold;
  color: $text-primary;
}

.content {
  padding: 30rpx;
}

.post-input {
  width: 100%;
  min-height: 300rpx;
  font-size: 32rpx;
  line-height: 1.6;
  color: $text-primary;
  background: transparent;
  border: none;
  padding: 0;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: $text-secondary;
  margin-bottom: 30rpx;
}

.image-section {
  margin-bottom: 30rpx;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.image-item {
  position: relative;
  width: calc((100% - 30rpx) / 3);
  height: 200rpx;
  border-radius: $radius-md;
  overflow: hidden;

  &.add {
    background: $bg-primary;
    border: 2rpx dashed $border-light;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}

.image-preview {
  width: 100%;
  height: 100%;
}

.image-delete {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 40rpx;
  height: 40rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-icon {
  color: #ffffff;
  font-size: 32rpx;
  line-height: 1;
}

.add-icon {
  font-size: 60rpx;
  color: $text-secondary;
  line-height: 1;
  margin-bottom: 10rpx;
}

.add-text {
  font-size: 24rpx;
  color: $text-secondary;
}

.party-section {
  margin-bottom: 30rpx;
}

.party-card {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: $bg-primary;
  border-radius: $radius-md;
}

.party-thumb {
  width: 100rpx;
  height: 100rpx;
  border-radius: $radius-sm;
  margin-right: 20rpx;
}

.party-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.party-name {
  font-size: 28rpx;
  font-weight: bold;
  color: $text-primary;
  margin-bottom: 8rpx;
}

.party-time {
  font-size: 24rpx;
  color: $text-secondary;
}

.party-remove {
  width: 40rpx;
  height: 40rpx;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-icon {
  color: $text-secondary;
  font-size: 32rpx;
  line-height: 1;
}

.options-section {
  background: $bg-primary;
  border-radius: $radius-md;
  overflow: hidden;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid $border-light;

  &:active {
    background: $bg-secondary;
  }

  &:last-child {
    border-bottom: none;
  }
}

.option-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.option-text {
  flex: 1;
  font-size: 28rpx;
  color: $text-primary;
}

.option-arrow {
  font-size: 32rpx;
  color: $text-secondary;
}
</style>
