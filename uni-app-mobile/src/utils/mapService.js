import { mapApi } from '../api/map.js'

class MapService {
  constructor() {
    this.currentLocation = null
    this.isLocationAuthorized = false
  }

  async init() {
    try {
      const res = await uni.getLocationSetting()
      this.isLocationAuthorized = res.authSetting['scope.userLocation'] === true

      if (!this.isLocationAuthorized) {
        await this.requestLocationPermission()
      }
    } catch (error) {
      console.error('Failed to init map service:', error)
    }
  }

  async requestLocationPermission() {
    try {
      const res = await uni.authorize({
        scope: 'scope.userLocation'
      })

      if (res.authSetting['scope.userLocation'] === false) {
        uni.showModal({
          title: '需要位置权限',
          content: '地图功能需要获取您的位置信息，请在设置中开启位置权限',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) {
              uni.openSetting()
            }
          }
        })
      } else {
        this.isLocationAuthorized = true
      }
    } catch (error) {
      console.error('Failed to request location permission:', error)
    }
  }

  async getCurrentLocation() {
    try {
      const res = await uni.getLocation({
        type: 'gcj02',
        altitude: true,
        accuracy: true
      })
      this.currentLocation = {
        latitude: res.latitude,
        longitude: res.longitude
      }
      return this.currentLocation
    } catch (error) {
      console.error('Failed to get current location:', error)
      throw error
    }
  }

  async searchLocation(keyword, city = '') {
    try {
      const res = await mapApi.searchLocation(keyword, city)

      if (res.code === 200) {
        return res.data
      }
      throw new Error(res.message || '搜索失败')
    } catch (error) {
      console.error('Failed to search location:', error)
      throw error
    }
  }

  async geocode(address, city = '') {
    try {
      const res = await mapApi.geocode(address, city)

      if (res.code === 200) {
        return res.data
      }
      throw new Error(res.message || '地理编码失败')
    } catch (error) {
      console.error('Failed to geocode:', error)
      throw error
    }
  }

  async reverseGeocode(latitude, longitude) {
    try {
      const res = await mapApi.reverseGeocode(latitude, longitude)

      if (res.code === 200) {
        return res.data
      }
      throw new Error(res.message || '逆地理编码失败')
    } catch (error) {
      console.error('Failed to reverse geocode:', error)
      throw error
    }
  }

  async calculateDistance(fromLat, fromLon, toLat, toLon) {
    try {
      const res = await mapApi.getDistance(fromLat, fromLon, toLat, toLon)

      if (res.code === 200) {
        return res.data.distance
      }
      throw new Error(res.message || '计算距离失败')
    } catch (error) {
      console.error('Failed to calculate distance:', error)
      throw error
    }
  }

  async calculateRoute(fromLat, fromLon, toLat, toLon, mode = 'driving') {
    try {
      const res = await mapApi.calculateRoute(fromLat, fromLon, toLat, toLon, mode)

      if (res.code === 200) {
        return res.data
      }
      throw new Error(res.message || '计算路线失败')
    } catch (error) {
      console.error('Failed to calculate route:', error)
      throw error
    }
  }
}

export default new MapService()
