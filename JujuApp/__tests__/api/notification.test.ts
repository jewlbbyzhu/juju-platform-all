import { notificationApi } from '../../src/api/notification';
import api from '../../src/api/index';

jest.mock('../../src/api/index', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('notificationApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('should get notifications without params', async () => {
      const mockResponse = { data: [{ id: '1', title: 'Notification 1' }] };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationApi.getNotifications();

      expect(api.get).toHaveBeenCalledWith('/notifications', { params: undefined });
      expect(result).toEqual(mockResponse);
    });

    it('should get notifications with pagination', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: [] });

      await notificationApi.getNotifications({ page: 1, pageSize: 10 });

      expect(api.get).toHaveBeenCalledWith('/notifications', { params: { page: 1, pageSize: 10 } });
    });

    it('should get notifications with is_read filter', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: [] });

      await notificationApi.getNotifications({ is_read: false });

      expect(api.get).toHaveBeenCalledWith('/notifications', { params: { is_read: false } });
    });
  });

  describe('getNotificationDetail', () => {
    it('should get notification detail', async () => {
      const mockResponse = { data: { id: '1', content: 'Detail content' } };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationApi.getNotificationDetail('1');

      expect(api.get).toHaveBeenCalledWith('/notifications/1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const mockResponse = { data: { success: true } };
      (api.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationApi.markAsRead('1');

      expect(api.put).toHaveBeenCalledWith('/notifications/1/read');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const mockResponse = { data: { updatedCount: 5 } };
      (api.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationApi.markAllAsRead();

      expect(api.put).toHaveBeenCalledWith('/notifications/read-all');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification', async () => {
      const mockResponse = { data: { success: true } };
      (api.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationApi.deleteNotification('1');

      expect(api.delete).toHaveBeenCalledWith('/notifications/1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteAllNotifications', () => {
    it('should delete all notifications', async () => {
      const mockResponse = { data: { deletedCount: 10 } };
      (api.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationApi.deleteAllNotifications();

      expect(api.delete).toHaveBeenCalledWith('/notifications');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getUnreadCount', () => {
    it('should get unread count', async () => {
      const mockResponse = { data: { count: 5 } };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationApi.getUnreadCount();

      expect(api.get).toHaveBeenCalledWith('/notifications/unread-count');
      expect(result).toEqual(mockResponse);
    });

    it('should return zero when no unread', async () => {
      const mockResponse = { data: { count: 0 } };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationApi.getUnreadCount();

      expect(result.data.count).toBe(0);
    });
  });
});
