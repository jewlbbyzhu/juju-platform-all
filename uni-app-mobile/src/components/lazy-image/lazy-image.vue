<template>
  <view class="lazy-image-wrapper" :style="{ width, height }">
    <!-- 占位图/骨架屏 -->
    <view v-if="!loaded && !error" class="image-placeholder" :style="{ width, height }">
      <view class="placeholder-skeleton" />
    </view>
    
    <!-- 错误状态 -->
    <view v-if="error" class="image-error" :style="{ width, height }">
      <image class="error-icon" src="/static/image-error.png" mode="aspectFit" />
    </view>
    
    <!-- 实际图片 -->
    <image
      v-show="loaded && !error"
      class="lazy-image"
      :src="realSrc"
      :mode="mode"
      :lazy-load="true"
      :webp="webp"
      @load="onLoad"
      @error="onError"
    />
  </view>
</template>

<script>
/**
 * 懒加载图片组件
 * 功能：
 * 1. 图片懒加载 - 进入视口才加载
 * 2. 加载占位 - 显示骨架屏
 * 3. 错误处理 - 加载失败显示默认图
 * 4. 缓存复用 - 已加载图片优先从缓存读取
 */
export default {
  name: 'LazyImage',
  props: {
    src: {
      type: String,
      default: ''
    },
    mode: {
      type: String,
      default: 'aspectFill'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '200rpx'
    },
    // 是否启用webp压缩
    webp: {
      type: Boolean,
      default: true
    },
    // 默认图片
    defaultSrc: {
      type: String,
      default: '/static/default-image.png'
    },
    // 预加载阈值(px)
    threshold: {
      type: Number,
      default: 200
    }
  },
  data() {
    return {
      loaded: false,
      error: false,
      realSrc: '',
      observer: null
    };
  },
  watch: {
    src: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.initLazyLoad();
        }
      }
    }
  },
  mounted() {
    this.initLazyLoad();
  },
  beforeUnmount() {
    this.disconnectObserver();
  },
  methods: {
    initLazyLoad() {
      // 检查图片是否已缓存
      if (this.checkImageCache(this.src)) {
        this.realSrc = this.src;
        this.loaded = true;
        return;
      }
      
      // 创建IntersectionObserver实现懒加载
      this.createObserver();
    },
    
    createObserver() {
      // #ifdef H5
      if (typeof IntersectionObserver !== 'undefined') {
        this.observer = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                this.loadImage();
                this.disconnectObserver();
              }
            });
          },
          {
            rootMargin: `${this.threshold}px`,
            threshold: 0.01
          }
        );
        
        const query = uni.createSelectorQuery().in(this);
        query.select('.lazy-image-wrapper').boundingClientRect();
        query.exec((res) => {
          if (res[0] && this.observer) {
            // H5环境直接使用DOM观察
            const el = document.querySelector(`[data-v-${this._uid}] .lazy-image-wrapper`);
            if (el) this.observer.observe(el);
          }
        });
      } else {
        this.loadImage();
      }
      // #endif
      
      // #ifndef H5
      // 小程序环境使用pageScroll或直接加载
      this.observeInMiniProgram();
      // #endif
    },
    
    observeInMiniProgram() {
      // 小程序环境延迟加载或立即加载
      const pages = getCurrentPages();
      if (!pages.length) {
        setTimeout(() => this.observeInMiniProgram(), 100);
        return;
      }
      
      const query = uni.createSelectorQuery().in(this);
      query.select('.lazy-image-wrapper').boundingClientRect();
      query.selectViewport().scrollOffset();
      query.exec((res) => {
        if (!res[0]) {
          // 元素不存在，延迟重试
          setTimeout(() => this.observeInMiniProgram(), 200);
          return;
        }
        
        const rect = res[0];
        const windowHeight = uni.getSystemInfoSync().windowHeight;
        
        // 如果在视口内或下方threshold范围内，加载图片
        if (rect.top < windowHeight + this.threshold) {
          this.loadImage();
        } else {
          // 否则监听滚动
          this.bindScrollListener();
        }
      });
    },
    
    bindScrollListener() {
      // 使用throttle优化滚动性能
      let ticking = false;
      this._scrollHandler = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.checkInViewport();
            ticking = false;
          });
          ticking = true;
        }
      };
      
      // 监听页面滚动
      uni.$on('pageScroll', this._scrollHandler);
    },
    
    checkInViewport() {
      const query = uni.createSelectorQuery().in(this);
      query.select('.lazy-image-wrapper').boundingClientRect();
      query.exec((res) => {
        if (res[0]) {
          const rect = res[0];
          const windowHeight = uni.getSystemInfoSync().windowHeight;
          
          if (rect.top < windowHeight + this.threshold) {
            this.loadImage();
            this.unbindScrollListener();
          }
        }
      });
    },
    
    unbindScrollListener() {
      if (this._scrollHandler) {
        uni.$off('pageScroll', this._scrollListener);
        this._scrollHandler = null;
      }
    },
    
    loadImage() {
      if (this.loaded || this.loading) return;
      
      this.loading = true;
      this.realSrc = this.src;
    },
    
    onLoad() {
      this.loaded = true;
      this.loading = false;
      this.setImageCache(this.src);
      this.$emit('load');
    },
    
    onError() {
      this.error = true;
      this.loading = false;
      this.realSrc = this.defaultSrc;
      this.$emit('error');
    },
    
    // 检查图片缓存
    checkImageCache(src) {
      try {
        const cacheKey = `img_cache_${this.hashCode(src)}`;
        const cached = uni.getStorageSync(cacheKey);
        return cached && (Date.now() - cached.time < 24 * 60 * 60 * 1000); // 24小时缓存
      } catch (e) {
        return false;
      }
    },
    
    // 设置图片缓存
    setImageCache(src) {
      try {
        const cacheKey = `img_cache_${this.hashCode(src)}`;
        uni.setStorageSync(cacheKey, { time: Date.now() });
      } catch (e) {
        // 缓存失败不处理
      }
    },
    
    // 字符串hash
    hashCode(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(36);
    },
    
    disconnectObserver() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      this.unbindScrollListener();
    }
  }
};
</script>

<style lang="scss" scoped>
.lazy-image-wrapper {
  position: relative;
  overflow: hidden;
  background: #1a1a1a;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.placeholder-skeleton {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.05);
}

.image-error {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  
  .error-icon {
    width: 60%;
    height: 60%;
    opacity: 0.3;
  }
}

.lazy-image {
  width: 100%;
  height: 100%;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
</style>