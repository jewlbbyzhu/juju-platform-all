jest.mock('../../src/services/adminService');
jest.mock('../../src/services/bankCardService');
jest.mock('../../src/services/vipService');
jest.mock('../../src/utils/logger');
jest.mock('../../src/utils/transactionManager', () => ({
  execute: jest.fn((callback) => Promise.resolve().then(async () => {
    const mockTransaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      LOCK: {
        UPDATE: 'UPDATE'
      }
    };
    const result = await callback(mockTransaction);
    return result;
  })),
  executeWithRetry: jest.fn((callback) => Promise.resolve().then(async () => {
    const mockTransaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      LOCK: {
        UPDATE: 'UPDATE'
      }
    };
    const result = await callback(mockTransaction);
    return result;
  }))
}));
jest.mock('../../src/utils/encryption', () => ({
  encrypt: jest.fn((text) => text),
  decrypt: jest.fn((text) => text),
  maskCardNumber: jest.fn((cardNumber) => '****' + cardNumber.slice(-4))
}));
jest.mock('../../src/utils/validator', () => ({
  validateString: jest.fn(() => ({ valid: true })),
  validateCardNumber: jest.fn(() => ({ valid: true })),
  validatePhone: jest.fn(() => ({ valid: true })),
  validateEmail: jest.fn(() => ({ valid: true })),
  validatePassword: jest.fn(() => ({ valid: true })),
  validateAmount: jest.fn(() => ({ valid: true }))
}));
jest.mock('bcrypt', () => ({
  compareSync: jest.fn(() => true),
  hashSync: jest.fn(() => 'hashed_password')
}));
jest.mock('../../src/models', () => ({
  BankCard: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findAndCountAll: jest.fn()
  },
  VIPMembership: {
    create: jest.fn(),
    findAndCountAll: jest.fn()
  },
  Payment: {
    create: jest.fn()
  },
  Wallet: {
    findOne: jest.fn(),
    update: jest.fn()
  },
  WalletTransaction: {
    create: jest.fn()
  },
  User: {
    update: jest.fn()
  }
}));

const adminController = require('../../src/controllers/adminController');
const bankCardController = require('../../src/controllers/bankCardController');
const vipController = require('../../src/controllers/vipController');
// eslint-disable-next-line no-unused-vars
const vipService = require('../../src/services/vipService');
const adminService = require('../../src/services/adminService');
// eslint-disable-next-line no-unused-vars
const bankCardService = require('../../src/services/bankCardService');
// eslint-disable-next-line no-unused-vars
const { BankCard, VIPMembership, Payment, Wallet, User } = require('../../src/models');

