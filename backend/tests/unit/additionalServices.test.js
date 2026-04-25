/* eslint-disable no-unused-vars */
const adminService = require('../../src/services/adminService');
const bankCardService = require('../../src/services/bankCardService');
const vipService = require('../../src/services/vipService');
const { Admin, BankCard, VIPMembership, User, Party } = require('../../src/models');
const bcrypt = require('bcrypt');

jest.mock('../../src/models');
jest.mock('../../src/utils/logger');
jest.mock('../../src/config/jwt', () => ({
  generateToken: jest.fn(() => 'mock_token_12345')
}));
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn()
}));
jest.mock('crypto', () => ({
  // eslint-disable-next-line no-unused-vars
  createCipheriv: jest.fn((algorithm, key, iv) => {
    if (!(key instanceof Buffer)) {
      key = Buffer.from(key);
    }
    if (!(iv instanceof Buffer)) {
      iv = Buffer.from(iv);
    }
    if (key.length !== 32) {
      throw new Error('Invalid key length: ' + key.length);
    }
    if (iv.length !== 16) {
      throw new Error('Invalid initialization vector: ' + iv.length);
    }
    return {
      update: jest.fn(() => Buffer.from('encrypted')),
      final: jest.fn(() => Buffer.from('encrypted'))
    };
  }),
  createDecipheriv: jest.fn((algorithm, key, iv) => ({
    update: jest.fn(() => Buffer.from('6222021234567890123')),
    final: jest.fn(() => Buffer.from('6222021234567890123'))
  })),
  randomBytes: jest.fn((size) => Buffer.alloc(size))
}));

jest.mock('../../src/utils/transactionManager', () => ({
  execute: jest.fn((callback) => callback({
    commit: jest.fn(),
    rollback: jest.fn(),
    LOCK: { UPDATE: 'UPDATE', SHARE: 'SHARE' }
  }))
}));

