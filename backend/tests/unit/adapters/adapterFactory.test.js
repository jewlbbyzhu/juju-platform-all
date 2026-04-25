const AdapterFactory = require('../../../src/utils/adapters');
const MiniprogramAdapter = require('../../../src/utils/adapters/miniprogramAdapter');
const AppAdapter = require('../../../src/utils/adapters/appAdapter');
const WebAdapter = require('../../../src/utils/adapters/webAdapter');
const WebsiteAdapter = require('../../../src/utils/adapters/websiteAdapter');

describe('AdapterFactory', () => {
  describe('getAdapter', () => {
    test('should return MiniprogramAdapter for miniprogram client', () => {
      const adapter = AdapterFactory.getAdapter('miniprogram');
      expect(adapter).toBeInstanceOf(MiniprogramAdapter);
    });

    test('should return AppAdapter for app client', () => {
      const adapter = AdapterFactory.getAdapter('app');
      expect(adapter).toBeInstanceOf(AppAdapter);
    });

    test('should return WebAdapter for web client', () => {
      const adapter = AdapterFactory.getAdapter('web');
      expect(adapter).toBeInstanceOf(WebAdapter);
    });

    test('should return WebsiteAdapter for website client', () => {
      const adapter = AdapterFactory.getAdapter('website');
      expect(adapter).toBeInstanceOf(WebsiteAdapter);
    });

    test('should return WebAdapter as default for unknown client', () => {
      const adapter = AdapterFactory.getAdapter('unknown');
      expect(adapter).toBeInstanceOf(WebAdapter);
    });

    test('should return WebAdapter as default for undefined client', () => {
      const adapter = AdapterFactory.getAdapter();
      expect(adapter).toBeInstanceOf(WebAdapter);
    });
  });

  describe('adapter consistency', () => {
    test('all adapters should have adaptResponse method', () => {
      const adapters = [
        AdapterFactory.getAdapter('miniprogram'),
        AdapterFactory.getAdapter('app'),
        AdapterFactory.getAdapter('web'),
        AdapterFactory.getAdapter('website')
      ];

      adapters.forEach(adapter => {
        expect(typeof adapter.adaptResponse).toBe('function');
      });
    });

    test('all adapters should have adaptItem method', () => {
      const adapters = [
        AdapterFactory.getAdapter('miniprogram'),
        AdapterFactory.getAdapter('app'),
        AdapterFactory.getAdapter('web'),
        AdapterFactory.getAdapter('website')
      ];

      adapters.forEach(adapter => {
        expect(typeof adapter.adaptItem).toBe('function');
      });
    });

    test('all adapters should have formatMoney method', () => {
      const adapters = [
        AdapterFactory.getAdapter('miniprogram'),
        AdapterFactory.getAdapter('app'),
        AdapterFactory.getAdapter('web'),
        AdapterFactory.getAdapter('website')
      ];

      adapters.forEach(adapter => {
        expect(typeof adapter.formatMoney).toBe('function');
      });
    });
  });

  describe('adapter behavior differences', () => {
    test('different adapters should handle sensitive fields differently', () => {
      const userData = {
        id: 1,
        nickname: 'John',
        phone: '1234567890',
        wechat_openid: 'openid123',
        admin_notes: 'Admin note'
      };

      const miniprogramAdapter = AdapterFactory.getAdapter('miniprogram');
      const webAdapter = AdapterFactory.getAdapter('web');

      const miniprogramResult = miniprogramAdapter.adaptUser(userData);
      const webResult = webAdapter.adaptUser(userData);

      // 小程序应过滤敏感字段
      expect(miniprogramResult.phone).toBeUndefined();
      expect(miniprogramResult.wechatOpenid).toBeUndefined();

      // Web管理后台应保留所有字段
      expect(webResult.phone).toBe('1234567890');
      expect(webResult.wechatOpenid).toBe('openid123');
    });

    test('different adapters should use different field names', () => {
      const partyData = {
        id: 1,
        title: 'Test Party',
        max_participants: 50,
        current_participants: 25,
        price_mode: 1,
        category: 0
      };

      const miniprogramAdapter = AdapterFactory.getAdapter('miniprogram');
      const appAdapter = AdapterFactory.getAdapter('app');

      const miniprogramResult = miniprogramAdapter.adaptParty(partyData);
      const appResult = appAdapter.adaptParty(partyData);

      // 小程序使用简化字段名
      expect(miniprogramResult.maxPeople).toBe(50);
      expect(miniprogramResult.currentPeople).toBe(25);
      expect(miniprogramResult.priceType).toBe(1);
      expect(miniprogramResult.theme).toBe(0);

      // App使用标准字段名
      expect(appResult.maxParticipants).toBe(50);
      expect(appResult.currentParticipants).toBe(25);
      expect(appResult.priceMode).toBe(1);
      expect(appResult.category).toBe(0);
    });
  });
});