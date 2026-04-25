const partyController = require('../../src/controllers/partyController');
const partyService = require('../../src/services/partyService');

jest.mock('../../src/services/partyService');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
}));

describe('PartyController', () => {
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

  describe('createParty', () => {
    it('should create party successfully', async () => {
      req.user = { id: 1 };
      req.body = {
        title: 'Test Party',
        description: 'Test Description',
        category: 'social'
      };

      const mockParty = {
        id: 1,
        title: 'Test Party',
        description: 'Test Description'
      };

      partyService.createParty.mockResolvedValue(mockParty);

      await partyController.createParty(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Party created successfully',
        data: mockParty
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle create party error', async () => {
      req.user = { id: 1 };
      req.body = { title: 'Test Party' };

      const error = new Error('Create failed');
      partyService.createParty.mockRejectedValue(error);

      await partyController.createParty(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('updateParty', () => {
    it('should update party successfully', async () => {
      req.params = { id: '1' };
      req.user = { id: 1 };
      req.body = {
        title: 'Updated Party',
        description: 'Updated Description'
      };

      const mockParty = {
        id: 1,
        title: 'Updated Party',
        description: 'Updated Description'
      };

      partyService.updateParty.mockResolvedValue(mockParty);

      await partyController.updateParty(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Party updated successfully',
        data: mockParty
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle update party error', async () => {
      req.params = { id: '1' };
      req.user = { id: 1 };
      req.body = { title: 'Updated Party' };

      const error = new Error('Update failed');
      partyService.updateParty.mockRejectedValue(error);

      await partyController.updateParty(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('deleteParty', () => {
    it('should delete party successfully', async () => {
      req.params = { id: '1' };
      req.user = { id: 1 };

      const mockResult = {
        message: 'Party deleted successfully'
      };

      partyService.deleteParty.mockResolvedValue(mockResult);

      await partyController.deleteParty(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: mockResult.message
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle delete party error', async () => {
      req.params = { id: '1' };
      req.user = { id: 1 };

      const error = new Error('Delete failed');
      partyService.deleteParty.mockRejectedValue(error);

      await partyController.deleteParty(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getPartyById', () => {
    it('should get party by id successfully', async () => {
      req.params = { id: '1' };

      const mockParty = {
        id: 1,
        title: 'Test Party'
      };

      partyService.getPartyById.mockResolvedValue(mockParty);

      await partyController.getPartyById(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockParty
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle get party by id error', async () => {
      req.params = { id: '1' };

      const error = new Error('Party not found');
      partyService.getPartyById.mockRejectedValue(error);

      await partyController.getPartyById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Party not found',
        code: 'NOT_FOUND'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('getPartyList', () => {
    it('should get party list successfully', async () => {
      req.query = {
        page: '1',
        limit: '20',
        status: '2',
        audit_status: '1',
        category: 'social',
        is_featured: 'true',
        is_hot: 'true',
        keyword: 'test',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        min_price: '10',
        max_price: '100',
        sort_by: 'start_time'
      };

      const mockResult = {
        total: 10,
        data: [
          { id: 1, title: 'Party 1' },
          { id: 2, title: 'Party 2' }
        ]
      };

      partyService.getPartyList.mockResolvedValue(mockResult);

      await partyController.getPartyList(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        total: 10,
        data: [
          { id: 1, title: 'Party 1' },
          { id: 2, title: 'Party 2' }
        ]
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should get party list with default pagination', async () => {
      req.query = {};

      const mockResult = {
        total: 10,
        data: []
      };

      partyService.getPartyList.mockResolvedValue(mockResult);

      await partyController.getPartyList(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        total: 10,
        data: []
      });
      expect(partyService.getPartyList).toHaveBeenCalledWith(1, 20, {
        status: undefined,
        audit_status: undefined,
        category: undefined,
        is_featured: undefined,
        is_hot: undefined,
        keyword: undefined,
        start_date: undefined,
        end_date: undefined,
        min_price: undefined,
        max_price: undefined,
        sort_by: undefined
      });
    });

    it('should handle get party list error', async () => {
      req.query = { page: '1', limit: '20' };

      const error = new Error('Get list failed');
      partyService.getPartyList.mockRejectedValue(error);

      await partyController.getPartyList(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('auditParty', () => {
    it('should audit party successfully', async () => {
      req.params = { id: '1' };
      req.body = {
        audit_status: 2,
        audit_remark: 'Approved'
      };

      const mockParty = {
        id: 1,
        audit_status: 2
      };

      partyService.auditParty.mockResolvedValue(mockParty);

      await partyController.auditParty(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Party audited successfully',
        data: mockParty
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle audit party error', async () => {
      req.params = { id: '1' };
      req.body = { audit_status: 2 };

      const error = new Error('Audit failed');
      partyService.auditParty.mockRejectedValue(error);

      await partyController.auditParty(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('updatePartyStatus', () => {
    it('should update party status successfully', async () => {
      req.params = { id: '1' };
      req.body = { status: 2 };

      const mockParty = {
        id: 1,
        status: 2
      };

      partyService.updatePartyStatus.mockResolvedValue(mockParty);

      await partyController.updatePartyStatus(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Party status updated successfully',
        data: mockParty
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle update party status error', async () => {
      req.params = { id: '1' };
      req.body = { status: 2 };

      const error = new Error('Update failed');
      partyService.updatePartyStatus.mockRejectedValue(error);

      await partyController.updatePartyStatus(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getMyParties', () => {
    it('should get my parties successfully', async () => {
      req.user = { id: 1 };
      req.query = {
        page: '1',
        limit: '20'
      };

      const mockResult = {
        total: 5,
        data: [
          { id: 1, title: 'My Party 1' },
          { id: 2, title: 'My Party 2' }
        ]
      };

      partyService.getPartyByUserId.mockResolvedValue(mockResult);

      await partyController.getMyParties(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should get my parties with default pagination', async () => {
      req.user = { id: 1 };
      req.query = {};

      const mockResult = {
        total: 5,
        data: []
      };

      partyService.getPartyByUserId.mockResolvedValue(mockResult);

      await partyController.getMyParties(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      });
      expect(partyService.getPartyByUserId).toHaveBeenCalledWith(1, 1, 20);
    });

    it('should handle get my parties error', async () => {
      req.user = { id: 1 };
      req.query = { page: '1', limit: '20' };

      const error = new Error('Get list failed');
      partyService.getPartyByUserId.mockRejectedValue(error);

      await partyController.getMyParties(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});