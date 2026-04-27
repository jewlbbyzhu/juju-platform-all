import { groupChatApi } from '../../src/api/group-chat';
import api from '../../src/api/index';

jest.mock('../../src/api/index', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('groupChatApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGroup', () => {
    it('should create group successfully', async () => {
      const mockResponse = { data: { id: 'group1', name: 'Test Group' } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const data = { name: 'Test Group', description: 'Test' };
      const result = await groupChatApi.createGroup(data);

      expect(api.post).toHaveBeenCalledWith('/group-chat/groups', data);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createPartyGroup', () => {
    it('should create party group with string partyId', async () => {
      const mockResponse = { data: { id: 'group1' } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const data = { name: 'Party Group' };
      const result = await groupChatApi.createPartyGroup('party123', data);

      expect(api.post).toHaveBeenCalledWith('/group-chat/parties/party123/group', data);
      expect(result).toEqual(mockResponse);
    });

    it('should create party group with number partyId', async () => {
      const mockResponse = { data: { id: 'group2' } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const data = { name: 'Party Group' };
      const result = await groupChatApi.createPartyGroup(456, data);

      expect(api.post).toHaveBeenCalledWith('/group-chat/parties/456/group', data);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getGroups', () => {
    it('should get groups with default params', async () => {
      const mockResponse = { data: [{ id: 'g1', name: 'Group 1' }] };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await groupChatApi.getGroups();

      expect(api.get).toHaveBeenCalledWith('/group-chat/groups', { params: {} });
      expect(result).toEqual(mockResponse);
    });

    it('should get groups with custom params', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: [] });

      await groupChatApi.getGroups({ page: 1 });

      expect(api.get).toHaveBeenCalledWith('/group-chat/groups', { params: { page: 1 } });
    });
  });

  describe('getGroup', () => {
    it('should get group by string id', async () => {
      const mockResponse = { data: { id: 'g1', name: 'Group 1' } };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await groupChatApi.getGroup('g1');

      expect(api.get).toHaveBeenCalledWith('/group-chat/groups/g1');
      expect(result).toEqual(mockResponse);
    });

    it('should get group by number id', async () => {
      const mockResponse = { data: { id: 123 } };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await groupChatApi.getGroup(123);

      expect(api.get).toHaveBeenCalledWith('/group-chat/groups/123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getGroupMembers', () => {
    it('should get group members', async () => {
      const mockResponse = { data: [{ id: 1, nickname: 'User 1' }] };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await groupChatApi.getGroupMembers('g1');

      expect(api.get).toHaveBeenCalledWith('/group-chat/groups/g1/members');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('joinGroup', () => {
    it('should join group', async () => {
      const mockResponse = { data: { success: true } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await groupChatApi.joinGroup('g1');

      expect(api.post).toHaveBeenCalledWith('/group-chat/groups/g1/join');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('leaveGroup', () => {
    it('should leave group', async () => {
      const mockResponse = { data: { success: true } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await groupChatApi.leaveGroup('g1');

      expect(api.post).toHaveBeenCalledWith('/group-chat/groups/g1/leave');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('removeMember', () => {
    it('should remove member with string ids', async () => {
      const mockResponse = { data: { success: true } };
      (api.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await groupChatApi.removeMember('g1', 'user123');

      expect(api.delete).toHaveBeenCalledWith('/group-chat/groups/g1/members/user123');
      expect(result).toEqual(mockResponse);
    });

    it('should remove member with number ids', async () => {
      const mockResponse = { data: { success: true } };
      (api.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await groupChatApi.removeMember(123, 456);

      expect(api.delete).toHaveBeenCalledWith('/group-chat/groups/123/members/456');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getMessages', () => {
    it('should get messages with default params', async () => {
      const mockResponse = { data: [{ id: 'm1', content: 'Hello' }] };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await groupChatApi.getMessages('g1');

      expect(api.get).toHaveBeenCalledWith('/group-chat/groups/g1/messages', { params: {} });
      expect(result).toEqual(mockResponse);
    });

    it('should get messages with custom params', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: [] });

      await groupChatApi.getMessages('g1', { page: 2, limit: 20 });

      expect(api.get).toHaveBeenCalledWith('/group-chat/groups/g1/messages', { params: { page: 2, limit: 20 } });
    });
  });

  describe('sendMessage', () => {
    it('should send message', async () => {
      const mockResponse = { data: { id: 'm2' } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const data = { content: 'Hello everyone' };
      const result = await groupChatApi.sendMessage('g1', data);

      expect(api.post).toHaveBeenCalledWith('/group-chat/groups/g1/messages', data);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getUnreadCount', () => {
    it('should get unread count', async () => {
      const mockResponse = { data: { count: 5 } };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await groupChatApi.getUnreadCount('g1');

      expect(api.get).toHaveBeenCalledWith('/group-chat/groups/g1/unread-count');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('markAsRead', () => {
    it('should mark as read', async () => {
      const mockResponse = { data: { success: true } };
      (api.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await groupChatApi.markAsRead('g1');

      expect(api.put).toHaveBeenCalledWith('/group-chat/groups/g1/read');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateGroupInfo', () => {
    it('should update group info', async () => {
      const mockResponse = { data: { id: 'g1', name: 'Updated Name' } };
      (api.put as jest.Mock).mockResolvedValue(mockResponse);

      const data = { name: 'Updated Name' };
      const result = await groupChatApi.updateGroupInfo('g1', data);

      expect(api.put).toHaveBeenCalledWith('/group-chat/groups/g1', data);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('disbandGroup', () => {
    it('should disband group', async () => {
      const mockResponse = { data: { success: true } };
      (api.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await groupChatApi.disbandGroup('g1');

      expect(api.delete).toHaveBeenCalledWith('/group-chat/groups/g1');
      expect(result).toEqual(mockResponse);
    });
  });
});
