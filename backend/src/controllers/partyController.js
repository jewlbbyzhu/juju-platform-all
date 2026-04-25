/* eslint-disable no-unused-vars */
const partyService = require('../services/partyService');
const logger = require('../utils/logger');
// const { toJSONSafe } = require('../utils/circularRefCleaner'); // 保留以备将来使用

class PartyController {
  async createParty(req, res, next) {
    try {
      const party = await partyService.createParty(req.user.id, req.body);
      res.json({
        success: true,
        message: 'Party created successfully',
        data: party
      });
    } catch (error) {
      logger.error('Create party error:', error);
      next(error);
    }
  }

  async updateParty(req, res, next) {
    try {
      const party = await partyService.updateParty(req.params.id, req.user.id, req.body);
      res.json({
        success: true,
        message: 'Party updated successfully',
        data: party
      });
    } catch (error) {
      logger.error('Update party error:', error);
      next(error);
    }
  }

  async deleteParty(req, res, next) {
    try {
      const result = await partyService.deleteParty(req.params.id, req.user.id);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      logger.error('Delete party error:', error);
      next(error);
    }
  }

  async getPartyById(req, res, next) {
    try {
      const party = await partyService.getPartyById(req.params.id);
      
      if (!party) {
        return res.status(404).json({
          success: false,
          message: 'Party not found',
          code: 'NOT_FOUND'
        });
      }
      
      res.json({
        success: true,
        data: party
      });
    } catch (error) {
      logger.error('Get party by ID error:', error);
      
      if (error.message === 'Party not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'NOT_FOUND'
        });
      }
      
