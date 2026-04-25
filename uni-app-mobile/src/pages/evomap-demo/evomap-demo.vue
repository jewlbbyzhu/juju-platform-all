<template>
  <view class="evomap-container">
    <view class="header">
      <text class="title">EvoMap GEP-A2A 接入测试</text>
    </view>
    
    <view class="status-card">
      <text class="label">节点状态:</text>
      <text :class="['status', nodeStatus]">{{ nodeStatusText }}</text>
    </view>
    
    <view class="claim-card" v-if="claimUrl">
      <text class="label">绑定链接:</text>
      <text class="url" selectable>{{ claimUrl }}</text>
      <button class="btn-copy" @click="copyClaimUrl">复制链接</button>
    </view>
    
    <view class="actions">
      <button class="btn-primary" @click="registerNode" :disabled="loading">
        {{ loading ? '注册中...' : 'Step 1: 注册节点' }}
      </button>
      
      <button class="btn-primary" @click="publishPackage" :disabled="loading || !isBound">
        {{ loading ? '发布中...' : 'Step 2: 发布 Gene + Capsule' }}
      </button>
      
      <button class="btn-primary" @click="fetchAssets" :disabled="loading">
        {{ loading ? '获取中...' : 'Step 3: 获取全网资产' }}
      </button>
    </view>
    
    <view class="assets-list" v-if="publishResult">
      <text class="section-title">发布结果:</text>
      <view class="asset-item">
        <text class="asset-type">Gene ID</text>
        <text class="asset-summary">{{ publishResult.payload?.gene?.gene_id || '发布中...' }}</text>
      </view>
      <view class="asset-item">
        <text class="asset-type">Capsule ID</text>
        <text class="asset-summary">{{ publishResult.payload?.capsule?.capsule_id || '发布中...' }}</text>
      </view>
    </view>
    
    <view class="assets-list" v-if="assets.length > 0">
      <text class="section-title">推荐资产:</text>
      <view class="asset-item" v-for="(asset, index) in assets" :key="index">
        <text class="asset-type">{{ asset.asset_type }}</text>
        <text class="asset-summary">{{ asset.summary }}</text>
        <text class="asset-score">GDI Score: {{ asset.gdi_score }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import EvoMapClient from '@/utils/evomap.js';

export default {
  data() {
    return {
      client: null,
      nodeStatus: 'disconnected',
      nodeStatusText: '未连接',
      claimUrl: '',
      claimCode: '',
      isBound: true, // 已绑定
      assets: [],
      loading: false,
      publishResult: null
    };
  },
  
  onLoad() {
    // 初始化 EvoMap 客户端
    this.client = new EvoMapClient();
  },
  
  methods: {
    /**
     * Step 1: 注册节点
     */
    async registerNode() {
      this.loading = true;
      try {
        const response = await this.client.hello({
          features: ['uni-app', 'mobile'],
          version: '1.0.0'
        });
        
        console.log('EvoMap 注册成功:', response);
        
        if (response.payload) {
          this.nodeStatus = 'connected';
          this.nodeStatusText = '已连接';
          this.claimCode = response.payload.claim_code;
          this.claimUrl = response.payload.claim_url;
          
          uni.showToast({
            title: '注册成功！',
            icon: 'success'
          });
        }
      } catch (error) {
        console.error('注册失败:', error);
        uni.showToast({
          title: '注册失败: ' + error.message,
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Step 3: 获取全网资产
     */
    async fetchAssets() {
      this.loading = true;
      try {
        const response = await this.client.fetch({
          limit: 10,
          sort: 'gdi_score'
        });
        
        console.log('获取资产成功:', response);
        
        if (response.payload && response.payload.recommended_assets) {
          this.assets = response.payload.recommended_assets;
          
          uni.showToast({
            title: `获取 ${this.assets.length} 个资产`,
            icon: 'success'
          });
        }
      } catch (error) {
        console.error('获取资产失败:', error);
        uni.showToast({
          title: '获取失败: ' + error.message,
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Step 2: 发布 Gene + Capsule
     */
    async publishPackage() {
      this.loading = true;
      try {
        // 创建示例 Gene（策略定义）
        const geneConfig = {
          name: 'juju_party_optimization',
          version: '1.0.0',
          description: '聚聚平台性能优化策略：提升APK启动速度、减少内存占用、优化网络请求',
          triggers: ['app_launch', 'memory_high', 'network_timeout'],
          strategy: {
            type: 'performance_optimization',
            rules: [
              { action: 'preload_assets', priority: 'high' },
              { action: 'lazy_load_components', priority: 'medium' },
              { action: 'cache_api_responses', priority: 'high' }
            ]
          },
          tags: ['uni-app', 'performance', 'optimization']
        };

        // 创建示例 Capsule（修复包）
        const capsuleConfig = {
          name: 'juju_startup_optimizer',
          version: '1.0.0',
          description: 'APK启动优化修复包：延迟加载非关键资源、预编译首页组件、优化WebView初始化',
          code: `
            // 启动优化代码
            export default {
              onLaunch() {
                // 延迟加载非关键资源
                setTimeout(() => {
                  this.loadNonCriticalAssets();
                }, 2000);
                
                // 预编译首页
                this.precompileHomePage();
              },
              
              loadNonCriticalAssets() {
                // 加载非关键资源
                console.log('Loading non-critical assets...');
              },
              
              precompileHomePage() {
                // 预编译首页组件
                console.log('Precompiling home page...');
              }
            };
          `,
          dependencies: ['uni-app', 'vue3'],
          tags: ['startup', 'optimization', 'performance']
        };

        // 发布到 EvoMap
        const response = await this.client.publishPackage(geneConfig, capsuleConfig);
        
        console.log('发布成功:', response);
        this.publishResult = response;
        
        uni.showToast({
          title: 'Gene + Capsule 发布成功！',
          icon: 'success',
          duration: 2000
        });
      } catch (error) {
        console.error('发布失败:', error);
        uni.showToast({
          title: '发布失败: ' + error.message,
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * 复制绑定链接
     */
    copyClaimUrl() {
      uni.setClipboardData({
        data: this.claimUrl,
        success: () => {
          uni.showToast({
            title: '链接已复制',
            icon: 'success'
          });
        }
      });
    }
  }
};
</script>

<style lang="scss">
.evomap-container {
  padding: 30rpx;
  background: #0a0a0a;
  min-height: 100vh;
}

.header {
  margin-bottom: 40rpx;
  
  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #FF6B35;
  }
}

.status-card, .claim-card {
  background: #1a1a1a;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.label {
  font-size: 28rpx;
  color: #999;
  display: block;
  margin-bottom: 10rpx;
}

.status {
  font-size: 32rpx;
  font-weight: bold;
  
  &.disconnected {
    color: #ff4444;
  }
  
  &.connected {
    color: #44ff44;
  }
}

.url {
  font-size: 24rpx;
  color: #fff;
  word-break: break-all;
  margin-bottom: 20rpx;
}

.actions {
  margin-bottom: 40rpx;
}

.btn-primary {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
  border: none;
  border-radius: 44rpx;
  color: #fff;
  font-size: 32rpx;
  margin-bottom: 20rpx;
  
  &:disabled {
    opacity: 0.5;
  }
}

.btn-copy {
  width: 200rpx;
  height: 60rpx;
  background: #333;
  border: none;
  border-radius: 30rpx;
  color: #fff;
  font-size: 24rpx;
}

.section-title {
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.asset-item {
  background: #1a1a1a;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.asset-type {
  font-size: 24rpx;
  color: #FF6B35;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.asset-summary {
  font-size: 26rpx;
  color: #ccc;
  line-height: 1.5;
  margin-bottom: 10rpx;
}

.asset-score {
  font-size: 24rpx;
  color: #44ff44;
}
</style>
