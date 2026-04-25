const BaseAdapter = require('../../../src/utils/adapters/baseAdapter');

describe('BaseAdapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new BaseAdapter();
  });

  describe('formatMoney', () => {
    test('should convert fen to yuan with 2 decimal places', () => {
      expect(adapter.formatMoney(12345)).toBe('123.45');
      expect(adapter.formatMoney(100)).toBe('1.00');
      expect(adapter.formatMoney(0)).toBe('0.00');
    });

    test('should handle null and undefined values', () => {
      expect(adapter.formatMoney(null)).toBe('0.00');
      expect(adapter.formatMoney(undefined)).toBe('0.00');
    });
  });

  describe('formatTime', () => {
    test('should format date with default format', () => {
      const date = new Date('2024-01-15T10:30:45Z');
      const result = adapter.formatTime(date);
      expect(result).toMatch(/2024-01-15 \d{2}:30:45/);
    });

    test('should format date with custom format', () => {
      const date = new Date('2024-01-15T10:30:45Z');
      const result = adapter.formatTime(date, 'YYYY-MM-DD');
      expect(result).toMatch(/2024-01-15/);
    });

    test('should handle empty date', () => {
      expect(adapter.formatTime(null)).toBe('');
      expect(adapter.formatTime(undefined)).toBe('');
    });
  });

  describe('toCamelCase', () => {
    test('should convert snake_case to camelCase', () => {
      expect(adapter.toCamelCase('user_id')).toBe('userId');
      expect(adapter.toCamelCase('party_start_time')).toBe('partyStartTime');
      expect(adapter.toCamelCase('simple')).toBe('simple');
    });
  });

  describe('toSnakeCase', () => {
    test('should convert camelCase to snake_case', () => {
      expect(adapter.toSnakeCase('userId')).toBe('user_id');
      expect(adapter.toSnakeCase('partyStartTime')).toBe('party_start_time');
      expect(adapter.toSnakeCase('simple')).toBe('simple');
    });
  });

  describe('convertObjectKeys', () => {
    test('should convert object keys using converter function', () => {
      const obj = {
        user_id: 1,
        party_name: 'Test Party',
        start_time: '2024-01-15'
      };
      
      const result = adapter.convertObjectKeys(obj, adapter.toCamelCase.bind(adapter));
      
      expect(result).toEqual({
        userId: 1,
        partyName: 'Test Party',
        startTime: '2024-01-15'
      });
    });

    test('should handle nested objects', () => {
      const obj = {
        user_info: {
          user_id: 1,
          user_name: 'John'
        },
        party_list: [
          { party_id: 1, party_name: 'Party 1' }
        ]
      };
      
      const result = adapter.convertObjectKeys(obj, adapter.toCamelCase.bind(adapter));
      
      expect(result.userInfo.userId).toBe(1);
      expect(result.userInfo.userName).toBe('John');
      expect(result.partyList[0].partyId).toBe(1);
    });

    test('should handle non-object values', () => {
      expect(adapter.convertObjectKeys(null, adapter.toCamelCase.bind(adapter))).toBe(null);
      expect(adapter.convertObjectKeys('string', adapter.toCamelCase.bind(adapter))).toBe('string');
      expect(adapter.convertObjectKeys(123, adapter.toCamelCase.bind(adapter))).toBe(123);
    });
  });

  describe('filterSensitiveFields', () => {
    test('should remove sensitive fields from object', () => {
      const obj = {
        id: 1,
        name: 'John',
        phone: '1234567890',
        password: 'secret'
      };
      
      const result = adapter.filterSensitiveFields(obj, ['phone', 'password']);
      
      expect(result).toEqual({
        id: 1,
        name: 'John'
      });
    });

    test('should handle empty sensitive fields array', () => {
      const obj = { id: 1, name: 'John' };
      const result = adapter.filterSensitiveFields(obj, []);
      
      expect(result).toEqual(obj);
    });
  });

  describe('adaptUser', () => {
    test('should adapt user data with basic fields', () => {
      const user = {
        id: 1,
        nickname: 'John',
        avatar: 'avatar.jpg',
        gender: 1,
        is_vip: true,
        vip_expires_at: '2024-12-31T23:59:59Z',
        created_at: '2024-01-01T00:00:00Z'
      };
      
      const result = adapter.adaptUser(user);
      
      expect(result).toMatchObject({
        id: 1,
        nickname: 'John',
        avatar: 'avatar.jpg',
        gender: 1,
        isVip: true,
        vipExpiresAt: expect.any(String),
        createdAt: expect.any(String)
      });
    });

    test('should handle null user', () => {
      expect(adapter.adaptUser(null)).toBe(null);
    });
  });

  describe('adaptPagination', () => {
    test('should adapt pagination data correctly', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const pagination = {
        page: 2,
        pageSize: 10,
        total: 25
      };
      
      const result = adapter.adaptPagination(data, pagination);
      
      expect(result).toMatchObject({
        items: expect.any(Array),
        pagination: {
          page: 2,
          pageSize: 10,
          total: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: true
        }
      });
    });

    test('should handle first page', () => {
      const data = [];
      const pagination = { page: 1, pageSize: 10, total: 5 };
      
      const result = adapter.adaptPagination(data, pagination);
      
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(false);
    });
  });
});