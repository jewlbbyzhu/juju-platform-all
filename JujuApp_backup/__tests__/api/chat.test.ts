import { chatApi } from '../../src/api/chat';
import api from '../../src/api/index';

jest.mock('../../src/api/index', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('chatApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getConversationList', () => {
    it('should get conversation list without params', async () => {
      const mockResponse = {
        success: true,
        code: 200,
        message: '获取成功',
        data: [{ id: 'conv1', name: 'Conversation 1' }],
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await chatApi.getConversationList();

      expect(api.get).toHaveBeenCalledWith('/chat/conversations', { params: undefined });
      expect(result).toEqual(mockResponse);
    });

    it('should get conversation list with pagination', async () => {
      const mockResponse = { success: true, data: [] };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      await chatApi.getConversationList({ page: 1, pageSize: 20 });

      expect(api.get).toHaveBeenCalledWith('/chat/conversations', { params: { page: 1, pageSize: 20 } });
    });
  });

  describe('getMessages', () => {
    it('should get messages without params', async () => {
      const mockResponse = {
        success: true,
        code: 200,
        data: [{ id: 'msg1', content: 'Hello' }],
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await chatApi.getMessages('conv1');

      expect(api.get).toHaveBeenCalledWith('/chat/conversations/conv1/messages', { params: undefined });
      expect(result).toEqual(mockResponse);
    });

    it('should get messages with params', async () => {
      const mockResponse = { success: true, data: [] };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      await chatApi.getMessages('conv1', { page: 1, pageSize: 50, before: 'msg123' });

      expect(api.get).toHaveBeenCalledWith('/chat/conversations/conv1/messages', {
        params: { page: 1, pageSize: 50, before: 'msg123' },
      });
    });
  });

  describe('sendMessage', () => {
    it('should send text message', async () => {
      const mockResponse = {
        success: true,
        code: 200,
        data: { id: 'msg123', content: 'Hello' },
      };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const data = { content: 'Hello', type: 'text' };
      const result = await chatApi.sendMessage('conv1', data);

      expect(api.post).toHaveBeenCalledWith('/chat/conversations/conv1/messages', data);
      expect(result).toEqual(mockResponse);
    });

    it('should send message with attachments', async () => {
      const mockResponse = { success: true, data: { id: 'msg124' } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const data = {
        content: 'Check this image',
        type: 'image',
        attachments: [{ url: 'image.jpg', type: 'image' }],
      };
      const result = await chatApi.sendMessage('conv1', data);

      expect(api.post).toHaveBeenCalledWith('/chat/conversations/conv1/messages', data);
      expect(result).toEqual(mockResponse);
    });

    it('should send message with default type', async () => {
      const mockResponse = { success: true, data: {} };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const data = { content: 'Simple message' };
      await chatApi.sendMessage('conv1', data);

      expect(api.post).toHaveBeenCalledWith('/chat/conversations/conv1/messages', data);
    });
  });

  describe('createConversation', () => {
    it('should create one-on-one conversation', async () => {
      const mockResponse = {
        success: true,
        code: 200,
        data: { id: 'conv2', type: 'direct' },
      };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const data = { userId: 'user123', type: 'direct' };
      const result = await chatApi.createConversation(data);

      expect(api.post).toHaveBeenCalledWith('/chat/conversations', data);
      expect(result).toEqual(mockResponse);
    });

    it('should create group conversation', async () => {
      const mockResponse = { success: true, data: { id: 'conv3', type: 'group' } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const data = { type: 'group', name: 'Group Chat' };
      const result = await chatApi.createConversation(data);

      expect(api.post).toHaveBeenCalledWith('/chat/conversations', data);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('markAsRead', () => {
    it('should mark conversation as read', async () => {
      const mockResponse = { success: true, code: 200, data: null };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await chatApi.markAsRead('conv1');

      expect(api.post).toHaveBeenCalledWith('/chat/conversations/conv1/read');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteMessage', () => {
    it('should delete message', async () => {
      const mockResponse = { success: true, code: 200, data: null };
      (api.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await chatApi.deleteMessage('msg123');

      expect(api.delete).toHaveBeenCalledWith('/chat/messages/msg123');
      expect(result).toEqual(mockResponse);
    });
  });
});
