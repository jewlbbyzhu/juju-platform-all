<template>
  <view class="create-group-container">
    <view class="header">
      <view class="back-btn" @click="handleBack">
        <text class="icon">←</text>
      </view>
      <view class="title">创建群聊</view>
      <view class="create-btn" @click="handleCreate">
        <text>创建</text>
      </view>
    </view>

    <view class="form-section">
      <view class="form-item">
        <view class="form-label">群名称</view>
        <input 
          v-model="formData.name" 
          class="form-input"
          placeholder="请输入群名称"
          placeholder-class="placeholder"
          maxlength="50"
        />
      </view>

      <view class="form-item">
        <view class="form-label">群头像</view>
        <view class="avatar-upload" @click="handleChooseAvatar">
          <image v-if="formData.avatar" :src="formData.avatar" mode="aspectFill" />
          <view v-else class="avatar-placeholder">
            <text class="icon">📷</text>
            <text>上传头像</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <view class="form-label">群描述</view>
        <textarea 
          v-model="formData.description" 
          class="form-textarea"
          placeholder="请输入群描述"
          placeholder-class="placeholder"
          maxlength="200"
        />
        <view class="char-count">{{ formData.description.length }}/200</view>
      </view>

      <view class="form-item">
        <view class="form-label">群类型</view>
        <view class="type-options">
          <view 
            v-for="item in typeOptions" 
            :key="item.value"
            class="type-option"
            :class="{ active: formData.type === item.value }"
            @click="handleTypeChange(item.value)"
          >
            <text class="option-icon">{{ item.icon }}</text>
            <text class="option-label">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <view class="form-label">群成员</view>
        <view class="member-list">
          <view class="member-item add" @click="handleAddMember">
            <text class="icon">+</text>
          </view>
          <view 
            v-for="member in selectedMembers" 
            :key="member.id"
            class="member-item"
          >
            <image :src="member.avatar" mode="aspectFill" />
            <view class="remove-btn" @click="handleRemoveMember(member.id)">
              <text class="icon">×</text>
            </view>
          </view>
        </view>
        <view class="member-count">已选择 {{ selectedMembers.length }} 人</view>
      </view>

      <view class="form-item">
        <view class="form-label">群设置</view>
        <view class="setting-list">
          <view class="setting-item" @click="handleToggleSetting('allowInvite')">
            <view class="setting-info">
              <text class="setting-label">允许成员邀请</text>
              <text class="setting-desc">成员可以邀请新成员加入群聊</text>
            </view>
            <view class="setting-switch" :class="{ active: formData.allowInvite }">
              <view class="switch-dot"></view>
            </view>
          </view>

          <view class="setting-item" @click="handleToggleSetting('needApproval')">
            <view class="setting-info">
              <text class="setting-label">入群需审核</text>
              <text class="setting-desc">新成员加入需要管理员审核</text>
            </view>
            <view class="setting-switch" :class="{ active: formData.needApproval }">
              <view class="switch-dot"></view>
            </view>
          </view>

          <view class="setting-item" @click="handleToggleSetting('allowMemberSpeak')">
            <view class="setting-info">
              <text class="setting-label">允许成员发言</text>
              <text class="setting-desc">所有成员都可以发送消息</text>
            </view>
            <view class="setting-switch" :class="{ active: formData.allowMemberSpeak }">
              <view class="switch-dot"></view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="tips-section">
      <view class="tips-title">创建提示</view>
      <view class="tips-list">
        <view class="tip-item">• 群名称长度为2-50个字符</view>
        <view class="tip-item">• 群描述长度为0-200个字符</view>
        <view class="tip-item">• 群成员数量为2-500人</view>
        <view class="tip-item">• 创建后可随时修改群设置</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { groupChatApi } from '@/api/group-chat.js'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const typeOptions = [
  { label: '普通群', value: 'normal', icon: '💬' },
  { label: '活动群', value: 'activity', icon: '🎉' },
  { label: '兴趣群', value: 'interest', icon: '⭐' },
  { label: '工作群', value: 'work', icon: '💼' }
]

const formData = ref({
  name: '',
  avatar: '',
  description: '',
  type: 'normal',
  allowInvite: true,
  needApproval: false,
  allowMemberSpeak: true
})

const selectedMembers = ref([])

const handleBack = () => {
  uni.navigateBack()
}

