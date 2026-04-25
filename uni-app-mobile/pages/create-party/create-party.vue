<template>
  <view class="create-party-container">
    <scroll-view scroll-y class="content-scroll">
      <view class="section">
        <view class="section-header">
          <text class="section-title">基本信息</text>
        </view>

        <view class="form-section">
          <view class="form-item">
            <text class="form-label required">聚会标题 *</text>
            <input 
              class="form-input" 
              v-model="formData.title" 
              placeholder="请输入聚会标题"
              maxlength="50"
            />
          </view>

          <view class="form-item">
            <text class="form-label required">聚会分类 *</text>
            <picker mode="selector" :range="categories" range-key="value" @change="onCategoryChange">
              <view class="picker-input">
                <text class="picker-text">{{ selectedCategoryText }}</text>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>

          <view class="form-item">
            <text class="form-label required">聚会主题 *</text>
            <picker mode="selector" :range="themes" range-key="value" @change="onThemeChange">
              <view class="picker-input">
                <text class="picker-text">{{ selectedThemeText }}</text>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>

          <view class="form-item">
            <text class="form-label required">聚会描述 *</text>
            <textarea 
              class="form-textarea" 
              v-model="formData.description" 
              placeholder="请详细描述聚会内容"
              maxlength="500"
            />
            <text class="char-count">{{ formData.description.length }}/500</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">时间地点</text>
        </view>

        <view class="form-section">
          <view class="form-item">
            <text class="form-label required">开始时间 *</text>
            <picker mode="multiSelector" :range="dateRange" @change="onStartTimeChange">
              <view class="picker-input">
                <text class="picker-text">{{ formData.start_time || '请选择' }}</text>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>

          <view class="form-item">
            <text class="form-label required">结束时间 *</text>
            <picker mode="multiSelector" :range="dateRange" @change="onEndTimeChange">
              <view class="picker-input">
                <text class="picker-text">{{ formData.end_time || '请选择' }}</text>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>

          <view class="form-item">
            <text class="form-label required">所在城市 *</text>
            <picker mode="region" @change="onCityChange">
              <view class="picker-input">
                <text class="picker-text">{{ formData.city || '请选择' }}</text>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>

          <view class="form-item">
            <text class="form-label required">详细地址 *</text>
            <input 
              class="form-input" 
              v-model="formData.address" 
              placeholder="请输入详细地址"
              maxlength="200"
            />
          </view>

          <view class="form-item">
            <text class="form-label">地图定位</text>
            <button class="location-btn" @tap="chooseLocation">
              <text class="location-icon">📍</text>
              <text class="location-text">{{ formData.latitude && formData.longitude ? '已定位' : '点击定位' }}</text>
            </button>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">参与限制</text>
        </view>

        <view class="form-section">
          <view class="form-item">
            <text class="form-label required">最大人数 *</text>
            <input 
              class="form-input" 
              v-model="formData.max_participants" 
              type="number"
              placeholder="请输入最大参与人数"
            />
          </view>

          <view class="form-item">
            <text class="form-label">性别限制</text>
            <picker mode="selector" :range="genderOptions" @change="onGenderLimitChange">
              <view class="picker-input">
                <text class="picker-text">{{ selectedGenderLimitText }}</text>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>

          <view class="form-item">
            <text class="form-label">年龄限制</text>
            <view class="age-inputs">
              <input 
                class="age-input" 
                v-model="formData.min_age" 
                type="number"
                placeholder="最小"
              />
              <text class="age-separator">-</text>
              <input 
                class="age-input" 
                v-model="formData.max_age" 
                type="number"
                placeholder="最大"
              />
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">票型设置</text>
        </view>

        <view class="form-section">
          <view class="ticket-type-list">
            <view 
              class="ticket-type-item" 
              v-for="(ticket, index) in formData.ticket_types" 
              :key="index"
            >
              <view class="ticket-header">
                <text class="ticket-label">票型 {{ index + 1 }}</text>
                <view class="ticket-actions">
                  <button class="icon-btn" @tap="addTicketType">
                    <text>+</text>
                  </button>
                  <button class="icon-btn delete-btn" @tap="removeTicketType(index)" v-if="formData.ticket_types.length > 1">
                    <text>-</text>
                  </button>
                </view>
              </view>

              <view class="ticket-form">
                <view class="form-item">
                  <text class="form-label required">票型名称 *</text>
                  <input 
                    class="form-input" 
                    v-model="ticket.name" 
                    placeholder="如：普通票"
                    maxlength="20"
                  />
                </view>

                <view class="form-item">
                  <text class="form-label required">票型类型 *</text>
                  <picker mode="selector" :range="ticketTypeOptions" @change="(e) => onTicketTypeChange(index, e)">
                    <view class="picker-input">
                      <text class="picker-text">{{ getTicketTypeText(ticket.type) }}</text>
                      <text class="picker-arrow">›</text>
                    </view>
                  </picker>
                </view>

                <view class="form-item">
                  <text class="form-label required">价格 *</text>
                  <input 
                    class="form-input" 
                    v-model="ticket.price" 
                    type="digit"
                    placeholder="请输入价格"
                  />
                </view>

                <view class="form-item">
                  <text class="form-label">原价</text>
                  <input 
                    class="form-input" 
                    v-model="ticket.original_price" 
                    type="digit"
                    placeholder="用于显示折扣"
                  />
                </view>

                <view class="form-item">
                  <text class="form-label required">可用数量 *</text>
                  <input 
                    class="form-input" 
                    v-model="ticket.available_count" 
                    type="number"
                    placeholder="请输入数量"
                  />
                </view>

                <view class="form-item">
                  <text class="form-label">每人限购</text>
                  <input 
                    class="form-input" 
                    v-model="ticket.max_per_user" 
                    type="number"
                    placeholder="0表示不限"
                  />
                </view>

                <view class="form-item">
                  <text class="form-label">票型状态</text>
                  <picker mode="selector" :range="ticketStatusOptions" @change="(e) => onTicketStatusChange(index, e)">
                    <view class="picker-input">
                      <text class="picker-text">{{ getTicketStatusText(ticket.status) }}</text>
                      <text class="picker-arrow">›</text>
                    </view>
                  </picker>
                </view>

                <view class="form-item" v-if="ticket.type === 6">
                  <text class="form-label">团购人数</text>
                  <input 
                    class="form-input" 
                    v-model="ticket.group_min" 
                    type="number"
                    placeholder="最少团购人数"
                  />
                </view>

                <view class="form-item" v-if="ticket.type === 6">
                  <text class="form-label">团购折扣</text>
                  <input 
                    class="form-input" 
                    v-model="ticket.group_discount" 
                    type="digit"
                    placeholder="团购折扣率（如：0.9表示9折）"
                  />
                </view>

                <view class="form-item" v-if="ticket.type === 7">
                  <text class="form-label">套票数量</text>
                  <input 
                    class="form-input" 
                    v-model="ticket.bundle_count" 
                    type="number"
                    placeholder="套票包含的票型数量"
                  />
                </view>

                <view class="form-item" v-if="ticket.type === 7">
                  <text class="form-label">套票价格</text>
                  <input 
                    class="form-input" 
                    v-model="ticket.bundle_price" 
                    type="digit"
                    placeholder="套票总价"
                  />
                </view>

                <view class="form-item" v-if="ticket.type === 8">
                  <text class="form-label">VIP等级要求</text>
                  <picker mode="selector" :range="vipLevelOptions" @change="(e) => onVipLevelChange(index, e)">
                    <view class="picker-input">
                      <text class="picker-text">{{ getVipLevelText(ticket.vip_level) }}</text>
                      <text class="picker-arrow">›</text>
                    </view>
                  </picker>
                </view>

                <view class="form-item" v-if="ticket.type === 8">
                  <text class="form-label">专属权益</text>
                  <textarea 
                    class="form-textarea" 
                    v-model="ticket.vip_benefits" 
                    placeholder="VIP专享权益说明"
                    maxlength="200"
                  />
                </view>

                <view class="form-item" v-if="ticket.type === 2 || ticket.type === 5 || ticket.type === 6 || ticket.type === 7 || ticket.type === 8">
                  <text class="form-label">库存管理</text>
                  <view class="inventory-info">
                    <text class="info-label">当前库存：{{ ticket.current_stock || ticket.available_count }}</text>
                    <text class="info-label">已售：{{ ticket.sold_count || 0 }}</text>
                  </view>
                </view>

                <view class="form-item" v-if="ticket.type === 2 || ticket.type === 5 || ticket.type === 6">
                  <text class="form-label">早鸟截止时间</text>
                  <picker mode="multiSelector" :range="dateRange" @change="(e) => onEarlyBirdDeadlineChange(index, e)">
                    <view class="picker-input">
                      <text class="picker-text">{{ ticket.early_bird_deadline || '请选择' }}</text>
                      <text class="picker-arrow">›</text>
                    </view>
                  </picker>
                </view>

                <view class="form-item">
                  <text class="form-label">票型说明</text>
                  <textarea 
                    class="form-textarea" 
                    v-model="ticket.description" 
                    placeholder="选填，说明票型包含内容"
                    maxlength="200"
                  />
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">聚会图片</text>
        </view>

        <view class="form-section">
          <view class="image-upload-section">
            <view class="image-list">
              <view 
                class="image-item" 
                v-for="(image, index) in formData.images" 
                :key="index"
              >
                <image class="image-preview" :src="image" mode="aspectFill"></image>
                <view class="image-actions">
                  <button class="image-action-btn" @tap="previewImage(index)">
                    <text>👁️</text>
                  </button>
                  <button class="image-action-btn delete-btn" @tap="removeImage(index)">
                    <text>🗑️</text>
                  </button>
                </view>
              </view>

              <view class="upload-btn" @tap="chooseImage" v-if="formData.images.length < 9">
                <text class="upload-icon">📷</text>
                <text class="upload-text">{{ formData.images.length }}/9</text>
              </view>
            </view>
            <text class="upload-tip">最多上传9张图片，第一张为封面</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">其他设置</text>
        </view>

        <view class="form-section">
          <view class="form-item">
            <text class="form-label">是否推荐</text>
            <switch :checked="formData.is_featured" @change="formData.is_featured = $event.detail.value" />
          </view>

          <view class="form-item">
            <text class="form-label">是否需要审核</text>
            <switch :checked="formData.requires_approval" @change="formData.requires_approval = $event.detail.value" />
          </view>
        </view>
      </view>

      <view class="submit-section">
        <button class="submit-btn" :disabled="submitting" @tap="handleSubmit">
          <text v-if="!submitting">发布聚会</text>
          <text v-else>发布中...</text>
        </button>
      </view>
    </scroll-view>

    <image-editor 
      v-if="showEditor" 
      :imageSrc="editingImage" 
      @confirm="handleImageEditConfirm"
      @cancel="handleImageEditCancel"
    />
  </view>
