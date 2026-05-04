const { Report, User, Party, Post, Admin } = require('../models');
const logger = require('../utils/logger');

class ReportController {
  /**
   * 创建举报
   */
  async createReport(req, res, next) {
    try {
      const { target_type, target_id, reason, description, evidence } = req.body;
      const reporter_id = req.user.id;

      // 校验必填字段
      if (!target_type || !target_id || !reason) {
        return res.status(400).json({
          success: false,
          message: 'target_type, target_id, reason 为必填项'
        });
      }

      // 校验 target_type 有效性
      const validTypes = ['user', 'party', 'post', 'comment', 'message'];
      if (!validTypes.includes(target_type)) {
        return res.status(400).json({
          success: false,
          message: `无效的 target_type，可选值: ${validTypes.join(', ')}`
        });
      }

      // 校验 reason 有效性
      const validReasons = ['spam', 'harassment', 'fraud', 'inappropriate', 'other'];
      if (!validReasons.includes(reason)) {
        return res.status(400).json({
          success: false,
          message: `无效的 reason，可选值: ${validReasons.join(', ')}`
        });
      }

      // 不能举报自己
      if (target_type === 'user' && parseInt(target_id) === reporter_id) {
        return res.status(400).json({
          success: false,
          message: '不能举报自己'
        });
      }

      // 检查重复举报（同一用户对同一目标）
      const existing = await Report.findOne({
        where: { reporter_id, target_type, target_id }
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: '您已举报过该目标，请勿重复举报',
          data: { report_id: existing.id }
        });
      }

      // 验证目标是否存在
      let targetExists = false;
      try {
        if (target_type === 'user') {
          const user = await User.findByPk(target_id);
          targetExists = !!user;
        } else if (target_type === 'party') {
          const party = await Party.findByPk(target_id);
          targetExists = !!party;
        } else if (target_type === 'post') {
          const post = await Post.findByPk(target_id);
          targetExists = !!post;
        }
        // comment 和 message 暂不做存在性校验（避免复杂查询）
      } catch (e) {
        logger.warn('Report target existence check failed:', e.message);
      }

      if (!targetExists && ['user', 'party', 'post'].includes(target_type)) {
        return res.status(404).json({
          success: false,
          message: '举报目标不存在'
        });
      }

      const report = await Report.create({
        reporter_id,
        target_type,
        target_id: parseInt(target_id),
        reason,
        description,
        evidence: evidence || null,
        status: 'pending'
      });

      logger.info(`Report created: #${report.id} by user ${reporter_id} against ${target_type}#${target_id}`);

      res.status(201).json({
        success: true,
        message: '举报提交成功，我们将尽快处理',
        data: report
      });
    } catch (error) {
      logger.error('Create report error:', error);
      next(error);
    }
  }

  /**
   * 获取我的举报列表
   */
  async getMyReports(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const offset = (page - 1) * pageSize;

      const { count, rows } = await Report.findAndCountAll({
        where: { reporter_id: req.user.id },
        offset,
        limit: pageSize,
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          total: count,
          page,
          pageSize,
          data: rows
        }
      });
    } catch (error) {
      logger.error('Get my reports error:', error);
      next(error);
    }
  }

  /**
   * 获取举报详情（用户只能查看自己的）
   */
  async getReportById(req, res, next) {
    try {
      const report = await Report.findOne({
        where: {
          id: req.params.id,
          reporter_id: req.user.id
        }
      });

      if (!report) {
        return res.status(404).json({
          success: false,
          message: '举报记录不存在'
        });
      }

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Get report by id error:', error);
      next(error);
    }
  }

  /**
   * 管理员 - 获取举报列表
   */
  async getReportList(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const status = req.query.status;
      const target_type = req.query.target_type;
      const offset = (page - 1) * pageSize;

      const where = {};
      if (status) where.status = status;
      if (target_type) where.target_type = target_type;

      const { count, rows } = await Report.findAndCountAll({
        where,
        offset,
        limit: pageSize,
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          total: count,
          page,
          pageSize,
          data: rows
        }
      });
    } catch (error) {
      logger.error('Get report list error:', error);
      next(error);
    }
  }

  /**
   * 管理员 - 获取举报详情
   */
  async getAdminReportById(req, res, next) {
    try {
      const report = await Report.findByPk(req.params.id);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: '举报记录不存在'
        });
      }

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Get admin report by id error:', error);
      next(error);
    }
  }

  /**
   * 管理员 - 处理举报
   */
  async handleReport(req, res, next) {
    try {
      const { status, result, result_note } = req.body;
      const report = await Report.findByPk(req.params.id);

      if (!report) {
        return res.status(404).json({
          success: false,
          message: '举报记录不存在'
        });
      }

      // 校验状态
      const validStatuses = ['pending', 'processing', 'resolved', 'rejected'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `无效的状态，可选值: ${validStatuses.join(', ')}`
        });
      }

      // 校验结果
      const validResults = ['warning', 'ban', 'dismiss', 'delete'];
      if (result && !validResults.includes(result)) {
        return res.status(400).json({
          success: false,
          message: `无效的结果，可选值: ${validResults.join(', ')}`
        });
      }

      report.status = status || report.status;
      report.result = result || report.result;
      report.result_note = result_note || report.result_note;
      report.handled_by = req.user.id;
      report.handled_at = new Date();
      await report.save();

      logger.info(`Report #${report.id} handled by admin ${req.user.id}: status=${report.status}, result=${report.result}`);

      res.json({
        success: true,
        message: '举报处理完成',
        data: report
      });
    } catch (error) {
      logger.error('Handle report error:', error);
      next(error);
    }
  }

  /**
   * 管理员 - 获取举报统计
   */
  async getReportStatistics(req, res, next) {
    try {
      const total = await Report.count();
      const pending = await Report.count({ where: { status: 'pending' } });
      const processing = await Report.count({ where: { status: 'processing' } });
      const resolved = await Report.count({ where: { status: 'resolved' } });
      const rejected = await Report.count({ where: { status: 'rejected' } });

      // 按类型统计
      const byType = {};
      const types = ['user', 'party', 'post', 'comment', 'message'];
      for (const type of types) {
        byType[type] = await Report.count({ where: { target_type: type } });
      }

      // 按原因统计
      const byReason = {};
      const reasons = ['spam', 'harassment', 'fraud', 'inappropriate', 'other'];
      for (const reason of reasons) {
        byReason[reason] = await Report.count({ where: { reason } });
      }

      res.json({
        success: true,
        data: {
          total,
          pending,
          processing,
          resolved,
          rejected,
          byType,
          byReason
        }
      });
    } catch (error) {
      logger.error('Get report statistics error:', error);
      next(error);
    }
  }

  /**
   * 获取目标的举报次数（内部API，供适配器使用）
   */
  async getTargetReportCount(target_type, target_id) {
    try {
      const count = await Report.count({
        where: {
          target_type,
          target_id: parseInt(target_id),
          status: ['pending', 'processing', 'resolved']
        }
      });
      return count;
    } catch (error) {
      logger.error('Get target report count error:', error);
      return 0;
    }
  }
}

module.exports = new ReportController();