describe('Admin Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockAdmin = {
        id: 1,
        username: 'admin',
        password: 'hashed_password',
        status: 1,
        role_id: 1,
        role: {
          id: 1,
          name: 'Super Admin',
          permissions: []
        },
        dataValues: {
          id: 1,
          username: 'admin',
          password: 'hashed_password',
          status: 1,
          role_id: 1
        },
        save: jest.fn().mockResolvedValue()
      };

      Admin.findOne.mockResolvedValue(mockAdmin);
      bcrypt.compare.mockResolvedValue(true);

      const result = await adminService.login('admin', 'password');

      expect(result).toBeDefined();
      expect(result.admin).toBeDefined();
      expect(result.token).toBe('mock_token_12345');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashed_password');
      expect(mockAdmin.save).toHaveBeenCalled();
    });

    it('should throw error if admin not found', async () => {
      Admin.findOne.mockResolvedValue(null);

      await expect(adminService.login('invalid', 'password'))
        .rejects.toThrow('Admin not found');
    });

    it('should throw error if admin account is disabled', async () => {
      const mockAdmin = {
        id: 1,
        username: 'admin',
        password: 'hashed_password',
        status: 0
      };

      Admin.findOne.mockResolvedValue(mockAdmin);

      await expect(adminService.login('admin', 'password'))
        .rejects.toThrow('Admin account is disabled');
    });

    it('should throw error if password is invalid', async () => {
      const mockAdmin = {
        id: 1,
        username: 'admin',
        password: 'hashed_password',
        status: 1
      };

      Admin.findOne.mockResolvedValue(mockAdmin);
      bcrypt.compare.mockResolvedValue(false);

      await expect(adminService.login('admin', 'wrong_password'))
        .rejects.toThrow('Invalid password');
    });
  });

  describe('getAdminById', () => {
    it('should return admin by id', async () => {
      const mockAdmin = {
        id: 1,
        username: 'admin',
        role: {
          id: 1,
          name: 'Super Admin',
          permissions: []
        },
        dataValues: {
          id: 1,
          username: 'admin',
          password: 'hashed_password'
        }
      };

      Admin.findByPk.mockResolvedValue(mockAdmin);

      const result = await adminService.getAdminById(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.username).toBe('admin');
      expect(Admin.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it('should throw error if admin not found', async () => {
      Admin.findByPk.mockResolvedValue(null);

      await expect(adminService.getAdminById(999))
        .rejects.toThrow('Admin not found');
    });
  });

  describe('getAdminList', () => {
    it('should return admin list with pagination', async () => {
      const mockAdmins = [
        { 
          id: 1, 
          username: 'admin1',
          dataValues: { id: 1, username: 'admin1', password: 'hash' }
        },
        { 
          id: 2, 
          username: 'admin2',
          dataValues: { id: 2, username: 'admin2', password: 'hash' }
        }
      ];

      Admin.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockAdmins
      });

      const result = await adminService.getAdminList(1, 20);

      expect(result).toBeDefined();
      expect(result.total).toBe(2);
      expect(result.data).toHaveLength(2);
      expect(Admin.findAndCountAll).toHaveBeenCalled();
    });

    it('should filter admins by status', async () => {
      const mockAdmins = [
        { 
          id: 1, 
          username: 'admin1', 
          status: 1,
          dataValues: { id: 1, username: 'admin1', status: 1, password: 'hash' }
        }
      ];

      Admin.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockAdmins
      });

      const result = await adminService.getAdminList(1, 20, { status: 1 });

      expect(result).toBeDefined();
      expect(result.total).toBe(1);
      expect(Admin.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 1
          })
        })
      );
    });

    it('should filter admins by keyword', async () => {
      const mockAdmins = [
        { 
          id: 1, 
          username: 'admin1',
          dataValues: { id: 1, username: 'admin1', password: 'hash' }
        }
      ];

      Admin.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockAdmins
      });

      const result = await adminService.getAdminList(1, 20, { keyword: 'admin' });

      expect(result).toBeDefined();
      expect(result.total).toBe(1);
      expect(Admin.findAndCountAll).toHaveBeenCalled();
    });
  });

  describe('createAdmin', () => {
    it('should create admin successfully', async () => {
      const adminData = {
        username: 'new_admin',
        password: 'password123',
        real_name: 'New Admin',
        phone: '13800138000',
        email: 'admin@example.com',
        role_id: 1
      };

      Admin.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed_password');

      const mockAdmin = {
        id: 1,
        username: 'new_admin',
        role: {
          id: 1,
          name: 'Super Admin',
          permissions: []
        },
        dataValues: {
          id: 1,
          username: 'new_admin',
          password: 'hashed_password'
        }
      };

      Admin.create.mockResolvedValue(mockAdmin);
      Admin.findByPk.mockResolvedValue(mockAdmin);

      const result = await adminService.createAdmin(adminData);

      expect(result).toBeDefined();
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(Admin.create).toHaveBeenCalled();
    });

    it('should throw error if admin already exists', async () => {
      const adminData = {
        username: 'existing_admin',
        password: 'password123',
        phone: '13800138000',
        email: 'admin@example.com'
      };

      const existingAdmin = { id: 1, username: 'existing_admin' };
      Admin.findOne.mockResolvedValue(existingAdmin);

      await expect(adminService.createAdmin(adminData))
        .rejects.toThrow('Admin already exists');
    });
  });

  describe('updateAdmin', () => {
    it('should update admin successfully', async () => {
      const mockAdmin = {
        id: 1,
        username: 'admin',
        real_name: 'Admin Name',
        dataValues: {
          id: 1,
          username: 'admin',
          real_name: 'Admin Name',
          password: 'hash'
        },
        update: jest.fn().mockResolvedValue()
      };

      Admin.findByPk.mockResolvedValue(mockAdmin);

      const result = await adminService.updateAdmin(1, {
        real_name: 'Updated Name'
      });

      expect(result).toBeDefined();
      expect(mockAdmin.update).toHaveBeenCalled();
    });

    it('should throw error if admin not found', async () => {
      Admin.findByPk.mockResolvedValue(null);

      await expect(adminService.updateAdmin(999, { real_name: 'Updated Name' }))
        .rejects.toThrow('Admin not found');
    });

    it('should hash password when updating', async () => {
      const mockAdmin = {
        id: 1,
        username: 'admin',
        dataValues: {
          id: 1,
          username: 'admin',
          password: 'hash'
        },
        update: jest.fn().mockResolvedValue()
      };

      Admin.findByPk.mockResolvedValue(mockAdmin);
      bcrypt.hash.mockResolvedValue('new_hashed_password');

      const result = await adminService.updateAdmin(1, {
        password: 'new_password'
      });

      expect(result).toBeDefined();
      expect(bcrypt.hash).toHaveBeenCalledWith('new_password', 10);
    });
  });

  describe('deleteAdmin', () => {
    it('should delete admin successfully', async () => {
      const mockAdmin = {
        id: 1,
        username: 'test_admin',
        dataValues: {
          id: 1,
          username: 'test_admin',
          password: 'hash'
        },
        destroy: jest.fn().mockResolvedValue()
      };

      Admin.findByPk.mockResolvedValue(mockAdmin);

      const result = await adminService.deleteAdmin(1);

      expect(result).toBeDefined();
      expect(result.message).toContain('deleted successfully');
      expect(mockAdmin.destroy).toHaveBeenCalled();
    });

    it('should throw error if admin not found', async () => {
      Admin.findByPk.mockResolvedValue(null);

      await expect(adminService.deleteAdmin(999))
        .rejects.toThrow('Admin not found');
    });

    it('should throw error if trying to delete super admin', async () => {
      const mockAdmin = {
        id: 1,
        username: 'admin',
        dataValues: {
          id: 1,
          username: 'admin',
          password: 'hash'
        },
        destroy: jest.fn().mockResolvedValue()
      };

      Admin.findByPk.mockResolvedValue(mockAdmin);

      await expect(adminService.deleteAdmin(1))
        .rejects.toThrow('Cannot delete super admin');
    });
  });

  describe('updateAdminStatus', () => {
    it('should update admin status successfully', async () => {
      const mockAdmin = {
        id: 1,
        username: 'admin',
        status: 1,
        role: {
          id: 1,
          name: 'Super Admin',
          permissions: []
        },
        dataValues: {
          id: 1,
          username: 'admin',
          password: 'hash',
          status: 1,
          role_id: 1
        },
        save: jest.fn().mockResolvedValue()
      };

      Admin.findByPk.mockResolvedValue(mockAdmin);

      const result = await adminService.updateAdminStatus(1, 0);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.username).toBe('admin');
      expect(mockAdmin.save).toHaveBeenCalled();
    });

    it('should throw error if admin not found', async () => {
      Admin.findByPk.mockResolvedValue(null);

      await expect(adminService.updateAdminStatus(999, 0))
        .rejects.toThrow('Admin not found');
    });
  });
});

