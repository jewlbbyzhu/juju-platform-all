const paymentService = require('../../src/services/paymentService');
const { Payment, Order } = require('../../src/models');

jest.mock('../../src/models');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
}));

describe('PaymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPayment', () => {
    it('should create payment successfully', async () => {
      const orderId = 1;
      const paymentMethod = 'wechat';
      const userId = 1;
      
      const mockOrder = {
        id: orderId,
        order_no: 'ORD123456789',
        final_amount: 100.00,
        payment_status: 0,
        status: 0
      };
      
      Order.findByPk.mockResolvedValue(mockOrder);
      Payment.findOne.mockResolvedValue(null);
      
      const mockPayment = {
        id: 1,
        order_id: orderId,
        user_id: userId,
        payment_no: 'PAY1234567890',
        payment_method: paymentMethod,
        amount: 100.00,
        status: 0
      };
      
      Payment.create.mockResolvedValue(mockPayment);
      
      const result = await paymentService.createPayment(orderId, paymentMethod, userId);
      
      expect(result).toBeDefined();
      expect(result.order_id).toBe(orderId);
      expect(result.payment_method).toBe(paymentMethod);
      expect(result.amount).toBe(100.00);
      expect(Order.findByPk).toHaveBeenCalledWith(orderId);
      expect(Payment.create).toHaveBeenCalled();
    });

    it('should throw error if order not found', async () => {
      Order.findByPk.mockResolvedValue(null);
      
      await expect(paymentService.createPayment(999, 'wechat', 1))
        .rejects.toThrow('Order not found');
      expect(Order.findByPk).toHaveBeenCalledWith(999);
    });

    it('should throw error if order already paid', async () => {
      const orderId = 1;
      
      const mockOrder = {
        id: orderId,
        payment_status: 1,
        status: 0
      };
      
      Order.findByPk.mockResolvedValue(mockOrder);
      
      await expect(paymentService.createPayment(orderId, 'wechat', 1))
        .rejects.toThrow('Order already paid');
    });

    it('should return existing payment if exists', async () => {
      const orderId = 1;
      const paymentMethod = 'wechat';
      const userId = 1;
      
      const mockOrder = {
        id: orderId,
        final_amount: 100.00,
        payment_status: 0,
        status: 0
      };
      
      const mockExistingPayment = {
        id: 1,
        order_id: orderId,
        user_id: userId,
        payment_no: 'PAY1234567890',
        payment_method: paymentMethod,
        amount: 100.00,
        status: 0
      };
      
      Order.findByPk.mockResolvedValue(mockOrder);
      Payment.findOne.mockResolvedValue(mockExistingPayment);
      
      const result = await paymentService.createPayment(orderId, paymentMethod, userId);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(mockExistingPayment.id);
      expect(Payment.create).not.toHaveBeenCalled();
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status successfully', async () => {
      const paymentId = 1;
      const status = 1;
      const transactionId = 'TXN123456789';
      
      const mockPayment = {
        id: paymentId,
        order_id: 1,
        user_id: 1,
        payment_no: 'PAY1234567890',
        payment_method: 'wechat',
        amount: 100.00,
        status: 0,
        save: jest.fn().mockResolvedValue()
      };
      
      Payment.findByPk.mockResolvedValue(mockPayment);
      
      const result = await paymentService.updatePaymentStatus(paymentId, status, transactionId);
      
      expect(result).toBeDefined();
      expect(result.status).toBe(status);
      expect(result.transaction_id).toBe(transactionId);
      expect(result.payment_time).toBeDefined();
      expect(mockPayment.save).toHaveBeenCalled();
    });

    it('should throw error if payment not found', async () => {
      Payment.findByPk.mockResolvedValue(null);
      
      await expect(paymentService.updatePaymentStatus(999, 1, 'TXN123'))
        .rejects.toThrow('Payment not found');
    });

    it('should update payment status without transaction id', async () => {
      const paymentId = 1;
      const status = 1;
      
      const mockPayment = {
        id: paymentId,
        order_id: 1,
        user_id: 1,
        payment_no: 'PAY1234567890',
        payment_method: 'wechat',
        amount: 100.00,
        status: 0,
        save: jest.fn().mockResolvedValue()
      };
      
      Payment.findByPk.mockResolvedValue(mockPayment);
      
      const result = await paymentService.updatePaymentStatus(paymentId, status, null);
      
      expect(result).toBeDefined();
      expect(result.status).toBe(status);
      expect(result.transaction_id).toBeUndefined();
      expect(mockPayment.save).toHaveBeenCalled();
    });
  });
});