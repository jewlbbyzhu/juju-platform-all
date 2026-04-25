const partyService = require('../../src/services/partyService');
const { Party, TicketType } = require('../../src/models');

jest.mock('../../src/models');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
}));

describe('PartyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createParty', () => {
    it('should create a party successfully', async () => {
      const userId = 1;
      const partyData = {
        title: 'Test Party',
        description: 'This is a test party',
        category: 'music',
        start_time: new Date('2026-02-01 10:00:00'),
        end_time: new Date('2026-02-01 18:00:00'),
        location: 'Test Location',
        max_participants: 50,
        min_price: 50.00,
        max_price: 100.00
      };
      
      const mockParty = {
        id: 1,
        user_id: userId,
        ...partyData,
        status: 0,
        audit_status: 0,
        current_participants: 0,
        view_count: 0,
        favorite_count: 0,
        is_featured: false,
        is_hot: false,
        ticket_types: [],
        increment: jest.fn().mockResolvedValue()
      };
      
      Party.create.mockResolvedValue(mockParty);
      Party.findByPk.mockResolvedValue(mockParty);
      TicketType.create.mockResolvedValue({});
      
      const result = await partyService.createParty(userId, partyData);
      
      expect(result).toBeDefined();
      expect(result.title).toBe(partyData.title);
      expect(result.user_id).toBe(userId);
      expect(result.status).toBe(0);
      expect(Party.create).toHaveBeenCalled();
      expect(mockParty.increment).toHaveBeenCalledWith('view_count');
    });
  });

  describe('getPartyById', () => {
    it('should return party by id', async () => {
      const partyId = 1;
      
      const mockParty = {
        id: partyId,
        title: 'Test Party',
        category: 'music',
        status: 1,
        ticket_types: [],
        increment: jest.fn().mockResolvedValue()
      };
      
      Party.findByPk.mockResolvedValue(mockParty);
      
      const result = await partyService.getPartyById(partyId);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(partyId);
      expect(Party.findByPk).toHaveBeenCalledWith(partyId, expect.any(Object));
      expect(mockParty.increment).toHaveBeenCalledWith('view_count');
    });

    it('should throw error if party not found', async () => {
      Party.findByPk.mockResolvedValue(null);
      
      await expect(partyService.getPartyById(999)).rejects.toThrow('Party not found');
      expect(Party.findByPk).toHaveBeenCalledWith(999, expect.any(Object));
    });
  });

  describe('getPartyList', () => {
    it('should return parties with pagination', async () => {
      const parties = [
        { id: 1, title: 'Party 1', status: 1 },
        { id: 2, title: 'Party 2', status: 1 },
        { id: 3, title: 'Party 3', status: 1 }
      ];
      
      Party.findAndCountAll.mockResolvedValue({
        count: 3,
        rows: parties
      });
      
      const result = await partyService.getPartyList(1, 10, {});
      
      expect(result).toBeDefined();
      expect(result.total).toBe(3);
      expect(result.data).toHaveLength(3);
    });

    it('should filter parties by category', async () => {
      const parties = [
        { id: 1, title: 'Music Party 1', category: 'music', status: 1 },
        { id: 2, title: 'Music Party 2', category: 'music', status: 1 }
      ];
      
      Party.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: parties
      });
      
      const result = await partyService.getPartyList(1, 10, { category: 'music' });
      
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.data.every(p => p.category === 'music')).toBe(true);
    });

    it('should filter parties by status', async () => {
      const parties = [
        { id: 1, title: 'Published Party 1', status: 1 },
        { id: 2, title: 'Published Party 2', status: 1 }
      ];
      
      Party.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: parties
      });
      
      const result = await partyService.getPartyList(1, 10, { status: 1 });
      
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.data.every(p => p.status === 1)).toBe(true);
    });
  });

  describe('updateParty', () => {
    it('should update party successfully', async () => {
      const partyId = 1;
      const userId = 1;
      const updateData = {
        title: 'Updated Party Title',
        description: 'Updated description'
      };
      
      const mockParty = {
        id: partyId,
        user_id: userId,
        title: 'Old Title',
        ticket_types: [],
        increment: jest.fn().mockResolvedValue(),
        dataValues: {
          id: partyId,
          user_id: userId,
          title: 'Old Title'
        },
        update: jest.fn().mockImplementation(function(updates) {
          Object.assign(this, updates);
          Object.assign(this.dataValues, updates);
          return Promise.resolve(this);
        })
      };
      
      Party.findByPk.mockResolvedValue(mockParty);
      Party.findByPk.mockResolvedValue(mockParty);
      
      const result = await partyService.updateParty(partyId, userId, updateData);
      
      expect(result).toBeDefined();
      expect(mockParty.update).toHaveBeenCalledWith({
        title: updateData.title,
        description: updateData.description
      });
    });

    it('should throw error if user is not party owner', async () => {
      const partyId = 1;
      const userId = 2;
      const updateData = {
        title: 'Updated Party Title'
      };
      
      const mockParty = {
        id: partyId,
        user_id: 1,
        title: 'Old Title',
        ticket_types: [],
        increment: jest.fn().mockResolvedValue()
      };
      
      Party.findByPk.mockResolvedValue(mockParty);
      
      await expect(partyService.updateParty(partyId, userId, updateData))
        .rejects.toThrow('Unauthorized');
    });
  });

  describe('deleteParty', () => {
    it('should delete party successfully', async () => {
      const partyId = 1;
      const userId = 1;
      
      const mockParty = {
        id: partyId,
        user_id: userId,
        title: 'Party to Delete',
        ticket_types: [],
        destroy: jest.fn().mockResolvedValue(true)
      };
      
      Party.findByPk.mockResolvedValue(mockParty);
      
      const result = await partyService.deleteParty(partyId, userId);
      
      expect(result).toBeDefined();
      expect(result.message).toContain('deleted');
      expect(mockParty.destroy).toHaveBeenCalled();
    });

    it('should throw error if user is not party owner', async () => {
      const partyId = 1;
      const userId = 2;
      
      const mockParty = {
        id: partyId,
        user_id: 1,
        title: 'Party with Orders',
        ticket_types: []
      };
      
      Party.findByPk.mockResolvedValue(mockParty);
      
      await expect(partyService.deleteParty(partyId, userId))
        .rejects.toThrow('Unauthorized');
    });
  });
});