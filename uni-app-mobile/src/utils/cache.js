class Cache {
  constructor() {
    this.cache = new Map()
    this.ttlMap = new Map()
  }

  set(key, value, ttl = 5 * 60 * 1000) {
    this.cache.set(key, value)
    if (ttl > 0) {
      this.ttlMap.set(key, Date.now() + ttl)
    }
  }

  get(key) {
    if (!this.cache.has(key)) {
      return null
    }

    const ttl = this.ttlMap.get(key)
    if (ttl && Date.now() > ttl) {
      this.delete(key)
      return null
    }

    return this.cache.get(key)
  }

  has(key) {
    if (!this.cache.has(key)) {
      return false
    }

    const ttl = this.ttlMap.get(key)
    if (ttl && Date.now() > ttl) {
      this.delete(key)
      return false
    }

    return true
  }

  delete(key) {
    this.cache.delete(key)
    this.ttlMap.delete(key)
  }

  clear() {
    this.cache.clear()
    this.ttlMap.clear()
  }

  size() {
    return this.cache.size
  }

  keys() {
    return Array.from(this.cache.keys())
  }

  values() {
    return Array.from(this.cache.values())
  }

  entries() {
    return Array.from(this.cache.entries())
  }

  cleanup() {
    const now = Date.now()
    for (const [key, ttl] of this.ttlMap.entries()) {
      if (ttl && now > ttl) {
        this.delete(key)
      }
    }
  }
}

const cache = new Cache()

setInterval(() => {
  cache.cleanup()
}, 60 * 1000)

export default cache
