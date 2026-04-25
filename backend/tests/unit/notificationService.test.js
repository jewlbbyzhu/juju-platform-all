const notificationService = require('../../src/services/notificationService');
const { Notification } = require('../../src/models');

jest.mock('../../src/models');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
}));

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create notification successfully', async () => {
      const userId = 1;
      const notificationData = {
        type: 'order',
        title: '订单通知',
        content: '您的订单已创建'
      };
      
      const mockNotification = {
        id: 1,
        user_id: userId,
        type: 'order',
        title: '订单通知',
        content: '您的订单已创建',
        is_read: false
      };
      
      Notification.create.mockResolvedValue(mockNotification);
      Notification.findByPk.mockResolvedValue(mockNotification);
      
      const result = await notificationService.createNotification(userId, notificationData);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(Notification.create).toHaveBeenCalledWith({
        user_id: userId,
        type: notificationData.type,
        title: notificationData.title,
        content: notificationData.content,
        data: notificationData.data || null,
        is_read: false
      });
    });

    it('should create notification with data', async () => {
      const userId = 1;
      const notificationData = {
        type: 'order',
        title: '订单通知',
        content: '您的订单已创建',
        data: { order_id: 1, order_no: 'ORD123' }
      };
      
      const mockNotification = {
        id: 1,
        user_id: userId,
        type: 'order',
        title: '订单通知',
        content: '您的订单已创建',
        data: { order_id: 1, order_no: 'ORD123' },
        is_read: false
      };
      
      Notification.create.mockResolvedValue(mockNotification);
      Notification.findByPk.mockResolvedValue(mockNotification);
      
      const result = await notificationService.createNotification(userId, notificationData);
      
      expect(result).toBeDefined();
      expect(result.data).toEqual({ order_id: 1, order_no: 'ORD123' });
    });
  });

  describe('getNotificationById', () => {
    it('should return notification by id', async () => {
      const notificationId = 1;
      
      const mockNotification = {
        id: notificationId,
        user_id: 1,
        type: 'order',
        title: '订单通知',
        is_read: false
      };
      
      Notification.findByPk.mockResolvedValue(mockNotification);
      
      const result = await notificationService.getNotificationById(notificationId);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(notificationId);
      expect(Notification.findByPk).toHaveBeenCalledWith(notificationId);
    });

    it('should throw error if notification not found', async () => {
      Notification.findByPk.mockResolvedValue(null);
      
      await expect(notificationService.getNotificationById(999))
        .rejects.toThrow('Notification not found');
    });
  });

  describe('getNotificationList', () => {
    it('should return notifications with pagination', async () => {
      const userId = 1;
      const notifications = [
        { id: 1, user_id: 1, type: 'order', is_read: false },
        { id: 2, user_id: 1, type: 'order', is_read: false }
      ];
      
      Notification.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: notifications
      });
      
      const result = await notificationService.getNotificationList(userId, 1, 20, {});
      
      expect(result).toBeDefined();
      expect(result.total).toBe(2);
      expect(result.data).toHaveLength(2);
    });

    it('should filter notifications by type', async () => {
      const userId = 1;
      const notifications = [
        { id: 1, user_id: 1, type: 'order', is_read: false }
      ];
      
      Notification.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: notifications
      });
      
      const result = await notificationService.getNotificationList(userId, 1, 20, { type: 'order' });
      
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
    });

    it('should filter notifications by is_read', async () => {
      const userId = 1;
      const notifications = [
        { id: 1, user_id: 1, type: 'order', is_read: true }
      ];
      
      Notification.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: notifications
      });
      
      const result = await notificationService.getNotificationList(userId, 1, 20, { is_read: true });
      
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read successfully', async () => {
      const userId = 1;
      const notificationId = 1;
      
      const mockNotification = {
        id: notificationId,
        user_id: userId,
        is_read: false,
        save: jest.fn().mockImplementation(function() {
          this.is_read = true;
          this.read_at = new Date();
          return Promise.resolve();
        })
      };
      
      Notification.findOne.mockResolvedValue(mockNotification);
      Notification.findByPk.mockResolvedValue(mockNotification);
      
      const result = await notificationService.markAsRead(notificationId, userId);
      
      expect(result).toBeDefined();
      expect(result.is_read).toBe(true);
      expect(result.read_at).toBeDefined();
      expect(mockNotification.save).toHaveBeenCalled();
    });

    it('should throw error if notification not found', async () => {
      const userId = 1;
      const notificationId = 999;
      
      Notification.findOne.mockResolvedValue(null);
      
      await expect(notificationService.markAsRead(notificationId, userId))
        .rejects.toThrow('Notification not found');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read successfully', async () => {
      const userId = 1;
      
      Notification.update.mockResolvedValue([2]);
      Notification.count.mockResolvedValueOnce(5);
      Notification.count.mockResolvedValueOnce(5);
      
      const result = await notificationService.markAllAsRead(userId);
      
      expect(result).toBeDefined();
      expect(result.message).toBe('All notifications marked as read');
      expect(result.total_read).toBe(5);
      expect(Notification.update).toHaveBeenCalled();
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      const userId = 1;
      const notificationId = 1;
      
      const mockNotification = {
        id: notificationId,
        user_id: userId,
        destroy: jest.fn().mockResolvedValue()
      };
      
      Notification.findOne.mockResolvedValue(mockNotification);
      
      const result = await notificationService.deleteNotification(notificationId, userId);
      
      expect(result).toBeDefined();
      expect(result.message).toBe('Notification deleted successfully');
      expect(mockNotification.destroy).toHaveBeenCalled();
    });

    it('should throw error if notification not found', async () => {
      Notification.findOne.mockResolvedValue(null);
      
      await expect(notificationService.deleteNotification(999, 1))
        .rejects.toThrow('Notification not found');
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      const userId = 1;
      
      Notification.count.mockResolvedValue(5);
      
      const result = await notificationService.getUnreadCount(userId);
      
      expect(result).toBeDefined();
      expect(result.unread_count).toBe(5);
    });
  });

  describe('getNotificationStats', () => {
    it('should return notification stats', async () => {
      const userId = 1;
      
      Notification.count.mockResolvedValueOnce(10);
      Notification.count.mockResolvedValueOnce(5);
      Notification.count.mockResolvedValueOnce(5);
      Notification.findAll.mockResolvedValue([
        { type: 'order', dataValues: { count: 3 } },
        { type: 'payment', dataValues: { count: 5 } },
        { type: 'refund', dataValues: { count: 2 } }
      ]);
      
      const result = await notificationService.getNotificationStats(userId);
      
      expect(result).toBeDefined();
      expect(result.total).toBe(10);
      expect(result.unread).toBe(5);
      expect(result.read).toBe(5);
      expect(result.by_type).toEqual({
        order: 3,
        payment: 5,
        refund: 2
      });
    });
  });
});