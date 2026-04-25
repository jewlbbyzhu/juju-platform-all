/**
 * 页面过渡动画 Mixin
 * 提供页面进入/离开动画、滚动动画、元素入场动画等功能
 */

export default {
  data() {
    return {
      // 页面动画状态
      pageAnimationClass: '',
      pageVisible: false,
      
      // 滚动动画观察器
      scrollObserver: null,
      animatedElements: new Set(),
      
      // 页面滚动状态
      scrollTop: 0,
      isScrolling: false,
      scrollTimer: null
    }
  },
  
  onLoad() {
    // 页面加载时触发动画
    this.triggerPageEnter()
  },
  
  onShow() {
    // 页面显示时
    this.pageVisible = true
  },
  
  onHide() {
    // 页面隐藏时
    this.pageVisible = false
  },
  
  onUnload() {
    // 页面卸载时清理
    this.cleanupScrollObserver()
  },
  
  onPageScroll(e) {
    this.scrollTop = e.scrollTop
    this.isScrolling = true
    
    // 防抖处理
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer)
    }
    
    this.scrollTimer = setTimeout(() => {
      this.isScrolling = false
    }, 150)
    
    // 触发滚动事件
    this.handleScrollAnimation()
  },
  
  methods: {
    // 页面进入动画
    triggerPageEnter() {
      this.pageAnimationClass = 'page-enter'
      
      setTimeout(() => {
        this.pageAnimationClass = 'page-enter-active'
        this.initScrollAnimation()
      }, 50)
    },
    
    // 页面离开动画
    triggerPageLeave(callback) {
      this.pageAnimationClass = 'page-leave'
      
      setTimeout(() => {
        this.pageAnimationClass = 'page-leave-active'
        if (callback) {
          setTimeout(callback, 300)
        }
      }, 50)
    },
    
    // 初始化滚动动画观察器
    initScrollAnimation() {
      // #ifdef H5
      if (typeof IntersectionObserver !== 'undefined') {
        this.scrollObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                this.animateElement(entry.target)
              }
            })
          },
          {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
          }
        )
        
        // 观察所有需要动画的元素
        this.observeAnimatedElements()
      }
      // #endif
    },
    
    // 观察动画元素
    observeAnimatedElements() {
      const elements = document.querySelectorAll('.animate-on-scroll')
      elements.forEach(el => {
        if (!this.animatedElements.has(el)) {
          this.scrollObserver.observe(el)
          this.animatedElements.add(el)
        }
      })
    },
    
    // 清理滚动观察器
    cleanupScrollObserver() {
      if (this.scrollObserver) {
        this.scrollObserver.disconnect()
        this.scrollObserver = null
      }
      this.animatedElements.clear()
      
      if (this.scrollTimer) {
        clearTimeout(this.scrollTimer)
      }
    },
    
    // 元素入场动画
    animateElement(element) {
      const animationType = element.dataset.animation || 'fadeInUp'
      const delay = element.dataset.delay || 0
      
      setTimeout(() => {
        element.classList.add(`animated-${animationType}`)
        element.classList.add('animated-visible')
      }, delay)
      
      // 动画完成后停止观察
      if (this.scrollObserver) {
        this.scrollObserver.unobserve(element)
      }
    },
    
    // 处理滚动动画
    handleScrollAnimation() {
      // 可以在这里添加视差效果等
      this.$emit('pageScroll', {
        scrollTop: this.scrollTop,
        isScrolling: this.isScrolling
      })
    },
    
    // 列表项交错动画
    staggerListAnimation(listRef, itemSelector, baseDelay = 50) {
      // #ifdef H5
      this.$nextTick(() => {
        const items = document.querySelectorAll(itemSelector)
        items.forEach((item, index) => {
          item.style.opacity = '0'
          item.style.transform = 'translateY(30rpx)'
          
          setTimeout(() => {
            item.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            item.style.opacity = '1'
            item.style.transform = 'translateY(0)'
          }, index * baseDelay)
        })
      })
      // #endif
    },
    
    // 卡片翻转动画
    flipCard(cardRef) {
      const card = this.$refs[cardRef]
      if (card) {
        card.classList.toggle('flipped')
      }
    },
    
    // 脉冲动画
    pulseElement(elementRef) {
      const element = this.$refs[elementRef]
      if (element) {
        element.classList.add('pulse-animation')
        setTimeout(() => {
          element.classList.remove('pulse-animation')
        }, 1000)
      }
    },
    
    // 抖动动画
    shakeElement(elementRef) {
      const element = this.$refs[elementRef]
      if (element) {
        element.classList.add('shake-animation')
        setTimeout(() => {
          element.classList.remove('shake-animation')
        }, 500)
      }
    },
    
    // 弹跳动画
    bounceElement(elementRef) {
      const element = this.$refs[elementRef]
      if (element) {
        element.classList.add('bounce-animation')
        setTimeout(() => {
          element.classList.remove('bounce-animation')
        }, 1000)
      }
    },
    
    // 导航跳转带动画
    navigateTo(url, animationType = 'forward') {
      // 触发页面离开动画
      uni.$emit('pageTransition', animationType)
      
      setTimeout(() => {
        uni.navigateTo({
          url,
          animationType: animationType === 'forward' ? 'slide-in-right' : 'slide-in-left',
          animationDuration: 300
        })
      }, 100)
    },
    
    // 返回带动画
    navigateBack(delta = 1) {
      uni.$emit('pageTransition', 'back')
      
      setTimeout(() => {
        uni.navigateBack({
          delta,
          animationType: 'slide-out-right',
          animationDuration: 300
        })
      }, 100)
    }
  }
}

