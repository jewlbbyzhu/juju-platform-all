const paymentController = require('../../src/controllers/paymentController');
const paymentService = require('../../src/services/paymentService');

jest.mock('../../src/services/paymentService');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
}));

describe('PaymentController', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 1, openid: 'test_openid' }
    };
    res = {
      json: jest.fn(),
      send: jest.fn(),
      type: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('createPayment', () => {
    it('should create wechat payment successfully', async () => {
      req.user = { id: 1, openid: 'test_openid' };
      req.body = {
        order_id: 1,
        payment_method: 'wechat'
      };

      const mockPayment = {
        id: 1,
        order_id: 1,
        payment_method: 'wechat'
      };

      const mockResult = {
        payment: mockPayment,
        payment_url: 'https://pay.weixin.qq.com/...'
      };

      paymentService.createPayment.mockResolvedValue(mockPayment);
      paymentService.processWechatPayment.mockResolvedValue(mockResult);

      await paymentController.createPayment(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Payment created successfully',
        data: mockResult
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should create alipay payment successfully', async () => {
      req.user = { id: 1 };
      req.body = {
        order_id: 1,
        payment_method: 'alipay'
      };

      const mockPayment = {
        id: 1,
        order_id: 1,
        payment_method: 'alipay'
      };

      const mockResult = {
        payment: mockPayment,
        payment_url: 'https://openapi.alipay.com/...'
      };

      paymentService.createPayment.mockResolvedValue(mockPayment);
      paymentService.processAlipayPayment.mockResolvedValue(mockResult);

      await paymentController.createPayment(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Payment created successfully',
        data: mockResult
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should create wallet payment successfully', async () => {
      req.user = { id: 1 };
      req.body = {
        order_id: 1,
        payment_method: 'wallet'
      };

      const mockPayment = {
        id: 1,
        order_id: 1,
        payment_method: 'wallet'
      };

      const mockResult = {
        payment: mockPayment,
        wallet: { id: 1, balance: 900 }
      };

      paymentService.createPayment.mockResolvedValue(mockPayment);
      paymentService.processWalletPayment.mockResolvedValue(mockResult);

      await paymentController.createPayment(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Payment created successfully',
        data: mockResult
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle invalid payment method', async () => {
      req.user = { id: 1 };
      req.body = {
        order_id: 1,
        payment_method: 'invalid'
      };

      const mockPayment = {
        id: 1,
        order_id: 1
      };

      paymentService.createPayment.mockResolvedValue(mockPayment);

      await paymentController.createPayment(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid payment method'
      }));
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should handle create payment error', async () => {
      req.user = { id: 1 };
      req.body = {
        order_id: 1,
        payment_method: 'wechat'
      };

      const error = new Error('Create payment failed');
      paymentService.createPayment.mockRejectedValue(error);

      await paymentController.createPayment(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getPayment', () => {
    it('should get payment successfully', async () => {
      req.params = { id: '1' };

      const mockPayment = {
        id: 1,
        order_id: 1,
        payment_method: 'wechat'
      };

      paymentService.queryPayment.mockResolvedValue(mockPayment);

      await paymentController.getPayment(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPayment
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle get payment error', async () => {
      req.params = { id: '1' };

      const error = new Error('Payment not found');
      paymentService.queryPayment.mockRejectedValue(error);

      await paymentController.getPayment(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('wechatNotify', () => {
    it('should handle wechat notify successfully', async () => {
      req.body = {
        transaction_id: 'TX123456',
        out_trade_no: 'ORD123456'
      };

      const mockResult = '<xml><return_code><![CDATA[SUCCESS]]></return_code></xml>';

      paymentService.handleWechatNotify.mockResolvedValue(mockResult);

      await paymentController.wechatNotify(req, res, next);

      expect(res.type).toHaveBeenCalledWith('application/xml');
      expect(res.send).toHaveBeenCalledWith(mockResult);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle wechat notify error', async () => {
      req.body = { transaction_id: 'TX123456' };

      const error = new Error('Notify failed');
      paymentService.handleWechatNotify.mockRejectedValue(error);

      await paymentController.wechatNotify(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.send).not.toHaveBeenCalled();
    });
  });

  describe('alipayNotify', () => {
    it('should handle alipay notify successfully', async () => {
      req.body = {
        trade_no: 'TX123456',
        out_trade_no: 'ORD123456'
      };

      const mockResult = 'success';

      paymentService.handleAlipayNotify.mockResolvedValue(mockResult);

      await paymentController.alipayNotify(req, res, next);

      expect(res.send).toHaveBeenCalledWith(mockResult);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle alipay notify error', async () => {
      req.body = { trade_no: 'TX123456' };

      const error = new Error('Notify failed');
      paymentService.handleAlipayNotify.mockRejectedValue(error);

      await paymentController.alipayNotify(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.send).not.toHaveBeenCalled();
    });
  });

  describe('queryPayment', () => {
    it('should query payment successfully', async () => {
      req.params = { id: '1' };

      const mockPayment = {
        id: 1,
        order_id: 1,
        payment_method: 'wechat',
        status: 'paid'
      };

      paymentService.queryPayment.mockResolvedValue(mockPayment);

      await paymentController.queryPayment(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPayment
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle query payment error', async () => {
      req.params = { id: '1' };

      const error = new Error('Payment not found');
      paymentService.queryPayment.mockRejectedValue(error);

      await paymentController.queryPayment(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});