</template>

<script>
import { partyApi } from '@/api/party.js'
import mapService from '@/utils/mapService.js'
import ImageEditor from '@/components/image-editor.vue'

export default {
  components: {
    ImageEditor
  },
  data() {
    return {
      formData: {
        title: '',
        category: '',
        theme: '',
        description: '',
        start_time: '',
        end_time: '',
        city: '',
        address: '',
        latitude: null,
        longitude: null,
        max_participants: 50,
        gender_limit: null,
        min_age: null,
        max_age: null,
        ticket_types: [
          {
            name: '普通票',
            type: 1,
            price: '',
            original_price: '',
            available_count: 100,
            max_per_user: 0,
            early_bird_deadline: null,
            description: ''
          }
        ],
        images: [],
        is_featured: false,
        requires_approval: false
      },
      submitting: false,
      showEditor: false,
      editingImage: null,
      categories: [
        { label: '🎉 派对', value: 'party' },
        { label: '🎵 音乐', value: 'music' },
        { label: '⚽ 运动', value: 'sports' },
        { label: '🎨 艺术', value: 'art' }
      ],
      themes: [
        { label: '🎪 娱乐', value: 'entertainment' },
        { label: '🍜 美食', value: 'food' },
        { label: '🎮 游戏', value: 'gaming' },
        { label: '📚 学习', value: 'education' },
        { label: '🎭 社交', value: 'social' },
        { label: '🏃 户外', value: 'outdoor' }
      ],
      genderOptions: ['不限', '限男', '限女'],
      ticketTypeOptions: ['普通', '早鸟', '男性', '女性', '男性早鸟', '女性早鸟', 'VIP专享', '团购票', '套票'],
      ticketStatusOptions: ['在售', '售罄', '停售', '预售'],
    }
  },

  computed: {
    selectedCategoryText() {
      const category = this.categories.find(c => c.value === this.formData.category)
      return category ? category.label : '请选择'
    },

    selectedThemeText() {
      const theme = this.themes.find(t => t.value === this.formData.theme)
      return theme ? theme.label : '请选择'
    },

    selectedGenderLimitText() {
      return this.genderOptions[this.formData.gender_limit] || '不限'
    }
  },

  methods: {
    onCategoryChange(e) {
      this.formData.category = this.categories[e.detail.value].value
    },

    onThemeChange(e) {
      this.formData.theme = this.themes[e.detail.value].value
    },

    onStartTimeChange(e) {
      const [year, month, day, hour, minute] = e.detail.value
      this.formData.start_time = `${year}-${month}-${day} ${hour}:${minute}`
    },

    onEndTimeChange(e) {
      const [year, month, day, hour, minute] = e.detail.value
      this.formData.end_time = `${year}-${month}-${day} ${hour}:${minute}`
    },

    onCityChange(e) {
      const [province, city, district] = e.detail.value
      this.formData.city = `${province} ${city} ${district}`
    },

    onGenderLimitChange(e) {
      this.formData.gender_limit = e.detail.value
    },

    onTicketTypeChange(index, e) {
      this.formData.ticket_types[index].type = e.detail.value + 1
    },

    onEarlyBirdDeadlineChange(index, e) {
      const [year, month, day, hour, minute] = e.detail.value
      this.formData.ticket_types[index].early_bird_deadline = `${year}-${month}-${day} ${hour}:${minute}`
    },

    getTicketTypeText(type) {
      return this.ticketTypeOptions[type - 1] || '普通'
    },

    getTicketStatusText(status) {
      const statusMap = {
        0: '在售',
        1: '售罄',
        2: '停售',
        3: '预售'
      }
      return statusMap[status] || '在售'
    },

    onTicketStatusChange(index, e) {
      this.formData.ticket_types[index].status = e.detail.value
    },

    onVipLevelChange(index, e) {
      this.formData.ticket_types[index].vip_level = e.detail.value
    },

    getVipLevelText(level) {
      const levelMap = {
        0: '不限',
        1: '青铜',
        2: '白银',
        3: '黄金',
        4: '铂金',
        5: '钻石'
      }
      return levelMap[level] || '不限'
    },

    async chooseLocation() {
      try {
        const location = await mapService.chooseLocation()
        
        this.formData.latitude = location.latitude
        this.formData.longitude = location.longitude
        this.formData.address = location.address || this.formData.address
        
        uni.showToast({
          title: '定位成功',
          icon: 'success'
        })
      } catch (error) {
        uni.showToast({
          title: error.message || '定位失败',
          icon: 'none'
        })
      }
    },

    chooseImage() {
      uni.chooseImage({
        count: 9 - this.formData.images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePaths = res.tempFilePaths
          tempFilePaths.forEach(filePath => {
            this.showImageEditor(filePath)
          })
        }
      })
    },

    showImageEditor(imageSrc) {
      this.editingImage = imageSrc
      this.showEditor = true
    },

    handleImageEditConfirm(editedImage) {
      uni.uploadFile({
        url: 'https://www.hfparty.asia/api/v1/upload',
        filePath: editedImage,
        name: 'file',
        success: (uploadRes) => {
          const data = JSON.parse(uploadRes.data)
          if (data.code === 0) {
            this.formData.images.push(data.data.url)
          } else {
            uni.showToast({
              title: data.message || '上传失败',
              icon: 'none'
            })
          }
        },
        fail: () => {
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          })
        }
      })
      this.showEditor = false
      this.editingImage = null
    },

    handleImageEditCancel() {
      this.showEditor = false
      this.editingImage = null
    },

    previewImage(index) {
      uni.previewImage({
        urls: this.formData.images,
        current: index
      })
    },

    removeImage(index) {
      this.formData.images.splice(index, 1)
    },

    addTicketType() {
      this.formData.ticket_types.push({
        name: '',
        type: 1,
        price: '',
        original_price: '',
        available_count: 100,
        max_per_user: 0,
        early_bird_deadline: null,
        description: '',
        status: 0,
        group_min: null,
        group_discount: null,
        bundle_count: null,
        bundle_price: null,
        vip_level: 0,
        vip_benefits: '',
        current_stock: 100,
        old_count: 0
      })
    },

    removeTicketType(index) {
      if (this.formData.ticket_types.length > 1) {
        this.formData.ticket_types.splice(index, 1)
      }
    },

    validateForm() {
      if (!this.formData.title || this.formData.title.trim() === '') {
        uni.showToast({
          title: '请输入聚会标题',
          icon: 'none'
        })
        return false
      }

      if (!this.formData.category) {
        uni.showToast({
          title: '请选择聚会分类',
          icon: 'none'
        })
        return false
      }

      if (!this.formData.theme) {
        uni.showToast({
          title: '请选择聚会主题',
          icon: 'none'
        })
        return false
      }

      if (!this.formData.description || this.formData.description.trim() === '') {
        uni.showToast({
          title: '请输入聚会描述',
          icon: 'none'
        })
        return false
      }

      if (!this.formData.start_time) {
        uni.showToast({
          title: '请选择开始时间',
          icon: 'none'
        })
        return false
      }

      if (!this.formData.end_time) {
        uni.showToast({
          title: '请选择结束时间',
          icon: 'none'
        })
        return false
      }

      if (!this.formData.city) {
        uni.showToast({
          title: '请选择所在城市',
          icon: 'none'
        })
        return false
      }

      if (!this.formData.address || this.formData.address.trim() === '') {
        uni.showToast({
          title: '请输入详细地址',
          icon: 'none'
        })
        return false
      }

      if (!this.formData.max_participants || this.formData.max_participants <= 0) {
        uni.showToast({
          title: '请输入最大参与人数',
          icon: 'none'
        })
        return false
      }

      if (this.formData.images.length === 0) {
        uni.showToast({
          title: '请至少上传一张图片',
          icon: 'none'
        })
        return false
      }

      for (let i = 0; i < this.formData.ticket_types.length; i++) {
        const ticket = this.formData.ticket_types[i]
        if (!ticket.name || ticket.name.trim() === '') {
          uni.showToast({
            title: `请输入第${i + 1}种票型的名称`,
            icon: 'none'
          })
          return false
        }

        if (!ticket.price || ticket.price <= 0) {
          uni.showToast({
            title: `请输入第${i + 1}种票型的价格`,
            icon: 'none'
          })
          return false
        }

        if (!ticket.available_count || ticket.available_count <= 0) {
          uni.showToast({
            title: `请输入第${i + 1}种票型的可用数量`,
            icon: 'none'
          })
          return false
        }
      }

      return true
    },

    async handleSubmit() {
      if (!this.validateForm()) return

      this.submitting = true

      try {
        const res = await partyApi.createParty(this.formData)

        if (res.code === 0) {
          uni.showToast({
            title: '发布成功',
            icon: 'success'
          })

          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: res.message || '发布失败',
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
    }
  }
}
</script>

