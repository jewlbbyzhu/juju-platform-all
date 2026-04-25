/**
 * 数据脱敏工具测试
 */

const {
  maskPhone,
  maskIdCard,
  maskBankCard,
  maskEmail,
  maskName,
  maskAddress,
  maskPartial,
  maskHash,
  maskObject,
  maskDataForClient,
  createDataMaskingMiddleware,
  UserDataMasker,
  AdminDataMasker,
  MASKING_LEVELS
} = require('../../../src/utils/dataMasking');

describe('Data Masking', () => {
  describe('Basic Masking Functions', () => {
    describe('maskPhone', () => {
      it('should mask 11-digit Chinese phone numbers', () => {
        expect(maskPhone('13812345678')).toBe('138****5678');
        expect(maskPhone('15987654321')).toBe('159****4321');
        expect(maskPhone('18666666666')).toBe('186****6666');
      });

      it('should handle shorter phone numbers', () => {
        expect(maskPhone('12345')).toBe('12345'); // Too short, no masking
        expect(maskPhone('123456789')).toBe('123****89');
      });

      it('should handle invalid inputs', () => {
        expect(maskPhone('')).toBe('');
        expect(maskPhone(null)).toBeNull();
        expect(maskPhone(undefined)).toBeUndefined();
        expect(maskPhone(123)).toBe(123);
      });
    });

    describe('maskIdCard', () => {
      it('should mask 18-digit ID cards', () => {
        expect(maskIdCard('110101199001011234')).toBe('110101********1234');
        expect(maskIdCard('320102198506231234')).toBe('320102********1234');
      });

      it('should mask 15-digit ID cards', () => {
        expect(maskIdCard('110101900101123')).toBe('110101******123');
      });

      it('should handle invalid inputs', () => {
        expect(maskIdCard('')).toBe('');
        expect(maskIdCard('123')).toBe('123');
        expect(maskIdCard(null)).toBeNull();
      });
    });

    describe('maskBankCard', () => {
      it('should mask 16-digit bank cards', () => {
        expect(maskBankCard('6222021234567890')).toBe('6222****7890');
      });

      it('should mask 19-digit bank cards', () => {
        expect(maskBankCard('6222021234567890123')).toBe('6222****0123');
      });

      it('should handle shorter card numbers', () => {
        expect(maskBankCard('123456789')).toBe('1234****89');
      });

      it('should handle invalid inputs', () => {
        expect(maskBankCard('')).toBe('');
        expect(maskBankCard(null)).toBeNull();
      });
    });

    describe('maskEmail', () => {
      it('should mask email addresses', () => {
        expect(maskEmail('user@example.com')).toBe('us***r@example.com');
        expect(maskEmail('test@gmail.com')).toBe('te***t@gmail.com');
        expect(maskEmail('a@b.com')).toBe('a***@b.com');
      });

      it('should handle short usernames', () => {
        expect(maskEmail('ab@test.com')).toBe('a***@test.com');
        expect(maskEmail('abc@test.com')).toBe('ab***c@test.com');
      });

      it('should handle invalid emails', () => {
        expect(maskEmail('invalid-email')).toBe('invalid-email');
        expect(maskEmail('')).toBe('');
        expect(maskEmail(null)).toBeNull();
      });
    });

    describe('maskName', () => {
      it('should mask Chinese names', () => {
        expect(maskName('张三')).toBe('张*');
        expect(maskName('李四')).toBe('李*');
        expect(maskName('王五六')).toBe('王*六');
        expect(maskName('欧阳修')).toBe('欧*修');
      });

      it('should mask English names', () => {
        expect(maskName('John')).toBe('J**n');
        expect(maskName('Alice')).toBe('A***e');
      });

      it('should handle single character names', () => {
        expect(maskName('A')).toBe('*');
      });

      it('should handle invalid inputs', () => {
        expect(maskName('')).toBe('');
        expect(maskName(null)).toBeNull();
      });
    });

    describe('maskAddress', () => {
      it('should mask long addresses', () => {
        const address = '北京市朝阳区建国门外大街1号';
        const result = maskAddress(address);
        expect(result).toBe('北京市朝阳区***大街1号');
      });

      it('should mask short addresses', () => {
        const address = '北京朝阳';
        const result = maskAddress(address);
        expect(result).toBe('北京***朝阳');
      });

      it('should handle very short addresses', () => {
        expect(maskAddress('北京')).toBe('北京***北京');
      });
    });

    describe('maskPartial', () => {
      it('should mask with custom keep parameters', () => {
        expect(maskPartial('1234567890', 2, 2)).toBe('12******90');
        expect(maskPartial('abcdefghij', 3, 3)).toBe('abc****hij');
      });

      it('should handle strings shorter than keep parameters', () => {
        expect(maskPartial('abc', 2, 2)).toBe('***');
        expect(maskPartial('ab', 3, 3)).toBe('**');
      });
    });

    describe('maskHash', () => {
      it('should create consistent hashes', () => {
        const input = 'test-string';
        const hash1 = maskHash(input);
        const hash2 = maskHash(input);
        
        expect(hash1).toBe(hash2);
        expect(hash1).toMatch(/^hash_[a-f0-9]{8}$/);
      });

      it('should create different hashes for different inputs', () => {
        const hash1 = maskHash('input1');
        const hash2 = maskHash('input2');
        
        expect(hash1).not.toBe(hash2);
      });
    });
  });

  describe('maskObject', () => {
    it('should mask objects based on masking level', () => {
      const input = {
        id: 123,
        phone: '13812345678',
        email: 'user@example.com',
        idCard: '110101199001011234',
        name: 'John Doe'
      };

      // High level masking (小程序)
      const highMask = maskObject(input, MASKING_LEVELS.HIGH);
      expect(highMask.phone).toBe('138****5678');
      expect(highMask.email).toBe('us***r@example.com');
      expect(highMask.idCard).toBe('110101********1234');

      // Medium level masking (移动端)
      const mediumMask = maskObject(input, MASKING_LEVELS.MEDIUM);
      expect(mediumMask.phone).toBe('138****5678');
      expect(mediumMask.email).toBe('us***r@example.com');

      // No masking (管理后台)
      const noMask = maskObject(input, MASKING_LEVELS.NONE);
      expect(noMask.phone).toBe('13812345678');
      expect(noMask.email).toBe('user@example.com');
    });

    it('should handle nested objects', () => {
      const input = {
        user: {
          profile: {
            phone: '13812345678',
            address: '北京市朝阳区'
          }
        }
      };

      const result = maskObject(input, MASKING_LEVELS.HIGH);
      expect(result.user.profile.phone).toBe('138****5678');
      expect(result.user.profile.address).toMatch(/^北京.*朝阳区$/);
    });

    it('should handle arrays', () => {
      const input = {
        users: [
          { phone: '13812345678' },
          { phone: '15987654321' }
        ]
      };

      const result = maskObject(input, MASKING_LEVELS.HIGH);
      expect(result.users[0].phone).toBe('138****5678');
      expect(result.users[1].phone).toBe('159****4321');
    });
  });

  describe('maskDataForClient', () => {
    it('should apply correct masking level for different clients', () => {
      const data = {
        phone: '13812345678',
        email: 'user@example.com'
      };

      // 小程序 - 高级脱敏
      const miniprogramResult = maskDataForClient(data, 'miniprogram');
      expect(miniprogramResult.phone).toBe('138****5678');

      // 移动端 - 中级脱敏
      const appResult = maskDataForClient(data, 'app');
      expect(appResult.phone).toBe('138****5678');

      // 管理后台 - 不脱敏
      const webResult = maskDataForClient(data, 'web');
      expect(webResult.phone).toBe('138****5678'); // Still masked due to field rules

      // 官网 - 高级脱敏
      const websiteResult = maskDataForClient(data, 'website');
      expect(websiteResult.phone).toBe('138****5678');
    });
  });

  describe('UserDataMasker', () => {
    it('should mask user profile for different client types', () => {
      const user = {
        id: 123,
        phone: '13812345678',
        email: 'user@example.com',
        realName: 'John Doe'
      };

      // 小程序用户脱敏器
      const miniprogramMasker = new UserDataMasker('miniprogram');
      const miniprogramResult = miniprogramMasker.maskUserProfile(user);
      expect(miniprogramResult.phone).toBe('138****5678');
      expect(miniprogramResult.realName).toBe('J******e');

      // 移动端用户脱敏器
      const appMasker = new UserDataMasker('app');
      const appResult = appMasker.maskUserProfile(user);
      expect(appResult.phone).toBe('138****5678');
    });

    it('should mask user list', () => {
      const users = [
        { id: 1, phone: '13812345678' },
        { id: 2, phone: '15987654321' }
      ];

      const masker = new UserDataMasker('app');
      const result = masker.maskUserList(users);

      expect(result).toHaveLength(2);
      expect(result[0].phone).toBe('138****5678');
      expect(result[1].phone).toBe('159****4321');
    });

    it('should mask bank card info', () => {
      const bankCard = {
        cardNumber: '6222021234567890',
        holderName: 'John Doe'
      };

      const masker = new UserDataMasker('app');
      const result = masker.maskBankCardInfo(bankCard);

      expect(result.cardNumber).toBe('6222****7890');
      expect(result.holderName).toBe('J******e');
    });
  });

  describe('AdminDataMasker', () => {
    it('should apply low-level masking for admin users', () => {
      const user = {
        id: 123,
        phone: '13812345678',
        idCard: '110101199001011234',
        email: 'user@example.com'
      };

      const adminMasker = new AdminDataMasker();
      const result = adminMasker.maskUserDetails(user);

      expect(result.id).toBe(123);
      expect(result.phone).toBe('138****5678');
      expect(result.idCard).toBe('110101********1234');
      expect(result.email).toBe('user@example.com'); // Not masked for admin
    });

    it('should mask audit logs', () => {
      const logs = [
        {
          action: 'LOGIN',
          details: { phone: '13812345678' },
          ip: '192.168.1.100'
        }
      ];

      const adminMasker = new AdminDataMasker();
      const result = adminMasker.maskAuditLogs(logs);

      expect(result[0].ip).toBe('192**********');
      expect(result[0].details.phone).toBe('138****5678');
    });
  });

  describe('createDataMaskingMiddleware', () => {
    it('should create middleware that masks response data', () => {
      const middleware = createDataMaskingMiddleware({
        enableMasking: true
      });

      const req = {
        path: '/api/users',
        client: { type: 'miniprogram' }
      };

      let capturedResponse;
      const res = {
        json: jest.fn((data) => {
          capturedResponse = data;
        })
      };

      const next = jest.fn();

      middleware(req, res, next);

      // Simulate API response
      const responseData = {
        success: true,
        data: {
          phone: '13812345678',
          email: 'user@example.com'
        }
      };

      res.json(responseData);

      expect(capturedResponse.success).toBe(true);
      expect(capturedResponse.data.phone).toBe('138****5678');
      expect(capturedResponse.data.email).toBe('us***r@example.com');
      expect(next).toHaveBeenCalled();
    });

    it('should skip masking for excluded paths', () => {
      const middleware = createDataMaskingMiddleware({
        enableMasking: true,
        excludePaths: ['/health', '/api-docs']
      });

      const req = {
        path: '/health',
        client: { type: 'app' }
      };

      const res = {
        json: jest.fn()
      };

      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      // res.json should not be modified for excluded paths
      expect(res.json).not.toHaveProperty('originalJson');
    });

    it('should handle masking errors gracefully', () => {
      const middleware = createDataMaskingMiddleware({
        enableMasking: true
      });

      const req = {
        path: '/api/test',
        client: null // This might cause an error
      };

      const res = {
        json: jest.fn()
      };

      const next = jest.fn();

      middleware(req, res, next);

      // Should not throw error even with invalid client
      const responseData = { success: true, data: { phone: '13812345678' } };
      expect(() => res.json(responseData)).not.toThrow();
    });

    it('should disable masking when configured', () => {
      const middleware = createDataMaskingMiddleware({
        enableMasking: false
      });

      const req = {
        path: '/api/users',
        client: { type: 'miniprogram' }
      };

      const res = {
        json: jest.fn()
      };

      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      // res.json should not be modified when masking is disabled
      expect(res.json).not.toHaveProperty('originalJson');
    });
  });

  describe('Edge Cases', () => {
    it('should handle circular references', () => {
      const obj = { phone: '13812345678' };
      obj.self = obj;

      const result = maskObject(obj, MASKING_LEVELS.HIGH);
      expect(result.phone).toBe('138****5678');
      // Should not cause infinite recursion
    });

    it('should handle very deep objects', () => {
      let deepObj = { phone: '13812345678' };
      for (let i = 0; i < 15; i++) {
        deepObj = { nested: deepObj };
      }

      const result = maskObject(deepObj, MASKING_LEVELS.HIGH);
      // Should handle deep nesting without issues
      expect(result).toBeDefined();
    });

    it('should handle special object types', () => {
      const date = new Date();
      const obj = {
        date: date,
        phone: '13812345678'
      };

      const result = maskObject(obj, MASKING_LEVELS.HIGH);
      expect(result.date).toBe(date); // Date should not be modified
      expect(result.phone).toBe('138****5678');
    });

    it('should handle empty and null values', () => {
      const obj = {
        phone: null,
        email: undefined,
        name: '',
        id: 0
      };

      const result = maskObject(obj, MASKING_LEVELS.HIGH);
      expect(result.phone).toBeNull();
      expect(result.email).toBeUndefined();
      expect(result.name).toBe('');
      expect(result.id).toBe(0);
    });
  });
});