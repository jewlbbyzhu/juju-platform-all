class RequestQueue {
  constructor(maxConcurrent = 5) {
    this.maxConcurrent = maxConcurrent
    this.queue = []
    this.activeRequests = 0
    this.pendingRequests = new Map()
  }

  async request(key, fn) {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)
    }

    const promise = this._execute(key, fn)
    this.pendingRequests.set(key, promise)
    
    try {
      return await promise
    } finally {
      this.pendingRequests.delete(key)
    }
  }

  async _execute(key, fn) {
    if (this.activeRequests >= this.maxConcurrent) {
      await new Promise(resolve => {
        this.queue.push(resolve)
      })
    }

    this.activeRequests++
    
    try {
      return await fn()
    } finally {
      this.activeRequests--
      if (this.queue.length > 0) {
        const next = this.queue.shift()
        next()
      }
    }
  }

  clear() {
    this.queue = []
    this.pendingRequests.clear()
  }

  getQueueLength() {
    return this.queue.length
  }

  getActiveRequests() {
    return this.activeRequests
  }
}

const requestQueue = new RequestQueue()

export default requestQueue
