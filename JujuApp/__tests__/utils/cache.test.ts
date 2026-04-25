import { cache } from '../../src/utils/cache';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
}));

describe('cache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('set', () => {
    it('should set cache with default TTL', async () => {
      const cacheData = { name: 'test' };
      await cache.set('key1', cacheData);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'juju_cache_key1',
        expect.stringContaining('"value":{"name":"test"}')
      );
    });

    it('should set cache with custom TTL', async () => {
      const cacheData = { data: 'value' };
      const customTTL = 10 * 60 * 1000; // 10 minutes
      await cache.set('key2', cacheData, customTTL);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'juju_cache_key2',
        expect.any(String)
      );
    });

    it('should set cache with string value', async () => {
      await cache.set('stringKey', 'string value');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'juju_cache_stringKey',
        expect.stringContaining('"value":"string value"')
      );
    });

    it('should set cache with number value', async () => {
      await cache.set('numberKey', 12345);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'juju_cache_numberKey',
        expect.stringContaining('"value":12345')
      );
    });

    it('should set cache with array value', async () => {
      const arr = [1, 2, 3];
      await cache.set('arrayKey', arr);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'juju_cache_arrayKey',
        expect.stringContaining('"value":[1,2,3]')
      );
    });
  });

  describe('get', () => {
    it('should get cached value', async () => {
      const cacheItem = {
        value: { name: 'test' },
        expiry: Date.now() + 5 * 60 * 1000,
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cacheItem));

      const result = await cache.get('key1');

      expect(result).toEqual({ name: 'test' });
    });

    it('should return null for non-existent key', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await cache.get('nonexistent');

      expect(result).toBeNull();
    });

    it('should return null and remove expired cache', async () => {
      const expiredItem = {
        value: { name: 'test' },
        expiry: Date.now() - 1000, // expired
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(expiredItem));

      const result = await cache.get('expiredKey');

      expect(result).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('juju_cache_expiredKey');
    });

    it('should handle invalid JSON', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      const result = await cache.get('invalidKey');

      expect(result).toBeNull();
    });

    it('should get string value', async () => {
      const cacheItem = {
        value: 'cached string',
        expiry: Date.now() + 5 * 60 * 1000,
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cacheItem));

      const result = await cache.get('stringKey');

      expect(result).toBe('cached string');
    });

    it('should get number value', async () => {
      const cacheItem = {
        value: 42,
        expiry: Date.now() + 5 * 60 * 1000,
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cacheItem));

      const result = await cache.get('numberKey');

      expect(result).toBe(42);
    });
  });

  describe('has', () => {
    it('should return true for existing cache', async () => {
      const cacheItem = {
        value: { test: true },
        expiry: Date.now() + 5 * 60 * 1000,
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cacheItem));

      const result = await cache.has('existingKey');

      expect(result).toBe(true);
    });

    it('should return false for non-existent cache', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await cache.has('nonexistent');

      expect(result).toBe(false);
    });

    it('should return false for expired cache', async () => {
      const expiredItem = {
        value: { test: true },
        expiry: Date.now() - 1000,
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(expiredItem));

      const result = await cache.has('expiredKey');

      expect(result).toBe(false);
    });
  });

  describe('remove', () => {
    it('should remove cache item', async () => {
      await cache.remove('keyToRemove');

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('juju_cache_keyToRemove');
    });
  });

  describe('clear', () => {
    it('should clear all cache items', async () => {
      const allKeys = [
        'juju_cache_key1',
        'juju_cache_key2',
        'other_key',
        'juju_cache_key3',
      ];
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(allKeys);

      await cache.clear();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        'juju_cache_key1',
        'juju_cache_key2',
        'juju_cache_key3',
      ]);
    });

    it('should handle empty cache', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(['other_key']);

      await cache.clear();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([]);
    });

    it('should clear all cache keys when all are cache keys', async () => {
      const allKeys = ['juju_cache_a', 'juju_cache_b', 'juju_cache_c'];
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(allKeys);

      await cache.clear();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(allKeys);
    });
  });

  describe('keys', () => {
    it('should return all cache keys without prefix', async () => {
      const allKeys = [
        'juju_cache_key1',
        'juju_cache_key2',
        'other_key',
        'juju_cache_key3',
      ];
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(allKeys);

      const result = await cache.keys();

      expect(result).toEqual(['key1', 'key2', 'key3']);
    });

    it('should return empty array when no cache keys', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(['other_key1', 'other_key2']);

      const result = await cache.keys();

      expect(result).toEqual([]);
    });
  });
});
