const ticketService = require('../../src/services/ticketService');
const { Ticket, Party } = require('../../src/models');

jest.mock('../../src/models');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
}));

describe('TicketService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTicketById', () => {
    it('should return ticket by id', async () => {
      const ticketId = 1;
      
      const mockTicket = {
        id: ticketId,
        user_id: 1,
        party_id: 1,
        ticket_code: 'TICKET123456',
        status: 0
      };
      
      Ticket.findByPk.mockResolvedValue(mockTicket);
      
      const result = await ticketService.getTicketById(ticketId);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(ticketId);
      expect(Ticket.findByPk).toHaveBeenCalledWith(ticketId, expect.any(Object));
    });

    it('should throw error if ticket not found', async () => {
      Ticket.findByPk.mockResolvedValue(null);
      
      await expect(ticketService.getTicketById(999))
        .rejects.toThrow('Ticket not found');
      expect(Ticket.findByPk).toHaveBeenCalledWith(999, expect.any(Object));
    });
  });

  describe('getTicketByCode', () => {
    it('should return ticket by code', async () => {
      const ticketCode = 'TICKET123456';
      
      const mockTicket = {
        id: 1,
        user_id: 1,
        party_id: 1,
        ticket_code: ticketCode,
        status: 0
      };
      
      Ticket.findOne.mockResolvedValue(mockTicket);
      
      const result = await ticketService.getTicketByCode(ticketCode);
      
      expect(result).toBeDefined();
      expect(result.ticket_code).toBe(ticketCode);
      expect(Ticket.findOne).toHaveBeenCalled();
    });

    it('should throw error if ticket not found', async () => {
      Ticket.findOne.mockResolvedValue(null);
      
      await expect(ticketService.getTicketByCode('NOTEXIST'))
        .rejects.toThrow('Ticket not found');
    });
  });

  describe('getTicketList', () => {
    it('should return tickets with pagination', async () => {
      const userId = 1;
      const tickets = [
        { id: 1, user_id: 1, party_id: 1, ticket_code: 'TICKET123', status: 0 },
        { id: 2, user_id: 1, party_id: 2, ticket_code: 'TICKET456', status: 0 }
      ];
      
      Ticket.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: tickets
      });
      
      const result = await ticketService.getTicketList(userId, 1, 20, {});
      
      expect(result).toBeDefined();
      expect(result.total).toBe(2);
      expect(result.data).toHaveLength(2);
    });

    it('should filter tickets by status', async () => {
      const userId = 1;
      const tickets = [
        { id: 1, user_id: 1, party_id: 1, ticket_code: 'TICKET123', status: 0 },
        { id: 2, user_id: 1, party_id: 2, ticket_code: 'TICKET456', status: 0 }
      ];
      
      Ticket.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: tickets
      });
      
      const result = await ticketService.getTicketList(userId, 1, 20, { status: 0 });
      
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
    });

    it('should filter tickets by party id', async () => {
      const userId = 1;
      const tickets = [
        { id: 1, user_id: 1, party_id: 1, ticket_code: 'TICKET123', status: 0 }
      ];
      
      Ticket.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: tickets
      });
      
      const result = await ticketService.getTicketList(userId, 1, 20, { party_id: 1 });
      
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
    });

    it('should filter tickets by keyword', async () => {
      const userId = 1;
      const tickets = [
        { id: 1, user_id: 1, party_id: 1, ticket_code: 'TICKET123', status: 0 },
        { id: 2, user_id: 1, party_id: 2, ticket_code: 'TICKET456', status: 0 }
      ];
      
      Ticket.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: tickets
      });
      
      const result = await ticketService.getTicketList(userId, 1, 20, { keyword: 'TICKET' });
      
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
    });
  });

  describe('verifyTicket', () => {
    it('should verify ticket successfully', async () => {
      const ticketCode = 'TICKET123456';
      
      const mockTicket = {
        id: 1,
        user_id: 1,
        party_id: 1,
        ticket_code: ticketCode,
        status: 0,
        expires_at: new Date(Date.now() + 86400000)
      };
      
      const mockParty = {
        id: 1,
        status: 2
      };
      
      Ticket.findOne.mockResolvedValue(mockTicket);
      Party.findByPk.mockResolvedValue(mockParty);
      
      const result = await ticketService.verifyTicket(ticketCode);
      
      expect(result).toBeDefined();
      expect(result.valid).toBe(true);
      expect(result.ticket).toBeDefined();
    });

    it('should throw error if ticket already used', async () => {
      const ticketCode = 'TICKET123456';
      
      const mockTicket = {
        id: 1,
        ticket_code: ticketCode,
        status: 1
      };
      
      Ticket.findOne.mockResolvedValue(mockTicket);
      
      await expect(ticketService.verifyTicket(ticketCode))
        .rejects.toThrow('Ticket already used');
    });

    it('should throw error if ticket expired', async () => {
      const ticketCode = 'TICKET123456';
      
      const mockTicket = {
        id: 1,
        ticket_code: ticketCode,
        status: 0,
        expires_at: new Date(Date.now() - 86400000),
        save: jest.fn().mockResolvedValue()
      };
      
      Ticket.findOne.mockResolvedValue(mockTicket);
      
      await expect(ticketService.verifyTicket(ticketCode))
        .rejects.toThrow('Ticket expired');
    });

    it('should throw error if party not started yet', async () => {
      const ticketCode = 'TICKET123456';
      
      const mockTicket = {
        id: 1,
        ticket_code: ticketCode,
        status: 0,
        expires_at: new Date(Date.now() + 86400000)
      };
      
      const mockParty = {
        id: 1,
        start_time: new Date(Date.now() + 3600000), // 1小时后开始
        end_time: new Date(Date.now() + 7200000)
      };
      
      Ticket.findOne.mockResolvedValue(mockTicket);
      Party.findByPk.mockResolvedValue(mockParty);
      
      const result = await ticketService.verifyTicket(ticketCode);
      expect(result.valid).toBe(true);
    });
  });

  describe('useTicket', () => {
    it('should use ticket successfully', async () => {
      const ticketCode = 'TICKET123456';
      const verifierId = 1;
      
      const mockTicket = {
        id: 1,
        user_id: 1,
        party_id: 1,
        ticket_code: ticketCode,
        status: 0,
        expires_at: new Date(Date.now() + 86400000),
        save: jest.fn().mockResolvedValue()
      };
      
      const mockUsedTicket = {
        id: 1,
        ticket_code: ticketCode,
        status: 1,
        used_at: new Date()
      };
      
      Ticket.findOne.mockResolvedValue(mockTicket);
      Ticket.findByPk.mockResolvedValue(mockUsedTicket);
      
      const result = await ticketService.useTicket(ticketCode, verifierId);
      
      expect(result).toBeDefined();
      expect(mockTicket.status).toBe(1);
      expect(mockTicket.used_at).toBeDefined();
      expect(mockTicket.save).toHaveBeenCalled();
    });

    it('should throw error if ticket cannot be used', async () => {
      const ticketCode = 'TICKET123456';
      const verifierId = 1;
      
      const mockTicket = {
        id: 1,
        ticket_code: ticketCode,
        status: 1
      };
      
      Ticket.findOne.mockResolvedValue(mockTicket);
      
      await expect(ticketService.useTicket(ticketCode, verifierId))
        .rejects.toThrow('Ticket cannot be used');
    });

    it('should throw error if ticket expired', async () => {
      const ticketCode = 'TICKET123456';
      const verifierId = 1;
      
      const mockTicket = {
        id: 1,
        ticket_code: ticketCode,
        status: 0,
        expires_at: new Date(Date.now() - 86400000),
        save: jest.fn().mockResolvedValue()
      };
      
      Ticket.findOne.mockResolvedValue(mockTicket);
      
      await expect(ticketService.useTicket(ticketCode, verifierId))
        .rejects.toThrow('Ticket expired');
    });
  });
});