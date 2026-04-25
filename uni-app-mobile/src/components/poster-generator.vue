<template>
  <view class="poster-generator-container">
    <view class="poster-canvas-wrapper">
      <canvas 
        class="poster-canvas" 
        canvas-id="posterCanvas"
        :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
      ></canvas>
    </view>

    <view class="poster-actions">
      <button class="action-btn save" @tap="savePoster">
        <text class="btn-icon">💾</text>
        <text class="btn-text">保存到相册</text>
      </button>
      <button class="action-btn share" @tap="sharePoster">
        <text class="btn-icon">📤</text>
        <text class="btn-text">分享给好友</text>
      </button>
    </view>

    <view class="poster-loading" v-if="loading">
      <view class="loading-content">
        <text class="loading-icon">⏳</text>
        <text class="loading-text">正在生成海报...</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  party: {
    type: Object,
    required: true
  },
  user: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const canvasWidth = ref(750)
const canvasHeight = ref(1000)
const ctx = ref(null)
const loading = ref(false)
const posterPath = ref('')

const initCanvas = () => {
  const query = uni.createSelectorQuery()
  query.select('#posterCanvas')
    .fields({ node: true, size: true })
    .exec((res) => {
      if (res[0]) {
        const canvas = res[0].node
        ctx.value = canvas.getContext('2d')
        
        canvas.width = canvasWidth.value
        canvas.height = canvasHeight.value
        
        drawPoster()
      }
    })
}

