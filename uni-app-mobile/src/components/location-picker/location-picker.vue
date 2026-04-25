<template>
  <view class="location-picker" v-if="visible" @tap="handleClose">
    <view class="picker-content" @tap.stop>
      <view class="picker-header">
        <text class="picker-title">选择位置</text>
        <view class="close-btn" @tap="handleClose">
          <text class="close-icon">×</text>
        </view>
      </view>

      <view class="search-bar">
        <input 
          class="search-input" 
          v-model="searchKeyword" 
          placeholder="搜索地址"
          @input="onSearchInput"
        />
        <button class="search-btn" @tap="handleSearch">
          <text>搜索</text>
        </button>
      </view>

      <view class="map-container">
        <map
          id="location-map"
          class="map"
          :latitude="mapCenter.latitude"
          :longitude="mapCenter.longitude"
          :markers="markers"
          :scale="16"
          @tap="onMapTap"
          @markertap="onMarkerTap"
          show-location
          @regionchange="onRegionChange"
        >
          <cover-view class="map-tip">
            <text class="tip-text">点击地图选择位置</text>
          </cover-view>
        </map>
      </view>

      <view class="selected-location" v-if="selectedLocation">
        <view class="location-info">
          <text class="info-icon">📍</text>
          <view class="info-content">
            <text class="info-name">{{ selectedLocation.name || selectedLocation.address }}</text>
            <text class="info-address">{{ selectedLocation.address }}</text>
          </view>
        </view>
        <button class="confirm-btn" @tap="handleConfirm">
          <text>确认位置</text>
        </button>
      </view>

      <scroll-view class="search-results" scroll-y v-if="searchResults.length > 0">
        <view 
          class="result-item" 
          v-for="(item, index) in searchResults" 
          :key="index"
          @tap="selectSearchResult(item)"
        >
          <text class="result-name">{{ item.name }}</text>
          <text class="result-address">{{ item.address }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'LocationPicker',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    initialLocation: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      mapCenter: {
        latitude: 39.9042,
        longitude: 116.4074
      },
      markers: [],
      selectedLocation: null,
      searchKeyword: '',
      searchResults: [],
      mapContext: null
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.initMap()
      }
    },
    initialLocation: {
      handler(newVal) {
        if (newVal && newVal.latitude && newVal.longitude) {
          this.mapCenter = {
            latitude: newVal.latitude,
            longitude: newVal.longitude
          }
          this.selectedLocation = newVal
          this.markers = [{
            id: 1,
            latitude: newVal.latitude,
            longitude: newVal.longitude,
            iconPath: '/static/marker.png',
            width: 30,
            height: 30
          }]
        }
      }
    },
      immediate: true,
      deep: true
    }
  },
  methods: {
    initMap() {
      uni.getLocation({
        type: 'wgs84',
        success: (res) => {
          this.mapCenter = {
            latitude: res.latitude,
            longitude: res.longitude
          }
        },
        fail: () => {
          console.log('获取位置失败，使用默认位置')
        }
      })
    },

    onMapTap(e) {
      const { latitude, longitude } = e.detail
      this.updateMarker(latitude, longitude)
      this.reverseGeocode(latitude, longitude)
    },

    onMarkerTap(e) {
      console.log('Marker tapped:', e.detail.markerId)
    },

    onRegionChange(e) {
      console.log('Region changed:', e.detail)
    },

    updateMarker(latitude, longitude) {
      this.markers = [{
        id: 1,
        latitude: latitude,
        longitude: longitude,
        iconPath: '/static/marker.png',
        width: 30,
        height: 30
      }]
      this.selectedLocation = {
        latitude: latitude,
        longitude: longitude,
        address: ''
      }
    },

    async reverseGeocode(latitude, longitude) {
      try {
        const res = await uni.request({
          url: 'https://apis.map.qq.com/ws/geocoder/v1/',
          data: {
            location: `${longitude},${latitude}`,
            key: 'YOUR_QQ_MAP_KEY',
            get_poi: 1
          }
        })

        if (res.data && res.data.result && res.data.result.address) {
          const address = res.data.result.address
          this.selectedLocation = {
            ...this.selectedLocation,
            address: address.address,
            city: address.city,
            district: address.district
          }
        }
      } catch (error) {
        console.error('逆地理编码失败:', error)
      }
    },

    async onSearchInput(e) {
      const keyword = e.detail.value
      if (!keyword || keyword.length < 2) {
        this.searchResults = []
        return
      }

      try {
        const res = await uni.request({
          url: 'https://apis.map.qq.com/ws/place/v1/search',
          data: {
            keyword: keyword,
            key: 'YOUR_QQ_MAP_KEY',
            boundary: 'region(39.9042,116.4074,39.9142,116.4174)'
          }
        })

        if (res.data && res.data.data) {
          this.searchResults = res.data.data.map(item => ({
            name: item.title,
            address: item.address,
            location: item.location,
            latlng: item.latlng
          }))
        }
      } catch (error) {
        console.error('搜索失败:', error)
      }
    },

    handleSearch() {
      if (this.searchKeyword) {
        this.onSearchInput({ detail: { value: this.searchKeyword } })
      }
    },

    selectSearchResult(item) {
      this.mapCenter = {
        latitude: item.latlng.lat,
        longitude: item.latlng.lng
      }
      this.updateMarker(item.latlng.lat, item.latlng.lng)
      this.selectedLocation = {
        ...item,
        latitude: item.latlng.lat,
        longitude: item.latlng.lng
      }
      this.searchResults = []
    },

    handleConfirm() {
      if (this.selectedLocation) {
        this.$emit('confirm', this.selectedLocation)
        this.handleClose()
      } else {
        uni.showToast({
          title: '请先选择位置',
          icon: 'none'
        })
      }
    },

    handleClose() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.location-picker {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.picker-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  background: #ffffff;
}

.picker-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f5f5f5;
}

.close-icon {
  font-size: 48rpx;
  color: #999999;
  line-height: 1;
}

.search-bar {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 30rpx;
  background: #f8f9fa;
  border-bottom: 1rpx solid #f0f0f0;
}

.search-input {
  flex: 1;
  height: 70rpx;
  background: #ffffff;
  border-radius: 12rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  border: 1rpx solid #e0e0e0;
}

.search-btn {
  padding: 0 40rpx;
  height: 70rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #ffffff;
  font-weight: bold;
}

.map-container {
  flex: 1;
  position: relative;
}

.map {
  width: 100%;
  height: 100%;
}

.map-tip {
  position: absolute;
  top: 20rpx;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  padding: 20rpx 40rpx;
  border-radius: 50rpx;
}

.tip-text {
  font-size: 24rpx;
  color: #ffffff;
}

.selected-location {
  padding: 30rpx;
  background: #f8f9fa;
  border-top: 1rpx solid #f0f0f0;
}

.location-info {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.info-icon {
  font-size: 48rpx;
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.info-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.info-address {
  font-size: 24rpx;
  color: #666666;
}

.confirm-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12rpx;
  font-size: 32rpx;
  color: #ffffff;
  font-weight: bold;
}

.search-results {
  position: absolute;
  top: 140rpx;
  left: 30rpx;
  right: 30rpx;
  max-height: 400rpx;
  background: #ffffff;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.result-item {
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #f5f5f5;
  }
}

.result-name {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
}

.result-address {
  display: block;
  font-size: 24rpx;
  color: #666666;
}
</style>