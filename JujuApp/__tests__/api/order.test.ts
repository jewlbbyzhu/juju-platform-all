import { orderApi, paymentApi, CreateOrderParams } from '../../src/api/order';
import api from '../../src/api/index';

// Mock api
jest.mock('../../src/api/index', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('orderApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrders', () => {
    it('should get orders with default params', async () => {
      const mockOrders = {
        data: [
          { id: 1, order_no: 'ORD001', status: 'paid' },
          { id: 2, order_no: 'ORD002', status: 'pending' },
        ],
      };
      (api.get as jest.Mock).mockResolvedValue(mockOrders);

      const result = await orderApi.getOrders();

      expect(api.get).toHaveBeenCalledWith('/orders', { params: {} });
      expect(result).toEqual(mockOrders);
    });

    it('should get orders with custom params', async () => {
      const mockOrders = { data: [{ id: 1, status: 'paid' }] };
      (api.get as jest.Mock).mockResolvedValue(mockOrders);

      const params = { page: 1, pageSize: 10, status: 'paid' };
      await orderApi.getOrders(params);

      expect(api.get).toHaveBeenCalledWith('/orders', { params });
    });

    it('should handle empty orders list', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: [] });

      const result = await orderApi.getOrders();

      expect(result.data).toEqual([]);
    });
  });

  describe('getOrderDetail', () => {
    it('should get order detail by number id', async () => {
      const mockOrder = {
        data: {
          id: 1,
          order_no: 'ORD001',
          user_id: 1,
          party_id: 1,
          status: 'paid',
          total_amount: 200,
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockOrder);

      const result = await orderApi.getOrderDetail(1);

      expect(api.get).toHaveBeenCalledWith('/orders/1');
      expect(result).toEqual(mockOrder);
    });

    it('should get order detail by string id', async () => {
      const mockOrder = { data: { id: 'abc', order_no: 'ORD002' } };
      (api.get as jest.Mock).mockResolvedValue(mockOrder);

      await orderApi.getOrderDetail('abc');

      expect(api.get).toHaveBeenCalledWith('/orders/abc');
    });

    it('should handle order not found', async () => {
      (api.get as jest.Mock).mockRejectedValue({
        response: { status: 404, data: { message: '订单不存在' } },
      });

      await expect(orderApi.getOrderDetail(999)).rejects.toBeDefined();
    });
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const createParams: CreateOrderParams = {
        party_id: 1,
        ticket_id: 1,
        name: '张三',
        phone: '13800138000',
        gender: 1,
        quantity: 2,
      };
      const mockResponse = {
        data: {
          id: 1,
          order_no: 'ORD001',
          ...createParams,
          status: 'pending',
        },
      };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await orderApi.createOrder(createParams);

      expect(api.post).toHaveBeenCalledWith('/orders', createParams);
      expect(result).toEqual(mockResponse);
    });

    it('should create order with remark', async () => {
      const createParams: CreateOrderParams = {
        party_id: 2,
        ticket_id: 2,
        name: '李四',
        phone: '13900139000',
        gender: 2,
        remark: '请安排前排座位',
        quantity: 1,
      };
      (api.post as jest.Mock).mockResolvedValue({ data: { id: 2 } });

      await orderApi.createOrder(createParams);

      expect(api.post).toHaveBeenCalledWith('/orders', createParams);
    });

    it('should handle validation error', async () => {
      const invalidParams = {
        party_id: 1,
        ticket_id: 1,
        name: '',
        phone: 'invalid',
        gender: 1,
      };
      (api.post as jest.Mock).mockRejectedValue({
        response: { status: 400, data: { message: '参数错误' } },
      });

      await expect(orderApi.createOrder(invalidParams as any)).rejects.toBeDefined();
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      const mockResponse = { data: { success: true, status: 'cancelled' } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await orderApi.cancelOrder(1);

      expect(api.post).toHaveBeenCalledWith('/orders/1/cancel');
      expect(result).toEqual(mockResponse);
    });

    it('should handle cancel non-pending order', async () => {
      (api.post as jest.Mock).mockRejectedValue({
        response: { status: 400, data: { message: '只能取消待支付订单' } },
      });

      await expect(orderApi.cancelOrder(1)).rejects.toBeDefined();
    });
  });

  describe('createPayment', () => {
    it('should create payment successfully', async () => {
      const paymentData = { payment_method: 'wechat', openid: 'user_openid' };
      const mockResponse = {
        data: {
          prepay_id: 'prepay_123',
          nonce_str: 'random_string',
          timestamp: '1234567890',
          sign: 'signature',
        },
      };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await orderApi.createPayment(1, paymentData);

      expect(api.post).toHaveBeenCalledWith('/orders/1/pay', paymentData);
      expect(result).toEqual(mockResponse);
    });

    it('should create payment with alipay', async () => {
      const paymentData = { payment_method: 'alipay' };
      (api.post as jest.Mock).mockResolvedValue({ data: { order_str: 'alipay_str' } });

      await orderApi.createPayment(2, paymentData);

      expect(api.post).toHaveBeenCalledWith('/orders/2/pay', paymentData);
    });
  });

  describe('queryPaymentStatus', () => {
    it('should query payment status successfully', async () => {
      const mockResponse = { data: { status: 'paid', paid_at: '2025-03-15T12:00:00' } };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await orderApi.queryPaymentStatus(1);

      expect(api.get).toHaveBeenCalledWith('/orders/1/payment-status');
      expect(result).toEqual(mockResponse);
    });

    it('should return pending status', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { status: 'pending' } });

      const result = await orderApi.queryPaymentStatus(1);

      expect(result.data.status).toBe('pending');
    });
  });

  describe('applyRefund', () => {
    it('should apply refund successfully', async () => {
      const reason = '临时有事无法参加';
      const mockResponse = { data: { refund_id: 'REF001', status: 'processing' } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await orderApi.applyRefund(1, reason);

      expect(api.post).toHaveBeenCalledWith('/orders/1/refund', { reason });
      expect(result).toEqual(mockResponse);
    });

    it('should handle refund application failure', async () => {
      (api.post as jest.Mock).mockRejectedValue({
        response: { status: 400, data: { message: '该订单不可退款' } },
      });

      await expect(orderApi.applyRefund(1, '原因')).rejects.toBeDefined();
    });
  });

  describe('getOrderStats', () => {
    it('should get order statistics', async () => {
      const mockStats = {
        data: {
          total_orders: 10,
          total_spent: 1000,
          pending_count: 2,
          paid_count: 8,
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockStats);

      const result = await orderApi.getOrderStats();

      expect(api.get).toHaveBeenCalledWith('/orders/stats');
      expect(result).toEqual(mockStats);
    });
  });

  describe('getOrderTickets', () => {
    it('should get tickets for order', async () => {
      const mockTickets = {
        data: [
          { id: 1, ticket_no: 'TKT001', status: 'unused' },
          { id: 2, ticket_no: 'TKT002', status: 'unused' },
        ],
      };
      (api.get as jest.Mock).mockResolvedValue(mockTickets);

      const result = await orderApi.getOrderTickets(1);

      expect(api.get).toHaveBeenCalledWith('/orders/1/tickets');
      expect(result).toEqual(mockTickets);
    });
  });
});