describe('Bank Card Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addBankCard', () => {
    it('should add bank card successfully', async () => {
      const bankCardData = {
        bank_name: 'ICBC',
        card_number: '6222021234567890123',
        card_holder: 'John Doe',
        card_type: 'debit',
        is_default: true
      };

      const mockBankCard = {
        id: 1,
        user_id: 1,
        bank_name: 'ICBC',
        card_number: 'encrypted_card_number',
        card_holder: 'John Doe',
        card_type: 'debit',
        is_default: true
      };

      BankCard.create.mockResolvedValue(mockBankCard);
      BankCard.update.mockResolvedValue([1]);
      BankCard.findByPk.mockResolvedValue(mockBankCard);

      const result = await bankCardService.addBankCard(1, bankCardData);

      expect(result).toBeDefined();
      expect(BankCard.create).toHaveBeenCalled();
      expect(BankCard.update).toHaveBeenCalled();
    });

    it('should set is_default to false if not provided', async () => {
      const bankCardData = {
        bank_name: 'ICBC',
        card_number: '6222021234567890123',
        card_holder: 'John Doe'
      };

      const mockBankCard = {
        id: 1,
        user_id: 1,
        bank_name: 'ICBC',
        card_number: 'encrypted_card_number',
        card_holder: 'John Doe',
        is_default: false
      };

      BankCard.create.mockResolvedValue(mockBankCard);
      BankCard.findByPk.mockResolvedValue(mockBankCard);

      const result = await bankCardService.addBankCard(1, bankCardData);

      expect(result).toBeDefined();
      expect(result.is_default).toBe(false);
    });
  });

  describe('getBankCardById', () => {
    it('should return bank card by id', async () => {
      const mockBankCard = {
        id: 1,
        user_id: 1,
        bank_name: 'ICBC',
        card_number: '6222****9012',
        card_holder: 'John Doe',
        dataValues: {
          id: 1,
          user_id: 1,
          bank_name: 'ICBC',
          card_number: '6222****9012',
          card_holder: 'John Doe'
        }
      };

      BankCard.findByPk.mockResolvedValue(mockBankCard);

      const result = await bankCardService.getBankCardById(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(BankCard.findByPk).toHaveBeenCalledWith(1);
    });

    it('should throw error if bank card not found', async () => {
      BankCard.findByPk.mockResolvedValue(null);

      await expect(bankCardService.getBankCardById(999))
        .rejects.toThrow('Bank card not found');
    });
  });

  describe('getBankCardList', () => {
    it('should return bank card list with pagination', async () => {
      const mockBankCards = [
        { 
          id: 1, 
          bank_name: 'ICBC',
          dataValues: {
            id: 1,
            bank_name: 'ICBC',
            card_number: '6222****9012'
          }
        },
        { 
          id: 2, 
          bank_name: 'CCB',
          dataValues: {
            id: 2,
            bank_name: 'CCB',
            card_number: '6227****9012'
          }
        }
      ];

      BankCard.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockBankCards
      });

      const result = await bankCardService.getBankCardList(1, 20);

      expect(result).toBeDefined();
      expect(result.total).toBe(2);
      expect(result.data).toHaveLength(2);
      expect(BankCard.findAndCountAll).toHaveBeenCalled();
    });
  });

  describe('updateBankCard', () => {
    it('should update bank card successfully', async () => {
      const mockBankCard = {
        id: 1,
        user_id: 1,
        bank_name: 'ICBC',
        update: jest.fn().mockResolvedValue(),
        dataValues: {
          id: 1,
          user_id: 1,
          bank_name: 'ICBC',
          card_number: '6222****9012'
        }
      };

      BankCard.findByPk.mockResolvedValue(mockBankCard);

      const result = await bankCardService.updateBankCard(1, 1, {
        bank_name: 'Updated Bank'
      });

      expect(result).toBeDefined();
      expect(mockBankCard.update).toHaveBeenCalled();
    });

    it('should throw error if bank card not found', async () => {
      BankCard.findByPk.mockResolvedValue(null);

      await expect(bankCardService.updateBankCard(999, 1, { bank_name: 'Updated Bank' }))
        .rejects.toThrow('Bank card not found');
    });

    it('should throw error if user is not owner', async () => {
      const mockBankCard = {
        id: 1,
        user_id: 2,
        bank_name: 'ICBC'
      };

      BankCard.findByPk.mockResolvedValue(mockBankCard);

      await expect(bankCardService.updateBankCard(1, 1, { bank_name: 'Updated Bank' }))
        .rejects.toThrow('Unauthorized');
    });
  });

  describe('deleteBankCard', () => {
    it('should delete bank card successfully', async () => {
      const mockBankCard = {
        id: 1,
        user_id: 1,
        bank_name: 'ICBC',
        destroy: jest.fn().mockResolvedValue()
      };

      BankCard.findByPk.mockResolvedValue(mockBankCard);

      const result = await bankCardService.deleteBankCard(1, 1);

      expect(result).toBeDefined();
      expect(result.message).toContain('deleted successfully');
      expect(mockBankCard.destroy).toHaveBeenCalled();
    });

    it('should throw error if bank card not found', async () => {
      BankCard.findByPk.mockResolvedValue(null);

      await expect(bankCardService.deleteBankCard(999, 1))
        .rejects.toThrow('Bank card not found');
    });

    it('should throw error if user is not owner', async () => {
      const mockBankCard = {
        id: 1,
        user_id: 2,
        bank_name: 'ICBC'
      };

      BankCard.findByPk.mockResolvedValue(mockBankCard);

      await expect(bankCardService.deleteBankCard(1, 1))
        .rejects.toThrow('Unauthorized');
    });
  });

  describe('setDefaultBankCard', () => {
    it('should set default bank card successfully', async () => {
      const mockBankCard = {
        id: 1,
        user_id: 1,
        bank_name: 'ICBC',
        is_default: false,
        save: jest.fn().mockResolvedValue(),
        dataValues: {
          id: 1,
          user_id: 1,
          bank_name: 'ICBC',
          is_default: false,
          card_number: '6222****9012'
        }
      };

      BankCard.findByPk.mockResolvedValue(mockBankCard);
      BankCard.update.mockResolvedValue([1]);

      const result = await bankCardService.setDefaultBankCard(1, 1);

      expect(result).toBeDefined();
      expect(BankCard.update).toHaveBeenCalled();
      expect(mockBankCard.is_default).toBe(true);
      expect(mockBankCard.save).toHaveBeenCalled();
    });

    it('should throw error if bank card not found', async () => {
      BankCard.findByPk.mockResolvedValue(null);

      await expect(bankCardService.setDefaultBankCard(999, 1))
        .rejects.toThrow('Bank card not found');
    });

    it('should throw error if user is not owner', async () => {
      const mockBankCard = {
        id: 1,
        user_id: 2,
        bank_name: 'ICBC'
      };

      BankCard.findByPk.mockResolvedValue(mockBankCard);

      await expect(bankCardService.setDefaultBankCard(1, 1))
        .rejects.toThrow('Unauthorized');
    });
  });
});

