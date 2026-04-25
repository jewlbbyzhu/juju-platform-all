export function debounce(func, wait = 300) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function throttle(func, limit = 300) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export function formatDate(timestamp, format = 'YYYY-MM-DD HH:mm:ss') {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

export function formatRelativeTime(timestamp) {
  const now = Date.now()
  const diff = now - timestamp
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`
  } else if (diff < month) {
    return `${Math.floor(diff / week)}周前`
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`
  } else {
    return `${Math.floor(diff / year)}年前`
  }
}

export function formatNumber(num) {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(2) + '亿'
  } else if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

export function formatMoney(amount) {
  if (amount >= 100000000) {
    return (amount / 100000000).toFixed(2) + '亿'
  } else if (amount >= 10000) {
    return (amount / 10000).toFixed(2) + '万'
  }
  return amount.toFixed(2)
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item))
  }
  
  if (obj instanceof Object) {
    const clonedObj = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone) {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

export function isValidUrl(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function truncateText(text, maxLength = 50) {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function retry(fn, maxRetries = 3, delay = 1000) {
  return new Promise((resolve, reject) => {
    let retries = 0
    
    const attempt = () => {
      fn()
        .then(resolve)
        .catch(error => {
          retries++
          if (retries < maxRetries) {
            setTimeout(attempt, delay)
          } else {
            reject(error)
          }
        })
    }
    
    attempt()
  })
}

export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = item[key]
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {})
}

export function sortBy(array, key, order = 'asc') {
  return [...array].sort((a, b) => {
    const aValue = a[key]
    const bValue = b[key]
    
    if (order === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })
}

export function unique(array, key) {
  const seen = new Set()
  return array.filter(item => {
    const value = key ? item[key] : item
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

export function chunk(array, size) {
  const result = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

export function pick(obj, keys) {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
    return result
  }, {})
}

export function omit(obj, keys) {
  const result = { ...obj }
  keys.forEach(key => {
    delete result[key]
  })
  return result
}
