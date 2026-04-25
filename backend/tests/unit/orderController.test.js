const orderController = require('../../src/controllers/orderController');
const orderService = require('../../src/services/orderService');

jest.mock('../../src/services/orderService');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
}));

describe('OrderController', () => {
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

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      req.user = { id: 1 };
      req.body = {
        party_id: 1,
        ticket_type_id: 1,
        quantity: 2
      };

      const mockOrder = {
        id: 1,
        user_id: 1,
        party_id: 1,
        status: 'pending'
      };

      orderService.createOrder.mockResolvedValue(mockOrder);

      await orderController.createOrder(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Order created successfully',
        data: mockOrder
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle create order error', async () => {
      req.user = { id: 1 };
      req.body = { party_id: 1, ticket_type_id: 1 };

      const error = new Error('Create failed');
      orderService.createOrder.mockRejectedValue(error);

      await orderController.createOrder(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getOrderById', () => {
    it('should get order by id successfully', async () => {
      req.params = { id: '1' };

      const mockOrder = {
        id: 1,
        user_id: 1,
        party_id: 1
      };

      orderService.getOrderById.mockResolvedValue(mockOrder);

      await orderController.getOrderById(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrder
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle get order by id error', async () => {
      req.params = { id: '1' };

      const error = new Error('Order not found');
      orderService.getOrderById.mockRejectedValue(error);

      await orderController.getOrderById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getOrderByOrderNo', () => {
    it('should get order by order no successfully', async () => {
      req.params = { orderNo: 'ORD123456' };

      const mockOrder = {
        id: 1,
        order_no: 'ORD123456',
        user_id: 1
      };

      orderService.getOrderByOrderNo.mockResolvedValue(mockOrder);

      await orderController.getOrderByOrderNo(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrder
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle get order by order no error', async () => {
      req.params = { orderNo: 'ORD123456' };

      const error = new Error('Order not found');
      orderService.getOrderByOrderNo.mockRejectedValue(error);

      await orderController.getOrderByOrderNo(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getOrderList', () => {
    it('should get order list successfully', async () => {
      req.user = { id: 1 };
      req.query = {
        page: '1',
        limit: '20',
        status: '1',
        payment_status: '2',
        party_id: '1',
        keyword: 'test'
      };

      const mockResult = {
        total: 10,
        page: 1,
        limit: 20,
        data: [
          { id: 1, order_no: 'ORD001' },
          { id: 2, order_no: 'ORD002' }
        ]
      };

      orderService.getOrderList.mockResolvedValue(mockResult);

      await orderController.getOrderList(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        total: 10,
        page: 1,
        limit: 20,
        data: [
          { id: 1, order_no: 'ORD001' },
          { id: 2, order_no: 'ORD002' }
        ]
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should get order list with default pagination', async () => {
      req.user = { id: 1 };
      req.query = {};

      const mockResult = {
        total: 10,
        page: 1,
        limit: 20,
        data: []
      };

      orderService.getOrderList.mockResolvedValue(mockResult);

      await orderController.getOrderList(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        total: 10,
        page: 1,
        limit: 20,
        data: []
      });
      expect(orderService.getOrderList).toHaveBeenCalledWith(null, 1, 20, {
        status: undefined,
        payment_status: undefined,
        party_id: undefined,
        keyword: undefined,
        user_id: undefined
      });
    });

    it('should handle get order list error', async () => {
      req.user = { id: 1 };
      req.query = { page: '1', limit: '20' };

      const error = new Error('Get list failed');
      orderService.getOrderList.mockRejectedValue(error);

      await orderController.getOrderList(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      req.params = { id: '1' };
      req.user = { id: 1 };
      req.body = { reason: 'Change of plans' };

      const mockOrder = {
        id: 1,
        status: 'cancelled',
        cancel_reason: 'Change of plans'
      };

      orderService.cancelOrder.mockResolvedValue(mockOrder);

      await orderController.cancelOrder(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Order cancelled successfully',
        data: mockOrder
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle cancel order error', async () => {
      req.params = { id: '1' };
      req.user = { id: 1 };
      req.body = { reason: 'Change of plans' };

      const error = new Error('Cancel failed');
      orderService.cancelOrder.mockRejectedValue(error);

      await orderController.cancelOrder(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      req.params = { id: '1' };
      req.body = { status: 2 };

      const mockOrder = {
        id: 1,
        status: 2
      };

      orderService.updateOrderStatus.mockResolvedValue(mockOrder);

      await orderController.updateOrderStatus(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Order status updated successfully',
        data: mockOrder
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle update order status error', async () => {
      req.params = { id: '1' };
      req.body = { status: 2 };

      const error = new Error('Update failed');
      orderService.updateOrderStatus.mockRejectedValue(error);

      await orderController.updateOrderStatus(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('applyRefund', () => {
    it('should apply refund successfully', async () => {
      req.params = { id: '1' };
      req.user = { id: 1 };
      req.body = { reason: 'Event cancelled' };

      const mockRefund = {
        id: 1,
        order_id: 1,
        status: 'pending'
      };

      orderService.applyRefund.mockResolvedValue(mockRefund);

      await orderController.applyRefund(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Refund applied successfully',
        data: mockRefund
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle apply refund error', async () => {
      req.params = { id: '1' };
      req.user = { id: 1 };
      req.body = { reason: 'Event cancelled' };

      const error = new Error('Apply refund failed');
      orderService.applyRefund.mockRejectedValue(error);

      await orderController.applyRefund(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('generateTickets', () => {
    it('should generate tickets successfully', async () => {
      req.params = { id: '1' };

      const mockOrder = {
        id: 1,
        tickets: [
          { id: 1, code: 'TICKET001' },
          { id: 2, code: 'TICKET002' }
        ]
      };

      orderService.generateTickets.mockResolvedValue(mockOrder);

      await orderController.generateTickets(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Tickets generated successfully',
        data: mockOrder
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle generate tickets error', async () => {
      req.params = { id: '1' };

      const error = new Error('Generate tickets failed');
      orderService.generateTickets.mockRejectedValue(error);

      await orderController.generateTickets(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});