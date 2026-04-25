import '@testing-library/jest-dom'

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds = []

  disconnect() {}

  observe() {}

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }

  unobserve() {}
}

if (!('IntersectionObserver' in globalThis)) {
  globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
}
