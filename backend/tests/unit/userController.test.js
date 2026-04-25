const userController = require('../../src/controllers/userController');
const userService = require('../../src/services/userService');

jest.mock('../../src/services/userService');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
}));

describe('UserController', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 1 }
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      req.body = {
        openid: 'test_openid',
        unionid: 'test_unionid',
        nickname: 'Test User',
        avatar: 'avatar.jpg'
      };

      const mockResult = {
        user: {
          id: 1,
          openid: 'test_openid',
          nickname: 'Test User'
        },
        token: 'test_token'
      };

      userService.register.mockResolvedValue(mockResult);

      await userController.register(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Registration successful',
        data: {
          id: 1,
          openid: 'test_openid',
          nickname: 'Test User'
        }
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle registration error', async () => {
      req.body = {
        openid: 'test_openid'
      };

      const error = new Error('Registration failed');
      userService.register.mockRejectedValue(error);

      await userController.register(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      req.body = {
        openid: 'test_openid',
        unionid: 'test_unionid'
      };

      const mockResult = {
        user: {
          id: 1,
          openid: 'test_openid',
          nickname: 'Test User'
        },
        token: 'test_token'
      };

      userService.login.mockResolvedValue(mockResult);

      await userController.login(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: {
          id: 1,
          openid: 'test_openid',
          nickname: 'Test User',
          token: 'test_token'
        }
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle login error', async () => {
      req.body = {
        openid: 'test_openid'
      };

      const error = new Error('Login failed');
      userService.login.mockRejectedValue(error);

      await userController.login(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      req.user = { id: 1 };

      const mockUser = {
        id: 1,
        nickname: 'Test User',
        avatar: 'avatar.jpg'
      };

      userService.getUserById.mockResolvedValue(mockUser);

      await userController.getProfile(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle get profile error', async () => {
      req.user = { id: 1 };

      const error = new Error('User not found');
      userService.getUserById.mockRejectedValue(error);

      await userController.getProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      req.user = { id: 1 };
      req.body = {
        nickname: 'Updated User',
        avatar: 'new_avatar.jpg'
      };

      const mockUser = {
        id: 1,
        nickname: 'Updated User',
        avatar: 'new_avatar.jpg'
      };

      userService.updateUser.mockResolvedValue(mockUser);

      await userController.updateProfile(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Profile updated successfully',
        data: mockUser
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle update profile error', async () => {
      req.user = { id: 1 };
      req.body = { nickname: 'Updated User' };

      const error = new Error('Update failed');
      userService.updateUser.mockRejectedValue(error);

      await userController.updateProfile(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getUserList', () => {
    it('should get user list successfully', async () => {
      req.query = {
        page: '1',
        limit: '20',
        status: '1',
        is_vip: 'true',
        keyword: 'test'
      };

      const mockResult = {
        total: 10,
        data: [
          { id: 1, nickname: 'User 1' },
          { id: 2, nickname: 'User 2' }
        ]
      };

      userService.getUserList.mockResolvedValue(mockResult);

      await userController.getUserList(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should get user list with default pagination', async () => {
      req.query = {};

      const mockResult = {
        total: 10,
        data: []
      };

      userService.getUserList.mockResolvedValue(mockResult);

      await userController.getUserList(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      });
      expect(userService.getUserList).toHaveBeenCalledWith(1, 20, {
        status: undefined,
        is_vip: undefined,
        keyword: undefined
      });
    });

    it('should handle get user list error', async () => {
      req.query = { page: '1', limit: '20' };

      const error = new Error('Get list failed');
      userService.getUserList.mockRejectedValue(error);

      await userController.getUserList(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should get user by id successfully', async () => {
      req.params = { id: '1' };

      const mockUser = {
        id: 1,
        nickname: 'Test User'
      };

      userService.getUserById.mockResolvedValue(mockUser);

      await userController.getUserById(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle get user by id error', async () => {
      req.params = { id: '1' };

      const error = new Error('User not found');
      userService.getUserById.mockRejectedValue(error);

      await userController.getUserById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status successfully', async () => {
      req.params = { id: '1' };
      req.body = { status: 1 };

      const mockUser = {
        id: 1,
        status: 1
      };

      userService.updateUserStatus.mockResolvedValue(mockUser);

      await userController.updateUserStatus(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User status updated successfully',
        data: mockUser
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle update user status error', async () => {
      req.params = { id: '1' };
      req.body = { status: 1 };

      const error = new Error('Update failed');
      userService.updateUserStatus.mockRejectedValue(error);

      await userController.updateUserStatus(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      req.params = { id: '1' };

      const mockResult = {
        message: 'User deleted successfully'
      };

      userService.deleteUser.mockResolvedValue(mockResult);

      await userController.deleteUser(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: mockResult.message
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle delete user error', async () => {
      req.params = { id: '1' };

      const error = new Error('Delete failed');
      userService.deleteUser.mockRejectedValue(error);

      await userController.deleteUser(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});