<style lang="scss" scoped>
.create-party-container {
  min-height: 100vh;
  background: #000000;
}

.content-scroll {
  height: 100vh;
  padding-bottom: 150rpx;
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

.required::after {
  content: ' *';
  color: #FF6B35;
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
  transition: all 0.3s;

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
  transition: all 0.3s;

  &:focus {
    border-color: #FF6B35;
    background: rgba(255, 255, 255, 0.15);
  }
}

.char-count {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  text-align: right;
  display: block;
  margin-top: 10rpx;
}

.picker-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15rpx;
  padding: 0 30rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;

  &:active {
    border-color: #FF6B35;
    background: rgba(255, 255, 255, 0.15);
  }
}

.picker-text {
  font-size: 28rpx;
  color: #ffffff;
}

.picker-arrow {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.5);
}

.location-btn {
  width: 100%;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;

  &::after {
    border: none;
  }
}

.location-icon {
  font-size: 32rpx;
  margin-right: 15rpx;
}

.location-text {
  font-size: 28rpx;
  color: #ffffff;
}

.age-inputs {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.age-input {
  flex: 1;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15rpx;
  padding: 0 30rpx;
  color: #ffffff;
  font-size: 28rpx;
  border: 2rpx solid transparent;
  text-align: center;
}

.age-separator {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.5);
}