describe('VIP Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('VIP_TYPES', () => {
    it('should have monthly VIP type', () => {
      expect(vipService.VIP_TYPES.MONTHLY).toBeDefined();
      expect(vipService.VIP_TYPES.MONTHLY.type).toBe('monthly');
      expect(vipService.VIP_TYPES.MONTHLY.name).toBe('月卡');
      expect(vipService.VIP_TYPES.MONTHLY.price).toBe(88);
      expect(vipService.VIP_TYPES.MONTHLY.duration).toBe(30);
      expect(vipService.VIP_TYPES.MONTHLY.freePartyCount).toBe(2);
      expect(vipService.VIP_TYPES.MONTHLY.settlementRate).toBe(0.97);
      expect(vipService.VIP_TYPES.MONTHLY.commissionRate).toBe(0.03);
    });

    it('should have quarterly VIP type', () => {
      expect(vipService.VIP_TYPES.QUARTERLY).toBeDefined();
      expect(vipService.VIP_TYPES.QUARTERLY.type).toBe('quarterly');
      expect(vipService.VIP_TYPES.QUARTERLY.name).toBe('季卡');
      expect(vipService.VIP_TYPES.QUARTERLY.price).toBe(188);
      expect(vipService.VIP_TYPES.QUARTERLY.duration).toBe(90);
      expect(vipService.VIP_TYPES.QUARTERLY.freePartyCount).toBe(3);
      expect(vipService.VIP_TYPES.QUARTERLY.settlementRate).toBe(0.98);
      expect(vipService.VIP_TYPES.QUARTERLY.commissionRate).toBe(0.02);
    });

    it('should have yearly VIP type', () => {
      expect(vipService.VIP_TYPES.YEARLY).toBeDefined();
      expect(vipService.VIP_TYPES.YEARLY.type).toBe('yearly');
      expect(vipService.VIP_TYPES.YEARLY.name).toBe('年卡');
      expect(vipService.VIP_TYPES.YEARLY.price).toBe(888);
      expect(vipService.VIP_TYPES.YEARLY.duration).toBe(365);
      expect(vipService.VIP_TYPES.YEARLY.freePartyCount).toBe(-1);
      expect(vipService.VIP_TYPES.YEARLY.settlementRate).toBe(0.98);
      expect(vipService.VIP_TYPES.YEARLY.commissionRate).toBe(0.02);
    });
  });

  describe('getUserVIPStatus', () => {
    it('should return VIP status for user with active membership', async () => {
      const mockMembership = {
        id: 1,
        user_id: 1,
        membership_type: 'monthly',
        start_date: new Date('2026-01-01'),
        end_date: new Date('2026-02-01'),
        status: 1
      };

      VIPMembership.findOne.mockResolvedValue(mockMembership);

      const result = await vipService.getUserVIPStatus(1);

      expect(result).toBeDefined();
      expect(result.is_vip).toBe(true);
      expect(result.membership_type).toBe('monthly');
      expect(result.days_remaining).toBeGreaterThan(0);
    });

    it('should return non-VIP status for user without active membership', async () => {
      VIPMembership.findOne.mockResolvedValue(null);

      const result = await vipService.getUserVIPStatus(1);

      expect(result).toBeDefined();
      expect(result.is_vip).toBe(false);
      expect(result.membership_type).toBeNull();
      expect(result.days_remaining).toBe(0);
    });
  });

  describe('getVIPBenefits', () => {
    it('should return VIP benefits for VIP user', async () => {
      const mockMembership = {
        id: 1,
        user_id: 1,
        membership_type: 'monthly',
        start_date: new Date('2026-01-01'),
        end_date: new Date('2026-02-01'),
        status: 1
      };

      VIPMembership.findOne.mockResolvedValue(mockMembership);

      const result = await vipService.getVIPBenefits(1);

      expect(result).toBeDefined();
      expect(result.is_vip).toBe(true);
      expect(result.membership_type).toBe('monthly');
      expect(result.membership_name).toBe('月卡');
      expect(result.benefits).toBeDefined();
      expect(result.benefits.party_publish_limit).toBe('2个免费名额');
      expect(result.benefits.audit_priority).toBe('2-4小时内审核');
      expect(result.benefits.settlement_rate).toBe('97.0%');
      expect(result.benefits.commission_rate).toBe('3.0%');
      expect(result.benefits.featured_weight).toBe('推荐权重 x1.2');
      expect(result.benefits.data_report).toBe('月度报告');
      expect(result.benefits.customer_service).toBe('专属客服支持');
    });

    it('should return normal user benefits for non-VIP user', async () => {
      VIPMembership.findOne.mockResolvedValue(null);

      const result = await vipService.getVIPBenefits(1);

      expect(result).toBeDefined();
      expect(result.is_vip).toBe(false);
      expect(result.benefits).toBeDefined();
      expect(result.benefits.party_publish_limit).toBe('每月3条，需服务费');
      expect(result.benefits.audit_priority).toBe('4-12小时审核');
      expect(result.benefits.settlement_rate).toBe('95%');
      expect(result.benefits.commission_rate).toBe('5%');
      expect(result.benefits.featured_weight).toBe('无额外权重');
      expect(result.benefits.data_report).toBe('无数据报告');
      expect(result.benefits.customer_service).toBe('普通客服支持');
    });
  });

  describe('getSettlementRate', () => {
    it('should return VIP settlement rate for VIP user', async () => {
      const mockMembership = {
        id: 1,
        user_id: 1,
        membership_type: 'monthly',
        start_date: new Date('2026-01-01'),
        end_date: new Date('2026-02-01'),
        status: 1
      };

      VIPMembership.findOne.mockResolvedValue(mockMembership);

      const result = await vipService.getSettlementRate(1);

      expect(result).toBeDefined();
      expect(result.is_vip).toBe(true);
      expect(result.settlement_rate).toBe(0.97);
      expect(result.commission_rate).toBe(0.03);
      expect(result.membership_type).toBe('monthly');
    });

    it('should return normal user settlement rate for non-VIP user', async () => {
      VIPMembership.findOne.mockResolvedValue(null);

      const result = await vipService.getSettlementRate(1);

      expect(result).toBeDefined();
      expect(result.is_vip).toBe(false);
      expect(result.settlement_rate).toBe(0.95);
      expect(result.commission_rate).toBe(0.05);
    });
  });

  describe('getAuditPriority', () => {
    it('should return VIP audit priority for VIP user', async () => {
      const mockMembership = {
        id: 1,
        user_id: 1,
        membership_type: 'yearly',
        start_date: new Date('2026-01-01'),
        end_date: new Date('2026-02-01'),
        status: 1
      };

      VIPMembership.findOne.mockResolvedValue(mockMembership);

      const result = await vipService.getAuditPriority(1);

      expect(result).toBeDefined();
      expect(result.priority).toBe(1);
      expect(result.estimated_time).toBe('2小时内');
    });

    it('should return normal user audit priority for non-VIP user', async () => {
      VIPMembership.findOne.mockResolvedValue(null);

      const result = await vipService.getAuditPriority(1);

      expect(result).toBeDefined();
      expect(result.priority).toBe(0);
      expect(result.estimated_time).toBe('4-12小时');
    });
  });

  describe('getFeaturedWeight', () => {
    it('should return VIP featured weight for VIP user', async () => {
      const mockMembership = {
        id: 1,
        user_id: 1,
        membership_type: 'yearly',
        start_date: new Date('2026-01-01'),
        end_date: new Date('2026-02-01'),
        status: 1
      };

      VIPMembership.findOne.mockResolvedValue(mockMembership);

      const result = await vipService.getFeaturedWeight(1);

      expect(result).toBeDefined();
      expect(result.weight).toBe(2.5);
      expect(result.message).toBe('推荐权重 x2.5');
    });

    it('should return normal user featured weight for non-VIP user', async () => {
      VIPMembership.findOne.mockResolvedValue(null);

      const result = await vipService.getFeaturedWeight(1);

      expect(result).toBeDefined();
      expect(result.weight).toBe(1.0);
      expect(result.message).toBe('无额外权重');
    });
  });

  describe('checkPartyPublishLimit', () => {
    it('should return can publish true for normal user under limit', async () => {
      const mockUser = {
        id: 1,
        username: 'user1'
      };

      VIPMembership.findOne.mockResolvedValue(null);
      User.findByPk.mockResolvedValue(mockUser);
      Party.count.mockResolvedValue(2);

      const result = await vipService.checkPartyPublishLimit(1);

      expect(result).toBeDefined();
      expect(result.can_publish).toBe(true);
      expect(result.published_count).toBe(2);
      expect(result.limit).toBe(3);
    });

    it('should return can publish false for normal user over limit', async () => {
      const mockUser = {
        id: 1,
        username: 'user1'
      };

      VIPMembership.findOne.mockResolvedValue(null);
      User.findByPk.mockResolvedValue(mockUser);
      Party.count.mockResolvedValue(3);

      const result = await vipService.checkPartyPublishLimit(1);

      expect(result).toBeDefined();
      expect(result.can_publish).toBe(false);
      expect(result.published_count).toBe(3);
      expect(result.limit).toBe(3);
    });

    it('should return can publish true for yearly VIP user', async () => {
      const mockMembership = {
        id: 1,
        user_id: 1,
        membership_type: 'yearly',
        start_date: new Date('2026-01-01'),
        end_date: new Date('2026-02-01'),
        status: 1
      };

      VIPMembership.findOne.mockResolvedValue(mockMembership);

      const result = await vipService.checkPartyPublishLimit(1);

      expect(result).toBeDefined();
      expect(result.can_publish).toBe(true);
      expect(result.limit).toBe(-1);
      expect(result.message).toBe('VIP会员可无限制发布聚会');
    });
  });

  describe('cancelVIPMembership', () => {
    it('should cancel VIP membership successfully', async () => {
      const mockMembership = {
        id: 1,
        user_id: 1,
        membership_type: 'monthly',
        status: 1,
        save: jest.fn().mockResolvedValue()
      };

      VIPMembership.findByPk.mockResolvedValue(mockMembership);

      const result = await vipService.cancelVIPMembership(1, 1);

      expect(result).toBeDefined();
      expect(mockMembership.status).toBe(2);
      expect(mockMembership.save).toHaveBeenCalled();
    });

    it('should throw error if membership not found', async () => {
      VIPMembership.findByPk.mockResolvedValue(null);

      await expect(vipService.cancelVIPMembership(999, 1))
        .rejects.toThrow('VIP membership not found');
    });

    it('should throw error if user is not owner', async () => {
      const mockMembership = {
        id: 1,
        user_id: 2,
        membership_type: 'monthly',
        status: 1
      };

      VIPMembership.findByPk.mockResolvedValue(mockMembership);

      await expect(vipService.cancelVIPMembership(1, 1))
        .rejects.toThrow('Unauthorized');
    });

    it('should throw error if membership is not active', async () => {
      const mockMembership = {
        id: 1,
        user_id: 1,
        membership_type: 'monthly',
        status: 0
      };

      VIPMembership.findByPk.mockResolvedValue(mockMembership);

      await expect(vipService.cancelVIPMembership(1, 1))
        .rejects.toThrow('VIP membership is not active');
    });
  });

  describe('checkExpiredMemberships', () => {
    it('should check and update expired memberships', async () => {
      const mockMemberships = [
        {
          id: 1,
          user_id: 1,
          status: 1,
          save: jest.fn().mockResolvedValue()
        },
        {
          id: 2,
          user_id: 2,
          status: 1,
          save: jest.fn().mockResolvedValue()
        }
      ];

      VIPMembership.findAll.mockResolvedValue(mockMemberships);

      const result = await vipService.checkExpiredMemberships();

      expect(result).toBeDefined();
      expect(result.expired_count).toBe(2);
      expect(result.message).toContain('2 个VIP会员已过期');
      expect(mockMemberships[0].status).toBe(0);
      expect(mockMemberships[1].status).toBe(0);
    });

    it('should return zero expired count if no expired memberships', async () => {
      VIPMembership.findAll.mockResolvedValue([]);

      const result = await vipService.checkExpiredMemberships();

      expect(result).toBeDefined();
      expect(result.expired_count).toBe(0);
      expect(result.message).toContain('0 个VIP会员已过期');
    });
  });
});
