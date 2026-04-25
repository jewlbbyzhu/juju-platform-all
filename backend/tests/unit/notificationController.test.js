const notificationController = require('../../src/controllers/notificationController');
const { Notification } = require('../../src/models');

jest.mock('../../src/models');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
}));

describe('NotificationController', () => {
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

  describe('getNotifications', () => {
    it('should get notifications successfully', async () => {
      req.user = { id: 1 };
      req.query = {
        page: '1',
        pageSize: '20',
        type: 'order'
      };

      const mockResult = {
        count: 10,
        rows: [
          { id: 1, type: 'order', is_read: false },
          { id: 2, type: 'payment', is_read: false }
        ]
      };

      Notification.findAndCountAll.mockResolvedValue(mockResult);

      await notificationController.getNotifications(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          total: 10,
          page: 1,
          pageSize: 20,
          data: [
            { id: 1, type: 'order', is_read: false },
            { id: 2, type: 'payment', is_read: false }
          ]
        }
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle get notifications error', async () => {
      req.user = { id: 1 };
      req.query = { page: '1', pageSize: '20' };

      const error = new Error('Database error');
      Notification.findAndCountAll.mockRejectedValue(error);

      await notificationController.getNotifications(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read successfully', async () => {
      req.params = { id: '1' };
      req.user = { id: 1 };

      const mockNotification = {
        id: 1,
        user_id: 1,
        is_read: false,
        save: jest.fn().mockResolvedValue()
      };

      Notification.findOne.mockResolvedValue(mockNotification);

      await notificationController.markAsRead(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Notification marked as read'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle mark as read error', async () => {
      req.params = { id: '1' };
      req.user = { id: 1 };

      const error = new Error('Notification not found');
      Notification.findOne.mockResolvedValue(null);

      await notificationController.markAsRead(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read successfully', async () => {
      req.user = { id: 1 };

      Notification.update.mockResolvedValue([1]);

      await notificationController.markAllAsRead(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'All notifications marked as read'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle mark all as read error', async () => {
      req.user = { id: 1 };

      const error = new Error('Mark all as read failed');
      Notification.update.mockRejectedValue(error);

      await notificationController.markAllAsRead(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      req.params = { id: '1' };
      req.user = { id: 1 };

      const mockNotification = {
        id: 1,
        user_id: 1,
        destroy: jest.fn().mockResolvedValue()
      };

      Notification.findOne.mockResolvedValue(mockNotification);

      await notificationController.deleteNotification(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Notification deleted successfully'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle delete notification error', async () => {
      req.params = { id: '1' };
      req.user = { id: 1 };

      const error = new Error('Notification not found');
      Notification.findOne.mockResolvedValue(null);

      await notificationController.deleteNotification(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});