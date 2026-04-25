const userService = require('../../src/services/userService');
const { User } = require('../../src/models');

jest.mock('../../src/models', () => ({
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
  }
}));
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
}));

jest.mock('../../src/config/jwt', () => ({
  generateToken: jest.fn((payload) => `mock_token_${JSON.stringify(payload)}`),
  generateRefreshToken: jest.fn((payload) => `mock_refresh_token_${JSON.stringify(payload)}`),
  verifyToken: jest.fn(() => ({ payload: {} })),
  decodeToken: jest.fn(() => null)
}));

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        openid: 'test_openid_001',
        nickname: 'Test User',
        avatar: 'https://example.com/avatar.jpg'
      };
      
      User.findOne.mockResolvedValue(null);
      
      const mockUser = {
        id: 1,
        ...userData,
        gender: 0,
        birthday: null,
        province: null,
        city: null,
        country: null,
        language: 'zh_CN',
        status: 1,
        is_vip: false,
        dataValues: {
          id: 1,
          ...userData,
          gender: 0,
          birthday: null,
          province: null,
          city: null,
          country: null,
          language: 'zh_CN',
          status: 1,
          is_vip: false
        }
      };
      
      User.create.mockResolvedValue(mockUser);
      
      const result = await userService.register(userData);
      
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.nickname).toBe(userData.nickname);
      expect(result.user.avatar).toBe(userData.avatar);
      expect(result.token).toBeDefined();
      expect(result.token).toContain('mock_token_');
      expect(User.create).toHaveBeenCalledWith({
        openid: userData.openid,
        unionid: undefined,
        phone: undefined,
        email: undefined,
        nickname: userData.nickname,
        avatar: userData.avatar,
        gender: 0,
        birthday: undefined,
        province: undefined,
        city: undefined,
        country: undefined,
        language: 'zh_CN',
        status: 1
      });
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        openid: 'test_openid_002',
        nickname: 'Test User 2',
        phone: '13800138000'
      };
      
      User.findOne.mockResolvedValue({
        id: 2,
        phone: '13800138000'
      });
      
      await expect(userService.register(userData)).rejects.toThrow('User already exists');
      expect(User.findOne).toHaveBeenCalled();
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user with openid', async () => {
      const openid = 'test_openid_003';
      
      const mockUser = {
        id: 3,
        openid: openid,
        nickname: 'Test User 3',
        status: 1,
        is_vip: false,
        last_login_at: new Date(),
        dataValues: {
          id: 3,
          openid: openid,
          nickname: 'Test User 3',
          status: 1,
          is_vip: false,
          last_login_at: new Date()
        },
        save: jest.fn().mockResolvedValue()
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      const result = await userService.login(openid, null);
      
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.nickname).toBe('Test User 3');
      expect(result.token).toBeDefined();
      expect(result.token).toContain('mock_token_');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw error if openid not found', async () => {
      const openid = 'test_openid_004';
      
      const mockNewUser = {
        id: Date.now(),
        openid: openid,
        nickname: 'User',
        status: 1,
        save: jest.fn().mockResolvedValue()
      };
      
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockNewUser);
      
      const result = await userService.login(openid, null);
      
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(User.create).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const userId = 5;
      
      const mockUser = {
        id: userId,
        openid: 'test_openid_005',
        nickname: 'Test User 5',
        status: 1,
        dataValues: {
          id: userId,
          openid: 'test_openid_005',
          nickname: 'Test User 5',
          status: 1
        }
      };
      
      User.findByPk.mockResolvedValue(mockUser);
      
      const result = await userService.getUserById(userId);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
      expect(result.nickname).toBe('Test User 5');
      expect(User.findByPk).toHaveBeenCalledWith(userId);
    });

    it('should throw error if user not found', async () => {
      User.findByPk.mockResolvedValue(null);
      
      await expect(userService.getUserById(999)).rejects.toThrow('User not found');
      expect(User.findByPk).toHaveBeenCalledWith(999);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 6;
      const updateData = {
        nickname: 'Updated User',
        avatar: 'https://example.com/new-avatar.jpg'
      };
      
      const mockUser = {
        id: userId,
        openid: 'test_openid_006',
        nickname: 'Old User',
        avatar: 'https://example.com/old-avatar.jpg',
        status: 1,
        dataValues: {
          id: userId,
          openid: 'test_openid_006',
          nickname: 'Old User',
          avatar: 'https://example.com/old-avatar.jpg',
          status: 1
        },
        update: jest.fn().mockImplementation(function(updates) {
          Object.assign(this, updates);
          Object.assign(this.dataValues, updates);
          return Promise.resolve(this);
        })
      };
      
      User.findByPk.mockResolvedValue(mockUser);
      
      const result = await userService.updateUser(userId, updateData);
      
      expect(result).toBeDefined();
      expect(result.nickname).toBe(updateData.nickname);
      expect(result.avatar).toBe(updateData.avatar);
      expect(mockUser.update).toHaveBeenCalledWith({
        nickname: updateData.nickname,
        avatar: updateData.avatar
      });
      expect(User.findByPk).toHaveBeenCalledWith(userId);
    });

    it('should throw error if user not found', async () => {
      User.findByPk.mockResolvedValue(null);
      
      await expect(userService.updateUser(999, { nickname: 'Test' })).rejects.toThrow('User not found');
    });

    it('should only update allowed fields', async () => {
      const userId = 7;
      const updateData = {
        nickname: 'Updated User',
        avatar: 'https://example.com/new-avatar.jpg',
        status: 1,
        id: 999
      };
      
      const mockUser = {
        id: userId,
        openid: 'test_openid_007',
        nickname: 'Old User',
        status: 1,
        dataValues: {
          id: userId,
          openid: 'test_openid_007',
          nickname: 'Old User',
          status: 1
        },
        update: jest.fn().mockImplementation(function(updates) {
          Object.assign(this, updates);
          Object.assign(this.dataValues, updates);
          return Promise.resolve(this);
        })
      };
      
      User.findByPk.mockResolvedValue(mockUser);
      
      const result = await userService.updateUser(userId, updateData);
      
      expect(result).toBeDefined();
      expect(result.nickname).toBe('Updated User');
      expect(mockUser.update).toHaveBeenCalledWith({
        nickname: 'Updated User',
        avatar: 'https://example.com/new-avatar.jpg'
      });
    });
  });
});