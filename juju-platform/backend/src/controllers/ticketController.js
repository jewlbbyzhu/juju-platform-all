const ticketService = require('../services/ticketService');
const logger = require('../utils/logger');

class TicketController {
  async getUserTickets(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.pageSize) || 20;
      const { count, rows } = await ticketService.getUserTickets(req.user.id, page, limit);
      
      res.json({
        success: true,
        data: {
          total: count,
          page: parseInt(page),
          pageSize: parseInt(limit),
          data: rows
        }
      });
    } catch (error) {
      logger.error('Get user tickets error:', error);
      next(error);
    }
  }

  async getUserTicketById(req, res, next) {
    try {
      const ticket = await ticketService.getTicketById(req.params.id, req.user.id);
      
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
      }
      
      res.json({
        success: true,
        data: ticket
      });
    } catch (error) {
      logger.error('Get user ticket by ID error:', error);
      next(error);
    }
  }

  async getTicketById(req, res, next) {
    try {
      const ticket = await ticketService.getTicketById(req.params.id);
      res.json({
        success: true,
        data: ticket
      });
    } catch (error) {
      logger.error('Get ticket by ID error:', error);
      next(error);
    }
  }

  async getTicketByCode(req, res, next) {
    try {
      const ticket = await ticketService.getTicketByCode(req.params.code);
      res.json({
        success: true,
        data: ticket
      });
    } catch (error) {
      logger.error('Get ticket by code error:', error);
      next(error);
    }
  }

  async getTicketList(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.pageSize) || parseInt(req.query.limit) || 20;
      const filters = {
        status: req.query.status ? parseInt(req.query.status) : undefined,
        party_id: req.query.party_id ? parseInt(req.query.party_id) : undefined,
        ticket_type_id: req.query.ticket_type_id ? parseInt(req.query.ticket_type_id) : undefined,
        keyword: req.query.keyword
      };

      const result = await ticketService.getTicketList(req.user.id, page, limit, filters);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get ticket list error:', error);
      next(error);
    }
  }

  async verifyTicket(req, res, next) {
    try {
      const { code } = req.body;
      const result = await ticketService.verifyTicket(code);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Verify ticket error:', error);
      next(error);
    }
  }

  async useTicket(req, res, next) {
    try {
      const { code } = req.body;
      const ticket = await ticketService.useTicket(code, req.user.id);
      res.json({
        success: true,
        message: 'Ticket used successfully',
        data: ticket
      });
    } catch (error) {
      logger.error('Use ticket error:', error);
      next(error);
    }
  }

  async invalidateTicket(req, res, next) {
    try {
      const { reason } = req.body;
      const ticket = await ticketService.invalidateTicket(req.params.id, reason, req.user.id);
      res.json({
        success: true,
        message: 'Ticket invalidated successfully',
        data: ticket
      });
    } catch (error) {
      logger.error('Invalidate ticket error:', error);
      next(error);
    }
  }

  async checkExpiredTickets(req, res, next) {
    try {
      const result = await ticketService.checkExpiredTickets();
      res.json({
        success: true,
        message: result.message,
        data: { count: result.count }
      });
    } catch (error) {
      logger.error('Check expired tickets error:', error);
      next(error);
    }
  }

  async getTicketStats(req, res, next) {
    try {
      const stats = await ticketService.getTicketStats(req.user.id);
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get ticket stats error:', error);
      next(error);
    }
  }

  // 以下方法为占位实现，需要根据实际需求完善
  async createTicket(req, res, next) {
    try {
      logger.info('Create ticket:', req.body);
      res.status(501).json({
        success: false,
        message: '功能开发中'
      });
    } catch (error) {
      logger.error('Create ticket error:', error);
      next(error);
    }
  }

  async updateTicket(req, res, next) {
    try {
      logger.info('Update ticket:', req.params.id, req.body);
      res.status(501).json({
        success: false,
        message: '功能开发中'
      });
    } catch (error) {
      logger.error('Update ticket error:', error);
      next(error);
    }
  }

  async deleteTicket(req, res, next) {
    try {
      logger.info('Delete ticket:', req.params.id);
      res.status(501).json({
        success: false,
        message: '功能开发中'
      });
    } catch (error) {
      logger.error('Delete ticket error:', error);
      next(error);
    }
  }
}

module.exports = new TicketController();
