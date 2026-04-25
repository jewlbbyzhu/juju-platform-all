<template>
  <view class="image-editor-container">
    <view class="editor-header">
      <text class="header-title">图片编辑</text>
      <view class="header-actions">
        <text class="action-btn cancel" @tap="cancel">取消</text>
        <text class="action-btn confirm" @tap="confirm">完成</text>
      </view>
    </view>

    <view class="editor-content">
      <view class="image-preview">
        <canvas 
          class="editor-canvas" 
          canvas-id="editorCanvas"
          :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
        ></canvas>
      </view>

      <view class="editor-controls">
        <view class="control-section">
          <text class="section-title">裁剪比例</text>
          <view class="ratio-buttons">
            <view 
              class="ratio-btn" 
              :class="{ active: cropRatio === 'free' }"
              @tap="setCropRatio('free')"
            >
              <text class="btn-text">自由</text>
            </view>
            <view 
              class="ratio-btn" 
              :class="{ active: cropRatio === '1:1' }"
              @tap="setCropRatio('1:1')"
            >
              <text class="btn-text">1:1</text>
            </view>
            <view 
              class="ratio-btn" 
              :class="{ active: cropRatio === '4:3' }"
              @tap="setCropRatio('4:3')"
            >
              <text class="btn-text">4:3</text>
            </view>
            <view 
              class="ratio-btn" 
              :class="{ active: cropRatio === '16:9' }"
              @tap="setCropRatio('16:9')"
            >
              <text class="btn-text">16:9</text>
            </view>
          </view>
        </view>

        <view class="control-section">
          <text class="section-title">滤镜效果</text>
          <scroll-view class="filter-scroll" scroll-x>
            <view 
              class="filter-item" 
              v-for="filter in filters" 
              :key="filter.name"
              :class="{ active: selectedFilter === filter.name }"
              @tap="applyFilter(filter)"
            >
              <image 
                class="filter-preview" 
                :src="imageSrc" 
                :style="{ filter: filter.filter }"
                mode="aspectFill"
              ></image>
              <text class="filter-name">{{ filter.label }}</text>
            </view>
          </scroll-view>
        </view>

        <view class="control-section">
          <text class="section-title">调整参数</text>
          <view class="adjustment-item">
            <text class="adjustment-label">亮度</text>
            <slider 
              class="adjustment-slider" 
              :value="adjustments.brightness" 
              min="0" 
              max="200" 
              @change="updateAdjustment('brightness', $event)"
              activeColor="#667eea"
              backgroundColor="rgba(255,255,255,0.1)"
            />
          </view>
          <view class="adjustment-item">
            <text class="adjustment-label">对比度</text>
            <slider 
              class="adjustment-slider" 
              :value="adjustments.contrast" 
              min="0" 
              max="200" 
              @change="updateAdjustment('contrast', $event)"
              activeColor="#667eea"
              backgroundColor="rgba(255,255,255,0.1)"
            />
          </view>
          <view class="adjustment-item">
            <text class="adjustment-label">饱和度</text>
            <slider 
              class="adjustment-slider" 
              :value="adjustments.saturation" 
              min="0" 
              max="200" 
              @change="updateAdjustment('saturation', $event)"
              activeColor="#667eea"
              backgroundColor="rgba(255,255,255,0.1)"
            />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  imageSrc: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const canvasWidth = ref(300)
const canvasHeight = ref(300)
const cropRatio = ref('free')
const selectedFilter = ref('none')
const imageInfo = ref(null)
const ctx = ref(null)

const filters = [
  { name: 'none', label: '原图', filter: 'none' },
  { name: 'grayscale', label: '黑白', filter: 'grayscale(100%)' },
  { name: 'sepia', label: '复古', filter: 'sepia(100%)' },
  { name: 'warm', label: '暖色', filter: 'sepia(30%) saturate(150%)' },
  { name: 'cool', label: '冷色', filter: 'hue-rotate(180deg) saturate(80%)' },
  { name: 'vivid', label: '鲜艳', filter: 'saturate(200%) contrast(120%)' },
  { name: 'soft', label: '柔和', filter: 'brightness(110%) contrast(90%)' },
  { name: 'dramatic', label: '戏剧', filter: 'contrast(150%) saturate(120%)' }
]

const adjustments = ref({
  brightness: 100,
  contrast: 100,
  saturation: 100
})

const initCanvas = () => {
  const query = uni.createSelectorQuery()
  query.select('#editorCanvas')
    .fields({ node: true, size: true })
    .exec((res) => {
      if (res[0]) {
        const canvas = res[0].node
        ctx.value = canvas.getContext('2d')
        
        canvas.width = canvasWidth.value
        canvas.height = canvasHeight.value
        
        loadImage()
      }
    })
}