const drawPoster = async () => {
  if (!ctx.value) return

  loading.value = true

  try {
    const canvas = ctx.value.canvas
    
    ctx.value.fillStyle = '#1a1a1a'
    ctx.value.fillRect(0, 0, canvas.width, canvas.height)

    await drawBackground()
    await drawHeader()
    await drawContent()
    await drawFooter()
    
    const res = await uni.canvasToTempFilePath({
      canvasId: 'posterCanvas',
      fileType: 'jpg',
      quality: 0.9
    })

    posterPath.value = res.tempFilePath
  } catch (error) {
    console.error('Failed to draw poster:', error)
    uni.showToast({
      title: '海报生成失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const drawBackground = async () => {
  if (props.party.images && props.party.images.length > 0) {
    try {
      const imageInfo = await uni.getImageInfo({
        src: props.party.images[0]
      })

      const img = await new Promise((resolve, reject) => {
        const imgObj = ctx.value.createImage()
        imgObj.onload = () => resolve(imgObj)
        imgObj.onerror = reject
        imgObj.src = props.party.images[0]
      })

      const scale = Math.max(
        canvasWidth.value / imageInfo.width,
        (canvasHeight.value * 0.5) / imageInfo.height
      )
      const drawWidth = imageInfo.width * scale
      const drawHeight = imageInfo.height * scale
      const drawX = (canvasWidth.value - drawWidth) / 2

      ctx.value.globalAlpha = 0.3
      ctx.value.drawImage(img, drawX, 0, drawWidth, drawHeight)
      ctx.value.globalAlpha = 1.0
    } catch (error) {
      console.error('Failed to draw background image:', error)
    }
  }
}

const drawHeader = async () => {
  const startY = canvasHeight.value * 0.5

  ctx.value.fillStyle = 'rgba(102, 126, 234, 0.1)'
  ctx.value.fillRect(0, startY, canvasWidth.value, 100)

  ctx.value.fillStyle = '#667eea'
  ctx.value.font = 'bold 48px sans-serif'
  ctx.value.textAlign = 'center'
  ctx.value.fillText('聚聚派对', canvasWidth.value / 2, startY + 60)

  ctx.value.fillStyle = 'rgba(255, 255, 255, 0.8)'
  ctx.value.font = '32px sans-serif'
  ctx.value.fillText(props.party.title || '精彩派对', canvasWidth.value / 2, startY + 100)
}

const drawContent = async () => {
  const startY = canvasHeight.value * 0.6
  const padding = 60
  const lineHeight = 50

  ctx.value.fillStyle = '#ffffff'
  ctx.value.font = '28px sans-serif'
  ctx.value.textAlign = 'left'

  const content = props.party.description || '快来参加这个精彩的派对吧！'
  const maxWidth = canvasWidth.value - padding * 2

  const lines = wrapText(content, maxWidth)
  
  lines.forEach((line, index) => {
    ctx.value.fillText(line, padding, startY + index * lineHeight)
  })

  let currentY = startY + lines.length * lineHeight + 60

  if (props.party.start_time) {
    const timeText = `时间：${formatTime(props.party.start_time)}`
    ctx.value.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.value.font = '26px sans-serif'
    ctx.value.fillText(timeText, padding, currentY)
    currentY += lineHeight
  }

  if (props.party.address) {
    const addressText = `地点：${props.party.address}`
    ctx.value.fillText(addressText, padding, currentY)
    currentY += lineHeight
  }

  if (props.party.ticket_types && props.party.ticket_types.length > 0) {
    const ticket = props.party.ticket_types[0]
    const priceText = `票价：¥${ticket.price}起`
    ctx.value.fillStyle = '#d4af37'
    ctx.value.font = 'bold 32px sans-serif'
    ctx.value.fillText(priceText, padding, currentY)
  }
}

const drawFooter = async () => {
  const startY = canvasHeight.value - 200

  ctx.value.fillStyle = 'rgba(255, 255, 255, 0.05)'
  ctx.value.fillRect(0, startY, canvasWidth.value, 200)

  if (props.user.avatar) {
    try {
      const imageInfo = await uni.getImageInfo({
        src: props.user.avatar
      })

      const img = await new Promise((resolve, reject) => {
        const imgObj = ctx.value.createImage()
        imgObj.onload = () => resolve(imgObj)
        imgObj.onerror = reject
        imgObj.src = props.user.avatar
      })

      const avatarSize = 80
      const avatarX = 60
      const avatarY = startY + 60

      ctx.value.save()
      ctx.value.beginPath()
      ctx.value.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
      ctx.value.closePath()
      ctx.value.clip()
      ctx.value.drawImage(img, avatarX, avatarY, avatarSize, avatarSize)
      ctx.value.restore()
    } catch (error) {
      console.error('Failed to draw avatar:', error)
    }
  }

  const nickname = props.user.nickname || '匿名用户'
  ctx.value.fillStyle = '#ffffff'
  ctx.value.font = 'bold 28px sans-serif'
  ctx.value.textAlign = 'left'
  ctx.value.fillText(nickname, 160, startY + 100)

  ctx.value.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.value.font = '24px sans-serif'
  ctx.value.fillText('邀请你参加聚会', 160, startY + 140)

  const qrCodeSize = 120
  const qrCodeX = canvasWidth.value - qrCodeSize - 60
  const qrCodeY = startY + 40

  ctx.value.fillStyle = '#ffffff'
  ctx.value.fillRect(qrCodeX, qrCodeY, qrCodeSize, qrCodeSize)

  ctx.value.fillStyle = '#000000'
  ctx.value.font = '20px sans-serif'
  ctx.value.textAlign = 'center'
  ctx.value.fillText('扫码参与', qrCodeX + qrCodeSize / 2, qrCodeY + qrCodeSize + 30)
}

const wrapText = (text, maxWidth) => {
  const words = text.split('')
  const lines = []
  let currentLine = ''

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine + words[i]
    const metrics = ctx.value.measureText(testLine)
    
    if (metrics.width > maxWidth && i > 0) {
      lines.push(currentLine)
      currentLine = words[i]
    } else {
      currentLine = testLine
    }
  }
  
  lines.push(currentLine)
  return lines
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  return `${month}月${day}日 ${hour}:${minute.toString().padStart(2, '0')}`
}

const savePoster = async () => {
  if (!posterPath.value) {
    uni.showToast({
      title: '海报未生成',
      icon: 'none'
    })
    return
  }

  try {
    await uni.saveImageToPhotosAlbum({
      filePath: posterPath.value
    })

    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    })
  }
}

const sharePoster = () => {
  if (!posterPath.value) {
    uni.showToast({
      title: '海报未生成',
      icon: 'none'
    })
    return
  }

  uni.share({
    provider: 'weixin',
    scene: 'WXSceneSession',
    type: 0,
    imageUrl: posterPath.value,
    title: props.party.title || '精彩派对',
    summary: props.party.description || '快来参加这个精彩的派对吧！'
  })
}

onMounted(() => {
  nextTick(() => {
    initCanvas()
  })
})
</script>

<style lang="scss" scoped>
.poster-generator-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.poster-canvas-wrapper {
  background: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.5);
}

.poster-canvas {
  display: block;
}

.poster-actions {
  display: flex;
  gap: 30rpx;
  margin-top: 40rpx;
  width: 100%;
  max-width: 600rpx;
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding: 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  font-size: 28rpx;
  color: #ffffff;
  border: none;

  &::after {
    border: none;
  }
}

.action-btn.save {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
}

.btn-icon {
  font-size: 48rpx;
}

.btn-text {
  font-size: 26rpx;
}

.poster-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.loading-icon {
  font-size: 80rpx;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 28rpx;
  color: #ffffff;
}
</style>
