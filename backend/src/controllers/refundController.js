const refundService = require('../services/refundService');
const logger = require('../utils/logger');

class RefundController {
  async getRefund(req, res, next) {
    try {
      const refund = await refundService.getRefundById(req.params.id);
      res.json({
        success: true,
        data: refund
      });
    } catch (error) {
      logger.error('Get refund error:', error);
      next(error);
    }
  }

  async getRefundByRefundNo(req, res, next) {
    try {
      const refund = await refundService.getRefundByRefundNo(req.params.refundNo);
      res.json({
        success: true,
        data: refund
      });
    } catch (error) {
      logger.error('Get refund by refund no error:', error);
      next(error);
    }
  }

  async getRefundList(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.pageSize) || parseInt(req.query.limit) || 20;
      const filters = {
        status: req.query.status ? parseInt(req.query.status) : undefined,
        audit_status: req.query.audit_status ? parseInt(req.query.audit_status) : undefined,
        keyword: req.query.keyword
      };

      const result = await refundService.getRefundList(req.user.id, page, limit, filters);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get refund list error:', error);
      next(error);
    }
  }

  async auditRefund(req, res, next) {
    try {
      const { audit_status, audit_reason } = req.body;
      const auditLogService = require('../services/auditLogService');
      
      const refund = await refundService.getRefundById(req.params.id);
      
      await auditLogService.createAuditLog({
        userId: req.user.id,
        action: 'audit_refund',
        entityType: 'refund',
        entityId: req.params.id,
        oldValue: {
          status: refund.status,
          audit_status: refund.audit_status
        },
        newValue: {
          status: audit_status === 1 ? 2 : 3,
          audit_status: audit_status
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      const result = await refundService.auditRefund(req.params.id, audit_status, audit_reason);
      
      res.json({
        success: true,
        message: 'Refund audited successfully',
        data: result
      });
    } catch (error) {
      logger.error('Audit refund error:', error);
      next(error);
    }
  }

  async processRefund(req, res, next) {
    try {
      const refund = await refundService.processRefund(req.params.id);
      res.json({
        success: true,
        message: 'Refund processed successfully',
        data: refund
      });
    } catch (error) {
      logger.error('Process refund error:', error);
      next(error);
    }
  }

  async getRefundStats(req, res, next) {
    try {
      const stats = await refundService.getRefundStats(req.user.id);
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get refund stats error:', error);
      next(error);
    }
  }
}

module.exports = new RefundController();