const loadImage = () => {
  uni.getImageInfo({
    src: props.imageSrc,
    success: (res) => {
      imageInfo.value = res
      
      if (cropRatio.value !== 'free') {
        const [w, h] = cropRatio.value.split(':').map(Number)
        const targetRatio = w / h
        const imageRatio = res.width / res.height
        
        if (imageRatio > targetRatio) {
          canvasHeight.value = canvasWidth.value / targetRatio
        } else {
          canvasWidth.value = canvasHeight.value * targetRatio
        }
      } else {
        canvasWidth.value = Math.min(300, res.width)
        canvasHeight.value = res.width / res.height * canvasWidth.value
      }
      
      drawImage()
    }
  })
}

const drawImage = () => {
  if (!ctx.value || !imageInfo.value) return
  
  const canvas = ctx.value.canvas
  ctx.value.clearRect(0, 0, canvas.width, canvas.height)
  
  ctx.value.filter = getFilterString()
  ctx.value.drawImage(imageInfo.value.path, 0, 0, canvas.width, canvas.height)
}

const getFilterString = () => {
  const filter = filters.find(f => f.name === selectedFilter.value)
  const baseFilter = filter ? filter.filter : 'none'
  
  const brightness = adjustments.value.brightness / 100
  const contrast = adjustments.value.contrast / 100
  const saturation = adjustments.value.saturation / 100
  
  return `${baseFilter} brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`
}

const setCropRatio = (ratio) => {
  cropRatio.value = ratio
  if (imageInfo.value) {
    loadImage()
  }
}

const applyFilter = (filter) => {
  selectedFilter.value = filter.name
  drawImage()
}

const updateAdjustment = (key, event) => {
  adjustments.value[key] = event.detail.value
  drawImage()
}

const confirm = () => {
  uni.canvasToTempFilePath({
    canvasId: 'editorCanvas',
    success: (res) => {
      emit('confirm', res.tempFilePath)
    },
    fail: (error) => {
      uni.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  })
}

const cancel = () => {
  emit('cancel')
}

const reset = () => {
  cropRatio.value = 'free'
  selectedFilter.value = 'none'
  adjustments.value = {
    brightness: 100,
    contrast: 100,
    saturation: 100
  }
  drawImage()
}

onMounted(() => {
  initCanvas()
})

watch(() => props.imageSrc, () => {
  reset()
  loadImage()
})
</script>

<style lang="scss" scoped>
.image-editor-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000000;
  z-index: 9999;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.header-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
}

.header-actions {
  display: flex;
  gap: 30rpx;
}

.action-btn {
  font-size: 28rpx;
  padding: 10rpx 20rpx;
}

.action-btn.cancel {
  color: rgba(255, 255, 255, 0.6);
}

.action-btn.confirm {
  color: #667eea;
  font-weight: 500;
}

.editor-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.image-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx;
  background: rgba(0, 0, 0, 0.5);
}

.editor-canvas {
  max-width: 100%;
  max-height: 100%;
  border-radius: 10rpx;
}

.editor-controls {
  background: rgba(255, 255, 255, 0.05);
  border-top: 1rpx solid rgba(255, 255, 255, 0.1);
  padding: 30rpx;
  max-height: 50%;
  overflow-y: auto;
}

.control-section {
  margin-bottom: 40rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 20rpx;
}

.ratio-buttons {
  display: flex;
  gap: 15rpx;
}

.ratio-btn {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10rpx;
  border: 1rpx solid transparent;
  transition: all 0.3s;
}

.ratio-btn.active {
  background: rgba(102, 126, 234, 0.2);
  border-color: #667eea;
}

.btn-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.ratio-btn.active .btn-text {
  color: #667eea;
  font-weight: 500;
}

.filter-scroll {
  white-space: nowrap;
  padding-bottom: 10rpx;
}

.filter-item {
  display: inline-block;
  width: 140rpx;
  margin-right: 20rpx;
  text-align: center;
  padding: 10rpx;
  border-radius: 10rpx;
  border: 1rpx solid transparent;
  transition: all 0.3s;
}

.filter-item.active {
  background: rgba(102, 126, 234, 0.2);
  border-color: #667eea;
}

.filter-preview {
  width: 120rpx;
  height: 120rpx;
  border-radius: 10rpx;
  margin-bottom: 10rpx;
}

.filter-name {
  display: block;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
}

.filter-item.active .filter-name {
  color: #667eea;
  font-weight: 500;
}

.adjustment-item {
  margin-bottom: 30rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.adjustment-label {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 15rpx;
}

.adjustment-slider {
  width: 100%;
}
</style>
