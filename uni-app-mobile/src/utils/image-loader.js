class ImageLoader {
  constructor() {
    this.observer = null
    this.loadedImages = new Set()
    this.initObserver()
  }

  initObserver() {
    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target
              this.loadImage(img)
              this.observer.unobserve(img)
            }
          })
        },
        {
          rootMargin: '100px',
          threshold: 0.1
        }
      )
    }
  }

  observe(img) {
    if (this.loadedImages.has(img.src)) {
      return
    }

    if (this.observer) {
      this.observer.observe(img)
    } else {
      this.loadImage(img)
    }
  }

  unobserve(img) {
    if (this.observer) {
      this.observer.unobserve(img)
    }
  }

  loadImage(img) {
    const src = img.dataset.src || img.src
    if (!src) {
      return
    }

    if (this.loadedImages.has(src)) {
      img.src = src
      return
    }

    const tempImg = new Image()
    tempImg.onload = () => {
      img.src = src
      img.classList.add('loaded')
      this.loadedImages.add(src)
    }
    tempImg.onerror = () => {
      img.classList.add('error')
    }
    tempImg.src = src
  }

  preload(urls) {
    urls.forEach(url => {
      if (!this.loadedImages.has(url)) {
        const img = new Image()
        img.onload = () => {
          this.loadedImages.add(url)
        }
        img.src = url
      }
    })
  }

  clear() {
    this.loadedImages.clear()
  }
}

const imageLoader = new ImageLoader()

export default imageLoader
