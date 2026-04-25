/* eslint-disable no-unused-vars */
const { Ticket, TicketType, Party } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class TicketService {
  async getTicketById(ticketId) {
    try {
      const ticket = await Ticket.findByPk(ticketId, {
        include: [
          {
            model: TicketType,
            as: 'ticket_type'
          },
          {
            model: Party,
            as: 'party',
            include: [
              {
                model: require('../models').User,
                as: 'user',
                attributes: ['id', 'nickname', 'avatar']
              }
            ]
          },
          {
            model: require('../models').User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar']
          }
        ]
      });

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      return ticket;
    } catch (error) {
      logger.error('Get ticket by ID failed:', error);
      throw error;
    }
  }

  async getTicketByCode(ticketCode) {
    try {
      const ticket = await Ticket.findOne({
        where: { ticket_code: ticketCode },
        include: [
          {
            model: TicketType,
            as: 'ticket_type'
          },
          {
            model: Party,
            as: 'party'
          },
          {
            model: require('../models').User,
            as: 'user',
            attributes: ['id', 'nickname', 'avatar']
          }
        ]
      });

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      return ticket;
    } catch (error) {
      logger.error('Get ticket by code failed:', error);
      throw error;
    }
  }

  async getUserTickets(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      const where = { user_id: userId };

      const { count, rows } = await Ticket.findAndCountAll({
        where,
        offset,
        limit,
        include: [
          {
            model: TicketType,
            as: 'ticket_type'
          },
          {
            model: Party,
            as: 'party',
            attributes: ['id', 'title', 'cover_image', 'start_time', 'end_time']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return {
        count,
        rows
      };
    } catch (error) {
      logger.error('Get user tickets failed:', error);
      throw error;
    }
  }

  async getTicketList(userId, page = 1, limit = 20, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const where = {};

      if (userId) {
        where.user_id = userId;
      }

      if (filters.status !== undefined) {
        where.status = filters.status;
      }

      if (filters.party_id) {
        where.party_id = filters.party_id;
      }

      if (filters.ticket_type_id) {
        where.ticket_type_id = filters.ticket_type_id;
      }

      if (filters.keyword) {
        where.ticket_code = { [Op.like]: `%${filters.keyword}%` };
      }

      const { count, rows } = await Ticket.findAndCountAll({
        where,
        offset,
        limit,
        include: [
          {
            model: TicketType,
            as: 'ticket_type'
          },
          {
            model: Party,
            as: 'party',
            attributes: ['id', 'title', 'cover_image', 'start_time', 'end_time']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return {
        total: count,
        page,
        limit,
        data: rows
      };
    } catch (error) {
      logger.error('Get ticket list failed:', error);
      throw error;
    }
  }

  async verifyTicket(ticketCode) {
    try {
      const ticket = await this.getTicketByCode(ticketCode);

      if (ticket.status === 1) {
        throw new Error('Ticket already used');
      }

      if (ticket.status === 2) {
        throw new Error('Ticket expired');
      }

      if (ticket.status === 3) {
        throw new Error('Ticket refunded');
      }

      if (ticket.expires_at && new Date() > ticket.expires_at) {
        ticket.status = 2;
        await ticket.save();
        throw new Error('Ticket expired');
      }

      const party = await Party.findByPk(ticket.party_id);

      // 票券可以在聚会开始前1小时到聚会结束后1小时内验证
      const now = new Date();
      const partyStartTime = new Date(party.start_time);
      const partyEndTime = new Date(party.end_time);
      const oneHourBefore = new Date(partyStartTime.getTime() - 60 * 60 * 1000);
      const oneHourAfter = new Date(partyEndTime.getTime() + 60 * 60 * 1000);

      if (now < oneHourBefore) {
        throw new Error('验票时间未到，请在聚会开始前1小时内验票');
      }

      if (now > oneHourAfter) {
        throw new Error('验票时间已过');
      }

      return {
        ticket: ticket,
        valid: true
      };
    } catch (error) {
      logger.error('Verify ticket failed:', error);
      throw error;
    }
  }

  async useTicket(ticketCode, verifierId) {
    try {
      const ticket = await this.getTicketByCode(ticketCode);

      if (ticket.status !== 0) {
        throw new Error('Ticket cannot be used');
      }

      if (ticket.expires_at && new Date() > ticket.expires_at) {
        ticket.status = 2;
        await ticket.save();
        throw new Error('Ticket expired');
      }

      ticket.status = 1;
      ticket.used_at = new Date();
      await ticket.save();

      return await this.getTicketById(ticket.id);
    } catch (error) {
      logger.error('Use ticket failed:', error);
      throw error;
    }
  }

  async invalidateTicket(ticketId, reason, userId) {
    try {
      const ticket = await Ticket.findByPk(ticketId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }

      if (ticket.user_id !== userId) {
        throw new Error('Unauthorized: You can only invalidate your own tickets');
      }

      if (ticket.status === 1) {
        throw new Error('Ticket already used');
      }

      ticket.status = 3;
      await ticket.save();

      return await this.getTicketById(ticket.id);
    } catch (error) {
      logger.error('Invalidate ticket failed:', error);
      throw error;
    }
  }

  async checkExpiredTickets() {
    try {
      const now = new Date();
      const [affectedCount] = await Ticket.update(
        { status: 2 },
        {
          where: {
            status: 0,
            expires_at: {
              [Op.lt]: now
            }
          }
        }
      );

      return {
        count: affectedCount,
        message: `${affectedCount} tickets expired`
      };
    } catch (error) {
      logger.error('Check expired tickets failed:', error);
      throw error;
    }
  }

  async getTicketStats(userId) {
    try {
      const totalTickets = await Ticket.count({
        where: { user_id: userId }
      });

      const unusedTickets = await Ticket.count({
        where: {
          user_id: userId,
          status: 0
        }
      });

      const usedTickets = await Ticket.count({
        where: {
          user_id: userId,
          status: 1
        }
      });

      const expiredTickets = await Ticket.count({
        where: {
          user_id: userId,
          status: 2
        }
      });

      const refundedTickets = await Ticket.count({
        where: {
          user_id: userId,
          status: 3
        }
      });

      return {
        total: totalTickets,
        unused: unusedTickets,
        used: usedTickets,
        expired: expiredTickets,
        refunded: refundedTickets
      };
    } catch (error) {
      logger.error('Get ticket stats failed:', error);
      throw error;
    }
  }

  async createTicket(ticketData) {
    try {
      const ticket = await Ticket.create(ticketData);
      return ticket;
    } catch (error) {
      logger.error('Create ticket failed:', error);
      throw error;
    }
  }

  async updateTicket(ticketId, updateData) {
    try {
      const ticket = await Ticket.findByPk(ticketId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }
      await ticket.update(updateData);
      return ticket;
    } catch (error) {
      logger.error('Update ticket failed:', error);
      throw error;
    }
  }

  async deleteTicket(ticketId) {
    try {
      const ticket = await Ticket.findByPk(ticketId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }
      await ticket.destroy();
      return { success: true, message: 'Ticket deleted successfully' };
    } catch (error) {
      logger.error('Delete ticket failed:', error);
      throw error;
    }
  }
}

module.exports = new TicketService();
