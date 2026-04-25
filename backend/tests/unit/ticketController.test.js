const ticketController = require('../../src/controllers/ticketController');
const ticketService = require('../../src/services/ticketService');

jest.mock('../../src/services/ticketService');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
}));

describe('TicketController', () => {
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

  describe('getTicketById', () => {
    it('should get ticket by id successfully', async () => {
      req.params = { id: '1' };

      const mockTicket = {
        id: 1,
        code: 'TICKET001',
        status: 'valid'
      };

      ticketService.getTicketById.mockResolvedValue(mockTicket);

      await ticketController.getTicketById(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockTicket
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle get ticket by id error', async () => {
      req.params = { id: '1' };

      const error = new Error('Ticket not found');
      ticketService.getTicketById.mockRejectedValue(error);

      await ticketController.getTicketById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getTicketByCode', () => {
    it('should get ticket by code successfully', async () => {
      req.params = { code: 'TICKET001' };

      const mockTicket = {
        id: 1,
        code: 'TICKET001',
        status: 'valid'
      };

      ticketService.getTicketByCode.mockResolvedValue(mockTicket);

      await ticketController.getTicketByCode(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockTicket
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle get ticket by code error', async () => {
      req.params = { code: 'TICKET001' };

      const error = new Error('Ticket not found');
      ticketService.getTicketByCode.mockRejectedValue(error);

      await ticketController.getTicketByCode(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getTicketList', () => {
    it('should get ticket list successfully', async () => {
      req.user = { id: 1 };
      req.query = {
        page: '1',
        limit: '20',
        status: '1',
        party_id: '1',
        ticket_type_id: '1',
        keyword: 'test'
      };

      const mockResult = {
        total: 10,
        data: [
          { id: 1, code: 'TICKET001' },
          { id: 2, code: 'TICKET002' }
        ]
      };

      ticketService.getTicketList.mockResolvedValue(mockResult);

      await ticketController.getTicketList(req, res, next);

      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.success).toBe(true);
      expect(jsonCall.data.data).toHaveLength(2);
      expect(jsonCall.data.total).toBe(10);
      expect(next).not.toHaveBeenCalled();
    });

    it('should get ticket list with default pagination', async () => {
      req.user = { id: 1 };
      req.query = {};

      const mockResult = {
        total: 10,
        data: []
      };

      ticketService.getTicketList.mockResolvedValue(mockResult);

      await ticketController.getTicketList(req, res, next);

      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.success).toBe(true);
      expect(jsonCall.data.data).toEqual([]);
      expect(jsonCall.data.total).toBe(10);
      expect(ticketService.getTicketList).toHaveBeenCalledWith(1, 1, 20, {
        status: undefined,
        party_id: undefined,
        ticket_type_id: undefined,
        keyword: undefined
      });
    });

    it('should handle get ticket list error', async () => {
      req.user = { id: 1 };
      req.query = { page: '1', limit: '20' };

      const error = new Error('Get list failed');
      ticketService.getTicketList.mockRejectedValue(error);

      await ticketController.getTicketList(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('verifyTicket', () => {
    it('should verify ticket successfully', async () => {
      req.body = { code: 'TICKET001' };

      const mockResult = {
        ticket: { id: 1, code: 'TICKET001' },
        valid: true
      };

      ticketService.verifyTicket.mockResolvedValue(mockResult);

      await ticketController.verifyTicket(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle verify ticket error', async () => {
      req.body = { code: 'TICKET001' };

      const error = new Error('Verify failed');
      ticketService.verifyTicket.mockRejectedValue(error);

      await ticketController.verifyTicket(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('useTicket', () => {
    it('should use ticket successfully', async () => {
      req.user = { id: 1 };
      req.body = { code: 'TICKET001' };

      const mockTicket = {
        id: 1,
        code: 'TICKET001',
        status: 'used',
        used_at: new Date()
      };

      ticketService.useTicket.mockResolvedValue(mockTicket);

      await ticketController.useTicket(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Ticket used successfully',
        data: mockTicket
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle use ticket error', async () => {
      req.user = { id: 1 };
      req.body = { code: 'TICKET001' };

      const error = new Error('Use ticket failed');
      ticketService.useTicket.mockRejectedValue(error);

      await ticketController.useTicket(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('invalidateTicket', () => {
    it('should invalidate ticket successfully', async () => {
      req.params = { id: '1' };
      req.body = { reason: 'Event cancelled' };

      const mockTicket = {
        id: 1,
        status: 'invalidated',
        invalidate_reason: 'Event cancelled'
      };

      ticketService.invalidateTicket.mockResolvedValue(mockTicket);

      await ticketController.invalidateTicket(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Ticket invalidated successfully',
        data: mockTicket
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle invalidate ticket error', async () => {
      req.params = { id: '1' };
      req.body = { reason: 'Event cancelled' };

      const error = new Error('Invalidate failed');
      ticketService.invalidateTicket.mockRejectedValue(error);

      await ticketController.invalidateTicket(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('checkExpiredTickets', () => {
    it('should check expired tickets successfully', async () => {
      const mockResult = {
        message: 'Expired tickets checked',
        count: 5
      };

      ticketService.checkExpiredTickets.mockResolvedValue(mockResult);

      await ticketController.checkExpiredTickets(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: mockResult.message,
        data: { count: mockResult.count }
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle check expired tickets error', async () => {
      const error = new Error('Check failed');
      ticketService.checkExpiredTickets.mockRejectedValue(error);

      await ticketController.checkExpiredTickets(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getTicketStats', () => {
    it('should get ticket stats successfully', async () => {
      req.user = { id: 1 };

      const mockStats = {
        total: 10,
        used: 5,
        valid: 3,
        expired: 2
      };

      ticketService.getTicketStats.mockResolvedValue(mockStats);

      await ticketController.getTicketStats(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockStats
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle get ticket stats error', async () => {
      req.user = { id: 1 };

      const error = new Error('Get stats failed');
      ticketService.getTicketStats.mockRejectedValue(error);

      await ticketController.getTicketStats(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});