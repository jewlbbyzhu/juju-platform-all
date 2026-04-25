import request from '../utils/request.js'

export const mapApi = {
  searchLocation(keyword, city) {
    return request.get('/api/v1/map/search', { keyword, city })
  },

  geocode(address, city) {
    return request.get('/api/v1/map/geocode', { address, city })
  },

  reverseGeocode(latitude, longitude) {
    return request.get('/api/v1/map/reverse-geocode', { latitude, longitude })
  },

  getDistance(fromLat, fromLon, toLat, toLon) {
    return request.get('/api/v1/map/distance', { fromLat, fromLon, toLat, toLon })
  },

  calculateRoute(fromLat, fromLon, toLat, toLon, mode = 'driving') {
    return request.get('/api/v1/map/route', { fromLat, fromLon, toLat, toLon, mode })
  }
}