.ticket-type-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.ticket-type-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20rpx;
  padding: 30rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.1);
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.ticket-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #ffffff;
}

.ticket-actions {
  display: flex;
  gap: 10rpx;
}

.icon-btn {
  width: 60rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  border: none;
  color: #ffffff;

  &::after {
    border: none;
  }
}

.delete-btn {
  background: rgba(244, 67, 54, 0.2);
}

.ticket-form {
  margin-top: 20rpx;
}

.image-upload-section {
  margin-top: 30rpx;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.image-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
}

.image-preview {
  width: 100%;
  height: 100%;
  border-radius: 15rpx;
}

.image-actions {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  display: flex;
  gap: 10rpx;
}

.image-action-btn {
  width: 50rpx;
  height: 50rpx;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  border: none;
  color: #ffffff;

  &::after {
    border: none;
  }
}

.upload-btn {
  width: 200rpx;
  height: 200rpx;
  background: rgba(255, 255, 255, 0.1);
  border: 3rpx dashed rgba(255, 255, 255, 0.3);
  border-radius: 15rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 48rpx;
  margin-bottom: 10rpx;
}

.upload-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.upload-tip {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 20rpx;
  display: block;
}

.submit-section {
  padding: 40rpx;
}

.submit-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
  border-radius: 50rpx;
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
