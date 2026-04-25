const refundService = require('../../src/services/refundService');
const { Refund } = require('../../src/models');

jest.mock('../../src/models');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
}));

describe('RefundService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRefundById', () => {
    it('should return refund by id', async () => {
      const refundId = 1;
      
      const mockRefund = {
        id: refundId,
        order_id: 1,
        user_id: 1,
        refund_no: 'REF123456789',
        amount: 50.00,
        status: 0
      };
      
      Refund.findByPk.mockResolvedValue(mockRefund);
      
      const result = await refundService.getRefundById(refundId);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(refundId);
      expect(Refund.findByPk).toHaveBeenCalledWith(refundId, expect.any(Object));
    });

    it('should throw error if refund not found', async () => {
      Refund.findByPk.mockResolvedValue(null);
      
      await expect(refundService.getRefundById(999))
        .rejects.toThrow('退款记录不存在');
      expect(Refund.findByPk).toHaveBeenCalledWith(999, expect.any(Object));
    });
  });

  describe('getRefundByRefundNo', () => {
    it('should return refund by refund no', async () => {
      const refundNo = 'REF123456789';
      
      const mockRefund = {
        id: 1,
        refund_no: refundNo,
        order_id: 1,
        user_id: 1,
        amount: 50.00,
        status: 0
      };
      
      Refund.findOne.mockResolvedValue(mockRefund);
      
      const result = await refundService.getRefundByRefundNo(refundNo);
      
      expect(result).toBeDefined();
      expect(result.refund_no).toBe(refundNo);
      expect(Refund.findOne).toHaveBeenCalled();
    });

    it('should throw error if refund not found', async () => {
      Refund.findOne.mockResolvedValue(null);
      
      await expect(refundService.getRefundByRefundNo('NOTEXIST'))
        .rejects.toThrow('退款记录不存在');
    });
  });

  describe('getRefundList', () => {
    it('should return refunds with pagination', async () => {
      const userId = 1;
      const refunds = [
        { id: 1, user_id: 1, order_id: 1, amount: 50.00, status: 0 },
        { id: 2, user_id: 1, order_id: 2, amount: 100.00, status: 0 }
      ];
      
      Refund.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: refunds
      });
      
      const result = await refundService.getRefundList(userId, 1, 20, {});
      
      expect(result).toBeDefined();
      expect(result.total).toBe(2);
      expect(result.list).toHaveLength(2);
    });

    it('should filter refunds by status', async () => {
      const userId = 1;
      const refunds = [
        { id: 1, user_id: 1, order_id: 1, amount: 50.00, status: 0 },
        { id: 2, user_id: 1, order_id: 2, amount: 100.00, status: 0 }
      ];
      
      Refund.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: refunds
      });
      
      const result = await refundService.getRefundList(userId, 1, 20, { status: 0 });
      
      expect(result).toBeDefined();
      expect(result.list).toHaveLength(2);
    });

    it('should filter refunds by keyword', async () => {
      const userId = 1;
      const refunds = [
        { id: 1, user_id: 1, order_id: 1, refund_no: 'REF123456', amount: 50.00, status: 0 },
        { id: 2, user_id: 1, order_id: 2, refund_no: 'REF789012', amount: 100.00, status: 0 }
      ];
      
      Refund.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: refunds
      });
      
      const result = await refundService.getRefundList(userId, 1, 20, { keyword: 'REF123' });
      
      expect(result).toBeDefined();
      expect(result.list).toHaveLength(2);
    });
  });
});