import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'juju_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5分钟

interface CacheItem<T> {
  value: T;
  expiry: number;
}

export const cache = {
  // 设置缓存
  async set<T>(key: string, value: T, ttl: number = DEFAULT_TTL): Promise<void> {
    const item: CacheItem<T> = {
      value,
      expiry: Date.now() + ttl,
    };
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
  },

  // 获取缓存
  async get<T>(key: string): Promise<T | null> {
    const data = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!data) return null;

    try {
      const item: CacheItem<T> = JSON.parse(data);
      if (Date.now() > item.expiry) {
        await this.remove(key);
        return null;
      }
      return item.value;
    } catch {
      return null;
    }
  },

  // 检查缓存是否存在
  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  },

  // 删除缓存
  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(CACHE_PREFIX + key);
  },

  // 清空所有缓存
  async clear(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  },

  // 获取所有缓存键
  async keys(): Promise<string[]> {
    const keys = await AsyncStorage.getAllKeys();
    return keys
      .filter((key) => key.startsWith(CACHE_PREFIX))
      .map((key) => key.replace(CACHE_PREFIX, ''));
  },
};

export default cache;