// 页面动画样式（需要在全局样式中引入）
export const pageTransitionStyles = `
/* 页面进入动画 */
.page-enter {
  opacity: 0;
  transform: translateX(50rpx);
}

.page-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 页面离开动画 */
.page-leave {
  opacity: 1;
  transform: translateX(0);
}

.page-leave-active {
  opacity: 0;
  transform: translateX(-50rpx);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 滚动动画基础样式 */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(30rpx);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.animated-visible {
  opacity: 1;
  transform: translateY(0);
}

/* 淡入上移动画 */
.animated-fadeInUp {
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 淡入左移动画 */
.animated-fadeInLeft {
  animation: fadeInLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-30rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 淡入右移动画 */
.animated-fadeInRight {
  animation: fadeInRight 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(30rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 缩放入场动画 */
.animated-zoomIn {
  animation: zoomIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 脉冲动画 */
.pulse-animation {
  animation: pulse 1s ease-in-out;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* 抖动动画 */
.shake-animation {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5rpx);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5rpx);
  }
}

/* 弹跳动画 */
.bounce-animation {
  animation: bounce 1s ease-in-out;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20rpx);
  }
  70% {
    transform: translateY(-10rpx);
  }
}

/* 卡片翻转动画 */
.flip-card {
  perspective: 1000rpx;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flip-card.flipped .flip-card-inner {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.flip-card-back {
  transform: rotateY(180deg);
}

/* 悬浮效果 */
.hover-float {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-float:hover {
  transform: translateY(-8rpx);
  box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.15);
}

/* 点击反馈 */
.click-feedback {
  transition: transform 0.1s ease, opacity 0.1s ease;
}

.click-feedback:active {
  transform: scale(0.96);
  opacity: 0.8;
}

/* 加载骨架屏动画 */
.skeleton-loading {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 渐变文字动画 */
.gradient-text-animation {
  background: linear-gradient(90deg, #FF6B35, #4ECDC4, #FF6B35);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientText 3s linear infinite;
}

@keyframes gradientText {
  0% {
    background-position: 0% center;
  }
  100% {
    background-position: 200% center;
  }
}

/* 光晕效果 */
.glow-effect {
  position: relative;
}

.glow-effect::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
  background: inherit;
  filter: blur(20rpx);
  opacity: 0.5;
  z-index: -1;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

/* 列表项交错动画 */
.stagger-item {
  opacity: 0;
  transform: translateY(20rpx);
}

.stagger-item.visible {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
`