describe('paymentApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPaymentMethods', () => {
    it('should get available payment methods', async () => {
      const mockMethods = {
        data: [
          { id: 'wechat', name: '微信支付', icon: 'wechat.png' },
          { id: 'alipay', name: '支付宝', icon: 'alipay.png' },
        ],
      };
      (api.get as jest.Mock).mockResolvedValue(mockMethods);

      const result = await paymentApi.getPaymentMethods();

      expect(api.get).toHaveBeenCalledWith('/payments/methods');
      expect(result).toEqual(mockMethods);
    });
  });

  describe('createPayment', () => {
    it('should create payment for order', async () => {
      const paymentData = { payment_method: 'wechat' };
      const mockResponse = { data: { payment_id: 'PAY001', status: 'pending' } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await paymentApi.createPayment(1, paymentData);

      expect(api.post).toHaveBeenCalledWith('/payments', { order_id: 1, ...paymentData });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('queryPayment', () => {
    it('should query payment by id', async () => {
      const mockPayment = {
        data: {
          id: 'PAY001',
          order_id: 1,
          status: 'success',
          amount: 100,
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockPayment);

      const result = await paymentApi.queryPayment('PAY001');

      expect(api.get).toHaveBeenCalledWith('/payments/PAY001');
      expect(result).toEqual(mockPayment);
    });
  });
});