const handleCreate = () => {
  if (!formData.value.name.trim()) {
    uni.showToast({
      title: '请输入群名称',
      icon: 'none'
    })
    return
  }

  if (formData.value.name.length < 2 || formData.value.name.length > 50) {
    uni.showToast({
      title: '群名称长度为2-50个字符',
      icon: 'none'
    })
    return
  }

  if (selectedMembers.value.length < 1) {
    uni.showToast({
      title: '请至少选择1个成员',
      icon: 'none'
    })
    return
  }

  uni.showLoading({ title: '创建中...' })

  const memberIds = selectedMembers.value.map(m => m.id)
  memberIds.push(userStore.userInfo.id)

  groupChatApi.createGroup({
    ...formData.value,
    memberIds
  }).then(response => {
    uni.hideLoading()
    uni.showToast({
      title: '创建成功',
      icon: 'success'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }).catch(error => {
    uni.hideLoading()
    uni.showToast({
      title: '创建失败',
      icon: 'none'
    })
  })
}

const handleChooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      formData.value.avatar = res.tempFilePaths[0]
    }
  })
}

const handleTypeChange = (value) => {
  formData.value.type = value
}

const handleAddMember = () => {
  uni.navigateTo({
    url: '/pages/select-members/select-members?selected=' + JSON.stringify(selectedMembers.value.map(m => m.id))
  })
}

const handleRemoveMember = (memberId) => {
  selectedMembers.value = selectedMembers.value.filter(m => m.id !== memberId)
}

const handleToggleSetting = (key) => {
  formData.value[key] = !formData.value[key]
}
</script>

<style lang="scss" scoped>
.create-group-container {
  min-height: 100vh;
  background: #000000;
  padding-bottom: 40rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.back-btn,
.create-btn {
  padding: 16rpx 24rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #ffffff;
}

.icon {
  font-size: 28rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.form-section {
  padding: 30rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

.form-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 20rpx;
}

.form-input {
  width: 100%;
  padding: 24rpx;
  background: #1a1a1a;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #ffffff;
}

.placeholder {
  color: #999;
}

.avatar-upload {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.avatar-upload image {
  width: 100%;
  height: 100%;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  gap: 12rpx;
}

.avatar-placeholder .icon {
  font-size: 48rpx;
  color: #999;
}

.avatar-placeholder text:last-child {
  font-size: 22rpx;
  color: #999;
}

.form-textarea {
  width: 100%;
  min-height: 160rpx;
  padding: 24rpx;
  background: #1a1a1a;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #ffffff;
}

.char-count {
  text-align: right;
  font-size: 22rpx;
  color: #999;
  margin-top: 12rpx;
}

.type-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.type-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 30rpx;
  background: #1a1a1a;
  border-radius: 16rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
}

.type-option.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.option-icon {
  font-size: 48rpx;
}

.option-label {
  font-size: 26rpx;
  color: #ffffff;
}

.member-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.member-item {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.member-item.add {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  border: 2rpx dashed #667eea;
}

.member-item.add .icon {
  font-size: 48rpx;
  color: #667eea;
}

.member-item image {
  width: 100%;
  height: 100%;
}

.remove-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 61, 0, 0.9);
  border-radius: 0 0 0 12rpx;
}

.remove-btn .icon {
  font-size: 24rpx;
  color: #ffffff;
}

.member-count {
  font-size: 24rpx;
  color: #999;
}

.setting-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background: #1a1a1a;
  border-radius: 12rpx;
}

.setting-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.setting-label {
  font-size: 28rpx;
  color: #ffffff;
}

.setting-desc {
  font-size: 22rpx;
  color: #999;
}

.setting-switch {
  width: 80rpx;
  height: 44rpx;
  background: #2a2a2a;
  border-radius: 22rpx;
  position: relative;
  transition: all 0.3s;
}

.setting-switch.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.switch-dot {
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  width: 36rpx;
  height: 36rpx;
  background: #ffffff;
  border-radius: 50%;
  transition: all 0.3s;
}

.setting-switch.active .switch-dot {
  left: 40rpx;
}

.tips-section {
  margin: 30rpx;
  padding: 30rpx;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 16rpx;
  border: 1rpx solid rgba(102, 126, 234, 0.3);
}

.tips-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 20rpx;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.tip-item {
  font-size: 24rpx;
  color: #999;
  line-height: 1.6;
}
</style>