      next(error);
    }
  }

  async getPartyList(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.pageSize) || parseInt(req.query.limit) || 20;
      const filters = {
        status: req.query.status ? parseInt(req.query.status) : undefined,
        audit_status: req.query.audit_status ? parseInt(req.query.audit_status) : undefined,
        category: req.query.category,
        is_featured: req.query.is_featured ? req.query.is_featured === 'true' : undefined,
        is_hot: req.query.is_hot ? req.query.is_hot === 'true' : undefined,
        keyword: req.query.keyword,
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        min_price: req.query.min_price ? parseFloat(req.query.min_price) : undefined,
        max_price: req.query.max_price ? parseFloat(req.query.max_price) : undefined,
        sort_by: req.query.sort_by || req.query.sortBy
      };

      const result = await partyService.getPartyList(page, limit, filters);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      logger.error('Get party list error:', error);
      next(error);
    }
  }

  async getPendingParties(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.pageSize) || parseInt(req.query.limit) || 20;
      const filters = {
        audit_status: 0,
        category: req.query.category,
        keyword: req.query.keyword,
        sort_by: req.query.sortBy || req.query.sort_by
      };
      const result = await partyService.getPartyList(page, limit, filters);
      res.json({ success: true, ...result });
    } catch (error) {
      logger.error('Get pending parties error:', error);
      res.json({ success: true, total: 0, page: 1, pageSize: 20, data: [] });
    }
  }

  async auditParty(req, res, next) {
    try {
      const party = await partyService.auditParty(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Party audited successfully',
        data: party
      });
    } catch (error) {
      logger.error('Audit party error:', error);
      next(error);
    }
  }

  async updatePartyStatus(req, res, next) {
    try {
      const { status } = req.body;
      const party = await partyService.updatePartyStatus(req.params.id, status);
      res.json({
        success: true,
        message: 'Party status updated successfully',
        data: party
      });
    } catch (error) {
      logger.error('Update party status error:', error);
      next(error);
    }
  }

  async getMyParties(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.pageSize) || parseInt(req.query.limit) || 20;
      const result = await partyService.getPartyByUserId(req.user.id, page, limit);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get my parties error:', error);
      next(error);
    }
  }

  async getPublishedParties(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const sortBy = req.query.sortBy;
      const sortOrder = req.query.sortOrder || 'desc';
      const category = req.query.category;
      const minPrice = req.query.minPrice;
      const maxPrice = req.query.maxPrice;
      const participantsMin = req.query.participantsMin;
      const participantsMax = req.query.participantsMax;
      const favorite = req.query.favorite;
      const latitude = req.query.latitude;
      const longitude = req.query.longitude;
      const maxDistance = req.query.maxDistance;

      const result = await partyService.getPublishedParties(page, pageSize, {
        sortBy,
        sortOrder,
        category,
        minPrice,
        maxPrice,
        participantsMin,
        participantsMax,
        favorite,
        latitude,
        longitude,
        maxDistance
      });
      
      const responseData = {
        list: result.data.map((party, index) => {
          const images = Array.isArray(party.images) ? party.images : [];
          const participants = party.orders && party.orders.length > 0
            ? party.orders.map(order => ({
              id: order.user.id,
              avatar: order.user.avatar,
              nickname: order.user.nickname
            }))
            : [];
            // 格式化日期为ISO字符串
          const formatDateTime = (date) => {
            if (!date) return '';
            if (typeof date === 'string') return date;
            if (date instanceof Date) return date.toISOString();
            return '';
          };
            // 调试第一个聚会
          if (index === 0) {
            console.log('DEBUG party.start_time:', party.start_time, 'type:', typeof party.start_time);
          }
          return {
            id: party.id,
            userId: party.user_id,
            title: party.title,
            description: party.description,
            coverImage: party.cover_image,
            images: images,
            image1: party.cover_image || images[0] || null,
            image2: images[1] || null,
            image3: images[2] || null,
            category: parseInt(party.category),
            startTime: formatDateTime(party.start_time),
            endTime: formatDateTime(party.end_time),
            location: party.location,
            address: party.address,
            latitude: party.latitude ? parseFloat(party.latitude) : null,
            longitude: party.longitude ? parseFloat(party.longitude) : null,
            maxParticipants: party.max_participants,
            minAge: party.min_age,
            maxAge: party.max_age,
            genderRestriction: party.gender_restriction || 0,
            currentParticipants: party.current_participants,
            participants: participants,
            minPrice: parseFloat(party.min_price),
            maxPrice: parseFloat(party.max_price),
            status: party.status,
            auditStatus: party.audit_status,
            isFeatured: party.is_featured,
            isHot: party.is_hot,
            createdAt: formatDateTime(party.created_at),
            updatedAt: formatDateTime(party.updated_at)
          };
        }),
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        hasMore: result.page * result.pageSize < result.total
      };
      
      res.json({
        success: true,
        data: responseData
      });
    } catch (error) {
      logger.error('Get published parties error:', error);
      next(error);
    }
  }

  async getUpcomingParties(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const result = await partyService.getUpcomingParties(page, pageSize);
      
      const responseData = {
        list: result.data.map(party => {
          const images = Array.isArray(party.images) ? party.images : [];
          return {
            id: party.id,
            userId: party.user_id,
            title: party.title,
            description: party.description,
            coverImage: party.cover_image,
            images: images,
            image1: party.cover_image || images[0] || null,
            image2: images[1] || null,
            image3: images[2] || null,
            category: parseInt(party.category),
            startTime: party.start_time,
            endTime: party.end_time,
            location: party.location,
            address: party.address,
            latitude: party.latitude ? parseFloat(party.latitude) : null,
            longitude: party.longitude ? parseFloat(party.longitude) : null,
            maxParticipants: party.max_participants,
            minAge: party.min_age,
            maxAge: party.max_age,
            genderRestriction: party.gender_restriction || 0,
            currentParticipants: party.current_participants,
            minPrice: parseFloat(party.min_price),
            maxPrice: parseFloat(party.max_price),
            status: party.status,
            auditStatus: party.audit_status,
            isFeatured: party.is_featured,
            isHot: party.is_hot,
            createdAt: party.created_at,
            updatedAt: party.updated_at
          };
        }),
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        hasMore: result.page * result.pageSize < result.total
      };
      
      res.json({
        success: true,
        data: responseData
      });
    } catch (error) {
      logger.error('Get upcoming parties error:', error);
      next(error);
    }
  }

  async getHotParties(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const result = await partyService.getHotParties(page, pageSize);
      
      const responseData = {
        list: result.data.map(party => {
          const images = Array.isArray(party.images) ? party.images : [];
          return {
            id: party.id,
            userId: party.user_id,
            title: party.title,
            description: party.description,
            coverImage: party.cover_image,
            images: images,
            image1: party.cover_image || images[0] || null,
            image2: images[1] || null,
            image3: images[2] || null,
            category: parseInt(party.category),
            startTime: party.start_time,
            endTime: party.end_time,
            location: party.location,
            address: party.address,
            latitude: party.latitude ? parseFloat(party.latitude) : null,
            longitude: party.longitude ? parseFloat(party.longitude) : null,
            maxParticipants: party.max_participants,
            minAge: party.min_age,
            maxAge: party.max_age,
            genderRestriction: party.gender_restriction || 0,
            currentParticipants: party.current_participants,
            minPrice: parseFloat(party.min_price),
            maxPrice: parseFloat(party.max_price),
            status: party.status,
            auditStatus: party.audit_status,
            isFeatured: party.is_featured,
            isHot: party.is_hot,
            createdAt: party.created_at,
            updatedAt: party.updated_at
          };
        }),
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        hasMore: result.page * result.pageSize < result.total
      };
      
      res.json({
        success: true,
        data: responseData
      });
    } catch (error) {
      logger.error('Get hot parties error:', error);
      next(error);
    }
  }

  async publishParty(req, res, next) {
    try {
      const party = await partyService.publishParty(req.params.id, req.user.id);
      res.json({
        success: true,
        message: 'Party published successfully',
        data: party
      });
    } catch (error) {
      logger.error('Publish party error:', error);
      next(error);
    }
  }

  async cancelParty(req, res, next) {
    try {
      const { reason } = req.body;
      const party = await partyService.cancelParty(req.params.id, req.user.id, reason);
      res.json({
        success: true,
        message: 'Party cancelled successfully',
        data: party
      });
    } catch (error) {
      logger.error('Cancel party error:', error);
      next(error);
    }
  }

  async endParty(req, res, next) {
    try {
      const party = await partyService.endParty(req.params.id, req.user.id);
      res.json({
        success: true,
        message: 'Party ended successfully',
        data: party
      });
    } catch (error) {
      logger.error('End party error:', error);
      next(error);
    }
  }

  async getParticipants(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;
      const result = await partyService.getParticipants(req.params.id, page, pageSize);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get participants error:', error);
      next(error);
    }
  }

  async getPartyStatistics(req, res, next) {
    try {
      const statistics = await partyService.getPartyStatistics(req.params.id);
      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      logger.error('Get party statistics error:', error);
      next(error);
    }
  }

  async getAvailableTickets(req, res, next) {
    try {
      const tickets = await partyService.getAvailableTickets(req.params.id);
      res.json({
        success: true,
        data: tickets
      });
    } catch (error) {
      logger.error('Get available tickets error:', error);
      next(error);
    }
  }

  async checkAvailability(req, res, next) {
    try {
      const availability = await partyService.checkAvailability(req.params.id);
      res.json({
        success: true,
        data: availability
      });
    } catch (error) {
      logger.error('Check availability error:', error);
      next(error);
    }
  }

  async getPartyStats(req, res, next) {
    try {
      const stats = await partyService.getPartyStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Get party stats error:', error);
      next(error);
    }
  }

  async searchParties(req, res, next) {
    try {
      const { keyword, page = 1, pageSize = 20 } = req.query;
      const result = await partyService.searchParties(keyword, page, pageSize);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Search parties error:', error);
      next(error);
    }
  }

  async getPartyAuditHistory(req, res, next) {
    try {
      const history = await partyService.getPartyAuditHistory(req.params.id);
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      logger.error('Get party audit history error:', error);
      next(error);
    }
  }

  async batchAuditParties(req, res, next) {
    try {
      const { ids, audit_status, audit_reason } = req.body;
      const result = await partyService.batchAuditParties(ids, audit_status, audit_reason);
      res.json({
        success: true,
        message: 'Batch audit parties successful',
        data: result
      });
    } catch (error) {
      logger.error('Batch audit parties error:', error);
      next(error);
    }
  }

  async completeParty(req, res, next) {
    try {
      const result = await partyService.completeParty(req.params.id);
      res.json({
        success: true,
        message: 'Party completed successfully',
        data: result
      });
    } catch (error) {
      logger.error('Complete party error:', error);
      next(error);
    }
  }

  async exportParties(req, res, next) {
    try {
      const { status, audit_status, keyword } = req.query;
      const result = await partyService.exportParties({ status, audit_status, keyword });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=parties.xlsx');
      res.send(result);
    } catch (error) {
      logger.error('Export parties error:', error);
      next(error);
    }
  }
}

module.exports = new PartyController();