describe('Admin Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 1 }
    };
    res = {
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      req.body = {
        username: 'admin',
        password: 'password123'
      };

      const mockResult = {
        admin: { 
          id: 1, 
          username: 'admin',
          real_name: 'Admin User',
          avatar: 'avatar.jpg',
          email: 'admin@example.com',
          role_id: 1,
          status: 1,
          last_login_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
          role: {
            permissions: ['read', 'write']
          }
        },
        token: 'mock_token'
      };
      adminService.login.mockResolvedValue(mockResult);

      await adminController.login(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: {
          token: 'mock_token',
          user: {
            id: 1,
            username: 'admin',
            nickname: 'Admin User',
            avatar: 'avatar.jpg',
            email: 'admin@example.com',
            role: 'super_admin',
            status: 'active',
            lastLoginAt: mockResult.admin.last_login_at,
            createdAt: mockResult.admin.created_at,
            updatedAt: mockResult.admin.updated_at
          },
          permissions: ['read', 'write'],
          expiresIn: 604800
        }
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next on error', async () => {
      const adminService = require('../../src/services/adminService');
      req.body = {
        username: 'admin',
        password: 'wrong_password'
      };

      adminService.login.mockRejectedValue(new Error('Invalid password'));

      await adminController.login(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getAdmin', () => {
    it('should return admin by id', async () => {
      const adminService = require('../../src/services/adminService');
      req.params.id = '1';

      const mockAdmin = { id: 1, username: 'admin' };
      adminService.getAdminById.mockResolvedValue(mockAdmin);

      await adminController.getAdmin(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockAdmin
      });
      expect(adminService.getAdminById).toHaveBeenCalledWith('1');
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next on error', async () => {
      const adminService = require('../../src/services/adminService');
      req.params.id = '999';

      adminService.getAdminById.mockRejectedValue(new Error('Admin not found'));

      await adminController.getAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getAdminList', () => {
    it('should return admin list with pagination', async () => {
      const adminService = require('../../src/services/adminService');
      req.query = {
        page: '1',
        limit: '20'
      };

      const mockResult = {
        total: 2,
        page: 1,
        limit: 20,
        data: [
          { id: 1, username: 'admin1' },
          { id: 2, username: 'admin2' }
        ]
      };
      adminService.getAdminList.mockResolvedValue(mockResult);

      await adminController.getAdminList(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      });
      expect(adminService.getAdminList).toHaveBeenCalledWith(1, 20, {});
      expect(next).not.toHaveBeenCalled();
    });

    it('should filter admins by status', async () => {
      const adminService = require('../../src/services/adminService');
      req.query = {
        page: '1',
        limit: '20',
        status: '1'
      };

      const mockResult = {
        total: 1,
        page: 1,
        limit: 20,
        data: [{ id: 1, username: 'admin1' }]
      };
      adminService.getAdminList.mockResolvedValue(mockResult);

      await adminController.getAdminList(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      });
      expect(adminService.getAdminList).toHaveBeenCalledWith(1, 20, { status: 1 });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('createAdmin', () => {
    it('should create admin successfully', async () => {
      const adminService = require('../../src/services/adminService');
      req.body = {
        username: 'new_admin',
        password: 'password123',
        real_name: 'New Admin',
        role_id: 1
      };

      const mockAdmin = { id: 1, username: 'new_admin' };
      adminService.createAdmin.mockResolvedValue(mockAdmin);

      await adminController.createAdmin(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Admin created successfully',
        data: mockAdmin
      });
      expect(adminService.createAdmin).toHaveBeenCalledWith(req.body);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next on error', async () => {
      const adminService = require('../../src/services/adminService');
      req.body = {
        username: 'existing_admin',
        password: 'password123'
      };

      adminService.createAdmin.mockRejectedValue(new Error('Admin already exists'));

      await adminController.createAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('updateAdmin', () => {
    it('should update admin successfully', async () => {
      const adminService = require('../../src/services/adminService');
      req.params.id = '1';
      req.body = {
        real_name: 'Updated Name'
      };

      const mockAdmin = { id: 1, username: 'admin', real_name: 'Updated Name' };
      adminService.updateAdmin.mockResolvedValue(mockAdmin);

      await adminController.updateAdmin(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Admin updated successfully',
        data: mockAdmin
      });
      expect(adminService.updateAdmin).toHaveBeenCalledWith('1', req.body);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next on error', async () => {
      const adminService = require('../../src/services/adminService');
      req.params.id = '999';
      req.body = {
        real_name: 'Updated Name'
      };

      adminService.updateAdmin.mockRejectedValue(new Error('Admin not found'));

      await adminController.updateAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('deleteAdmin', () => {
    it('should delete admin successfully', async () => {
      const adminService = require('../../src/services/adminService');
      req.params.id = '1';

      const mockResult = { message: 'Admin deleted successfully' };
      adminService.deleteAdmin.mockResolvedValue(mockResult);

      await adminController.deleteAdmin(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Admin deleted successfully'
      });
      expect(adminService.deleteAdmin).toHaveBeenCalledWith('1');
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next on error', async () => {
      const adminService = require('../../src/services/adminService');
      req.params.id = '999';

      adminService.deleteAdmin.mockRejectedValue(new Error('Admin not found'));

      await adminController.deleteAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('updateAdminStatus', () => {
    it('should update admin status successfully', async () => {
      req.params.id = '1';
      req.body = {
        status: 0
      };

      const mockAdmin = { id: 1, username: 'admin', status: 0 };
      adminService.updateAdminStatus.mockResolvedValue(mockAdmin);

      await adminController.updateAdminStatus(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Admin status updated successfully',
        data: mockAdmin
      });
      expect(adminService.updateAdminStatus).toHaveBeenCalledWith('1', 0);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next on error', async () => {
      const adminService = require('../../src/services/adminService');
      req.params.id = '999';
      req.body = {
        status: 0
      };

      adminService.updateAdminStatus.mockRejectedValue(new Error('Admin not found'));

      await adminController.updateAdminStatus(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});

describe('Bank Card Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 1 }
    };
    res = {
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('addBankCard', () => {
    it('should add bank card successfully', async () => {
      req.body = {
        bankName: 'ICBC',
        cardNumber: '6222021234567890123',
        cardHolder: 'John Doe',
        phone: '13800138000'
      };

      const mockBankCard = { 
        id: 1, 
        bank_name: 'ICBC',
        card_number: 'encrypted_6222021234567890123',
        dataValues: {
          id: 1,
          bank_name: 'ICBC',
          card_number: 'encrypted_6222021234567890123'
        }
      };
      BankCard.create.mockResolvedValue(mockBankCard);

      await bankCardController.addBankCard(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Bank card added successfully',
        data: {
          id: 1,
          bank_name: 'ICBC',
          card_number: '****0123'
        }
      });
      expect(BankCard.create).toHaveBeenCalledWith(expect.objectContaining({
        user_id: 1,
        bank_name: 'ICBC',
        card_holder: 'John Doe',
        phone: '13800138000',
        is_default: false,
        status: 1
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next on error', async () => {
      req.body = {
        bankName: 'ICBC',
        cardNumber: 'invalid_card',
        cardHolder: 'John Doe',
        phone: '13800138000'
      };

      BankCard.create.mockRejectedValue(new Error('Invalid card number'));
      await bankCardController.addBankCard(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getBankCards', () => {
    it('should return bank cards successfully', async () => {
      req.user = { id: 1 };

      const mockBankCards = [
        { 
          id: 1, 
          bank_name: 'ICBC',
          card_number: '6222021234567890123',
          dataValues: {
            id: 1,
            bank_name: 'ICBC',
            card_number: '6222021234567890123'
          }
        },
        { 
          id: 2, 
          bank_name: 'CCB',
          card_number: '6222021234567890456',
          dataValues: {
            id: 2,
            bank_name: 'CCB',
            card_number: '6222021234567890456'
          }
        }
      ];

      BankCard.findAll.mockResolvedValue(mockBankCards);

      await bankCardController.getBankCards(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(2);
      expect(response.data[0].id).toBe(1);
      expect(response.data[0].bank_name).toBe('ICBC');
      expect(response.data[0].card_number).toBe('****0123');
      expect(response.data[1].id).toBe(2);
      expect(response.data[1].bank_name).toBe('CCB');
      expect(response.data[1].card_number).toBe('****0456');
      expect(BankCard.findAll).toHaveBeenCalledWith({
        where: { user_id: 1 },
        order: [['created_at', 'DESC']]
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next on error', async () => {
      req.user = { id: 1 };

      BankCard.findAll.mockRejectedValue(new Error('Database error'));

      await bankCardController.getBankCards(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('deleteBankCard', () => {
    it('should delete bank card successfully', async () => {
      req.params.id = '1';

      const mockBankCard = {
        id: 1,
        user_id: 1,
        destroy: jest.fn().mockResolvedValue()
      };

      BankCard.findOne.mockResolvedValue(mockBankCard);

      await bankCardController.deleteBankCard(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Bank card deleted successfully'
      });
      expect(BankCard.findOne).toHaveBeenCalled();
      expect(mockBankCard.destroy).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next on error', async () => {
      req.params.id = '999';

      BankCard.findOne.mockResolvedValue(null);

      await bankCardController.deleteBankCard(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('setDefaultBankCard', () => {
    it('should set default bank card successfully', async () => {
      req.params.id = '1';

      const mockBankCard = {
        id: 1,
        user_id: 1,
        bank_name: 'ICBC',
        is_default: false,
        save: jest.fn().mockResolvedValue()
      };

      BankCard.findOne.mockResolvedValue(mockBankCard);
      BankCard.update.mockResolvedValue([1]);

      await bankCardController.setDefaultBankCard(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Default bank card set successfully'
      });
      expect(BankCard.findOne).toHaveBeenCalled();
      expect(BankCard.update).toHaveBeenCalled();
      expect(mockBankCard.save).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next on error', async () => {
      req.params.id = '999';

      BankCard.findOne.mockResolvedValue(null);

      await bankCardController.setDefaultBankCard(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});

describe('VIP Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 1 }
    };
    res = {
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getVipPackages', () => {
    it('should get VIP packages successfully', async () => {
      await vipController.getVipPackages(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            membershipType: expect.any(String),
            name: expect.any(String),
            price: expect.any(Number),
            duration: expect.any(Number)
          })
        ])
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('purchaseVip', () => {
    it.skip('should purchase VIP successfully', async () => {
      req.user = { id: 1 };
      req.body = {
        membershipType: 'monthly',
        paymentMethod: 'wechat',
        paymentPassword: 'password123'
      };

      const mockWallet = {
        id: 1,
        user_id: 1,
        balance: 100000,
        password: 'password123'
      };

      const { Wallet } = require('../../src/models');
      Wallet.findOne.mockResolvedValue(mockWallet);
      Wallet.update.mockResolvedValue([1]);

      const mockPayment = {
        id: 1,
        payment_no: 'PAY1234567890',
        amount: 8800,
        status: 1
      };

      Payment.create.mockResolvedValue(mockPayment);

      const mockVipMembership = {
        id: 1,
        user_id: 1,
        membership_type: 'monthly',
        status: 1,
        toJSON: function() { return this; }
      };

      VIPMembership.create.mockResolvedValue(mockVipMembership);

      const { User } = require('../../src/models');
      User.update.mockResolvedValue([1]);

      try {
        await vipController.purchaseVip(req, res, next);
      } catch (error) {
        console.log('CAUGHT ERROR:', error.message);
        console.log('STACK:', error.stack);
      }

      if (next.mock.calls.length > 0) {
        console.log('NEXT CALLED WITH:', next.mock.calls[0][0].message);
      }
      if (res.json.mock.calls.length > 0) {
        console.log('RESPONSE:', JSON.stringify(res.json.mock.calls[0][0], null, 2));
      }

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(true);
      expect(response.message).toBe('VIP purchase successful');
      expect(response.data).toBeDefined();
      expect(response.data.membership).toBeDefined();
      expect(response.data.payment).toBeDefined();
    });

    it.skip('should call next on error', async () => {
      req.user = { id: 1 };
      req.body = {
        membershipType: 'invalid_type',
        paymentMethod: 'wechat',
        paymentPassword: 'password123'
      };

      await vipController.purchaseVip(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getVipHistory', () => {
    it.skip('should return VIP history', async () => {
      req.user = { id: 1 };
      req.query = {
        page: '1',
        pageSize: '20'
      };

      const mockResult = {
        count: 2,
        rows: [
          { id: 1, membership_type: 'monthly', toJSON: function() { return this; } },
          { id: 2, membership_type: 'quarterly', toJSON: function() { return this; } }
        ]
      };

      VIPMembership.findAndCountAll.mockResolvedValue(mockResult);

      await vipController.getVipHistory(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.success).toBe(true);
      expect(jsonCall.data).toBeDefined();
      expect(jsonCall.data.total).toBe(2);
    });

    it.skip('should call next on error', async () => {
      req.user = { id: 1 };
      req.query = {};

      VIPMembership.findAndCountAll.mockRejectedValue(new Error('Database error'));

      await vipController.getVipHistory(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
