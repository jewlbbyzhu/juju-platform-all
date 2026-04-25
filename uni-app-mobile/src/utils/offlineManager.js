const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  PARTIES_CACHE: 'partiesCache',
  PARTY_DETAIL_CACHE: 'partyDetailCache',
  ORDERS_CACHE: 'ordersCache',
  TICKETS_CACHE: 'ticketsCache',
  WALLET_CACHE: 'walletCache',
  NOTIFICATIONS_CACHE: 'notificationsCache',
  LAST_SYNC_TIME: 'lastSyncTime'
}

class OfflineManager {
  static isOnline() {
    return uni.getNetworkType() !== 'none'
  }

  static async get(key, defaultValue = null) {
    try {
      const value = uni.getStorageSync(key)
      return value !== '' ? JSON.parse(value) : defaultValue
    } catch (error) {
      console.error('Get storage error:', error)
      return defaultValue
    }
  }

  static async set(key, value) {
    try {
      uni.setStorageSync(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Set storage error:', error)
      return false
    }
  }

  static async remove(key) {
    try {
      uni.removeStorageSync(key)
      return true
    } catch (error) {
      console.error('Remove storage error:', error)
      return false
    }
  }

  static async clear() {
    try {
      uni.clearStorageSync()
      return true
    } catch (error) {
      console.error('Clear storage error:', error)
      return false
    }
  }

  static async cacheParties(parties) {
    const cacheData = {
      data: parties,
      timestamp: Date.now()
    }
    await this.set(STORAGE_KEYS.PARTIES_CACHE, cacheData)
  }

  static async getCachedParties() {
    const cacheData = await this.get(STORAGE_KEYS.PARTIES_CACHE)
    if (cacheData && this.isCacheValid(cacheData.timestamp)) {
      return cacheData.data
    }
    return null
  }

  static async cachePartyDetail(partyId, party) {
    const cache = await this.get(STORAGE_KEYS.PARTY_DETAIL_CACHE) || {}
    cache[partyId] = {
      data: party,
      timestamp: Date.now()
    }
    await this.set(STORAGE_KEYS.PARTY_DETAIL_CACHE, cache)
  }

  static async getCachedPartyDetail(partyId) {
    const cache = await this.get(STORAGE_KEYS.PARTY_DETAIL_CACHE)
    if (cache && cache[partyId] && this.isCacheValid(cache[partyId].timestamp)) {
      return cache[partyId].data
    }
    return null
  }

  static async cacheOrders(orders) {
    const cacheData = {
      data: orders,
      timestamp: Date.now()
    }
    await this.set(STORAGE_KEYS.ORDERS_CACHE, cacheData)
  }

  static async getCachedOrders() {
    const cacheData = await this.get(STORAGE_KEYS.ORDERS_CACHE)
    if (cacheData && this.isCacheValid(cacheData.timestamp)) {
      return cacheData.data
    }
    return null
  }

  static async cacheTickets(tickets) {
    const cacheData = {
      data: tickets,
      timestamp: Date.now()
    }
    await this.set(STORAGE_KEYS.TICKETS_CACHE, cacheData)
  }

  static async getCachedTickets() {
    const cacheData = await this.get(STORAGE_KEYS.TICKETS_CACHE)
    if (cacheData && this.isCacheValid(cacheData.timestamp)) {
      return cacheData.data
    }
    return null
  }

  static async cacheWallet(wallet) {
    const cacheData = {
      data: wallet,
      timestamp: Date.now()
    }
    await this.set(STORAGE_KEYS.WALLET_CACHE, cacheData)
  }

  static async getCachedWallet() {
    const cacheData = await this.get(STORAGE_KEYS.WALLET_CACHE)
    if (cacheData && this.isCacheValid(cacheData.timestamp)) {
      return cacheData.data
    }
    return null
  }

  static async cacheNotifications(notifications) {
    const cacheData = {
      data: notifications,
      timestamp: Date.now()
    }
    await this.set(STORAGE_KEYS.NOTIFICATIONS_CACHE, cacheData)
  }

  static async getCachedNotifications() {
    const cacheData = await this.get(STORAGE_KEYS.NOTIFICATIONS_CACHE)
    if (cacheData && this.isCacheValid(cacheData.timestamp)) {
      return cacheData.data
    }
    return null
  }

  static isCacheValid(timestamp) {
    const CACHE_DURATION = 30 * 60 * 1000
    const now = Date.now()
    return now - timestamp < CACHE_DURATION
  }

  static async updateLastSyncTime() {
    await this.set(STORAGE_KEYS.LAST_SYNC_TIME, Date.now())
  }

  static async getLastSyncTime() {
    return await this.get(STORAGE_KEYS.LAST_SYNC_TIME)
  }

  static async clearCache() {
    await this.remove(STORAGE_KEYS.PARTIES_CACHE)
    await this.remove(STORAGE_KEYS.PARTY_DETAIL_CACHE)
    await this.remove(STORAGE_KEYS.ORDERS_CACHE)
    await this.remove(STORAGE_KEYS.TICKETS_CACHE)
    await this.remove(STORAGE_KEYS.WALLET_CACHE)
    await this.remove(STORAGE_KEYS.NOTIFICATIONS_CACHE)
  }

  static onNetworkStatusChange(callback) {
    uni.onNetworkStatusChange((res) => {
      callback({
        isConnected: res.isConnected,
        networkType: res.networkType
      })
    })
  }
}

export default OfflineManager
export { STORAGE_KEYS }
