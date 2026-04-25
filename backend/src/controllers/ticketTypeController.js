const { TicketType, Party, Order, OrderItem } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class TicketTypeController {
  /**
   * 获取聚会下的所有票种
   */
  async getTicketTypesByParty(req, res, next) {
    try {
      const { partyId } = req.params;
      
      const party = await Party.findByPk(partyId);
      if (!party) {
        return res.status(404).json({
          success: false,
          message: 'Party not found'
        });
      }

      const ticketTypes = await TicketType.findAll({
        where: {
          party_id: partyId,
          status: 1
        },
        order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
      });

      // 计算每个票种的剩余库存
      const ticketTypesWithInventory = ticketTypes.map(tt => {
        const plain = tt.get({ plain: true });
        const remaining = plain.available_count - plain.sold_count;
        return {
          ...plain,
          remaining_count: remaining > 0 ? remaining : 0,
          is_sold_out: remaining <= 0,
          is_available: remaining > 0 && plain.status === 1
        };
      });

      res.json({
        success: true,
        data: ticketTypesWithInventory
      });
    } catch (error) {
      logger.error('Get ticket types by party error:', error);
      next(error);
    }
  }

  /**
   * 获取单个票种详情
   */
  async getTicketTypeById(req, res, next) {
    try {
      const { id } = req.params;
      
      const ticketType = await TicketType.findByPk(id, {
        include: [
          {
            model: Party,
            as: 'party',
            attributes: ['id', 'title', 'start_time', 'end_time', 'status']
          }
        ]
      });

      if (!ticketType) {
        return res.status(404).json({
          success: false,
          message: 'Ticket type not found'
        });
      }

      const plain = ticketType.get({ plain: true });
      const remaining = plain.available_count - plain.sold_count;
      
      res.json({
        success: true,
        data: {
          ...plain,
          remaining_count: remaining > 0 ? remaining : 0,
          is_sold_out: remaining <= 0,
          is_available: remaining > 0 && plain.status === 1 && plain.party.status === 1
        }
      });
    } catch (error) {
      logger.error('Get ticket type by ID error:', error);
      next(error);
    }
  }

  /**
   * 创建票种
   */
  async createTicketType(req, res, next) {
    try {
      const {
        party_id,
        name,
        description,
        type,
        price,
        original_price,
        available_count,
        max_per_user,
        sale_start_time,
        sale_end_time,
        early_bird_deadline,
        sort_order
      } = req.body;

      // 验证聚会是否存在
      const party = await Party.findByPk(party_id);
      if (!party) {
        return res.status(404).json({
          success: false,
          message: 'Party not found'
        });
      }

      // 验证权限：只有聚会创建者或管理员可以创建票种
      if (party.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Only party creator or admin can create ticket types'
        });
      }

      // 检查票种名称是否重复
      const existingTicketType = await TicketType.findOne({
        where: {
          party_id,
          name
        }
      });

      if (existingTicketType) {
        return res.status(400).json({
          success: false,
          message: 'Ticket type with this name already exists for this party'
        });
      }

      const ticketType = await TicketType.create({
        party_id,
        name,
        description,
        type: type || 1,
        price,
        original_price: original_price || price,
        available_count: available_count || 0,
        sold_count: 0,
        max_per_user: max_per_user || 0,
        sale_start_time,
        sale_end_time,
        early_bird_deadline,
        status: 1,
        sort_order: sort_order || 0
      });

      res.status(201).json({
        success: true,
        message: 'Ticket type created successfully',
        data: ticketType
      });
    } catch (error) {
      logger.error('Create ticket type error:', error);
      next(error);
    }
  }

  /**
   * 更新票种
   */
  async updateTicketType(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const ticketType = await TicketType.findByPk(id, {
        include: [
          {
            model: Party,
            as: 'party',
            attributes: ['id', 'user_id']
          }
        ]
      });

      if (!ticketType) {
        return res.status(404).json({
          success: false,
          message: 'Ticket type not found'
        });
      }

      // 验证权限
      if (ticketType.party.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Only party creator or admin can update ticket types'
        });
      }

      // 不允许直接修改已售数量
      const allowedFields = [
        'name',
        'description',
        'type',
        'price',
        'original_price',
        'available_count',
        'max_per_user',
        'sale_start_time',
        'sale_end_time',
        'early_bird_deadline',
        'status',
        'sort_order'
      ];

      const updates = {};
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      }

      // 如果修改了 available_count，需要确保不小于 sold_count
      if (updates.available_count !== undefined && updates.available_count < ticketType.sold_count) {
        return res.status(400).json({
          success: false,
          message: 'Available count cannot be less than sold count'
        });
      }

      await ticketType.update(updates);

      res.json({
        success: true,
        message: 'Ticket type updated successfully',
        data: ticketType
      });
    } catch (error) {
      logger.error('Update ticket type error:', error);
      next(error);
    }
  }

  /**
   * 删除票种
   */
  async deleteTicketType(req, res, next) {
    try {
      const { id } = req.params;

      const ticketType = await TicketType.findByPk(id, {
        include: [
          {
            model: Party,
            as: 'party',
            attributes: ['id', 'user_id']
          }
        ]
      });

      if (!ticketType) {
        return res.status(404).json({
          success: false,
          message: 'Ticket type not found'
        });
      }

      // 验证权限
      if (ticketType.party.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Only party creator or admin can delete ticket types'
        });
      }

      // 检查是否已有订单使用该票种
      const orderItemCount = await OrderItem.count({
        where: { ticket_type_id: id }
      });

      if (orderItemCount > 0) {
        // 如果有订单使用，软删除（将状态设为0）
        await ticketType.update({ status: 0 });
        res.json({
          success: true,
          message: 'Ticket type has been deactivated (has associated orders)'
        });
      } else {
        // 没有订单使用，硬删除
        await ticketType.destroy();
        res.json({
          success: true,
          message: 'Ticket type deleted successfully'
        });
      }
    } catch (error) {
      logger.error('Delete ticket type error:', error);
      next(error);
    }
  }

  /**
   * 检查票种库存
   */
  async checkInventory(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity = 1 } = req.query;

      const ticketType = await TicketType.findByPk(id);

      if (!ticketType) {
        return res.status(404).json({
          success: false,
          message: 'Ticket type not found'
        });
      }

      const remaining = ticketType.available_count - ticketType.sold_count;
      const requested = parseInt(quantity);
      const hasEnough = remaining >= requested;

      res.json({
        success: true,
        data: {
          ticket_type_id: id,
          available_count: ticketType.available_count,
          sold_count: ticketType.sold_count,
          remaining_count: remaining,
          requested_count: requested,
          has_enough: hasEnough,
          can_purchase: hasEnough && ticketType.status === 1
        }
      });
    } catch (error) {
      logger.error('Check inventory error:', error);
      next(error);
    }
  }

  /**
   * 批量更新票种状态
   */
  async batchUpdateStatus(req, res, next) {
    try {
      const { ids, status } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'ids must be a non-empty array'
        });
      }

      if (![0, 1].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'status must be 0 (inactive) or 1 (active)'
        });
      }

      // 验证所有票种是否属于同一聚会
      const ticketTypes = await TicketType.findAll({
        where: { id: { [Op.in]: ids } },
        include: [
          {
            model: Party,
            as: 'party',
            attributes: ['id', 'user_id']
          }
        ]
      });

      if (ticketTypes.length !== ids.length) {
        return res.status(404).json({
          success: false,
          message: 'Some ticket types not found'
        });
      }

      // 验证权限
      const partyId = ticketTypes[0].party_id;
      const party = ticketTypes[0].party;
      
      if (party.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      await TicketType.update(
        { status },
        { where: { id: { [Op.in]: ids } } }
      );

      res.json({
        success: true,
        message: `${ticketTypes.length} ticket types updated successfully`,
        data: {
          updated_count: ticketTypes.length,
          status
        }
      });
    } catch (error) {
      logger.error('Batch update ticket type status error:', error);
      next(error);
    }
  }
}

module.exports = new TicketTypeController();
