const express = require('express');
const router = express.Router();
const ticketController = require('../../controllers/ticketController');
const { auth } = require('../../middleware/auth');
const { Op } = require('sequelize');

// 前端兼容性路由 - 票券统计
// 这些路由对应前端 ticket-stats.ts 的调用

// 获取票券统计概览（不需要认证，返回简单的统计数据）
router.get('/', async (req, res, next) => {
  try {
    const { Ticket, TicketType, Party } = require('../../models');
    
    // 获取所有统计数据（不限制用户）
    const totalTickets = await Ticket.count();
    const usedTickets = await Ticket.count({ where: { status: 1 } });
    const unusedTickets = await Ticket.count({ where: { status: 0 } });
    const expiredTickets = await Ticket.count({
      where: {
        status: { [Op.ne]: 1 },
        expires_at: { [Op.lt]: new Date() }
      }
    });
    
    res.json({
      success: true,
      data: {
        totalTickets,
        usedTickets,
        unusedTickets,
        expiredTickets,
        totalAmount: 0
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/overview', auth, async (req, res, next) => {
  try {
    const { Ticket, TicketType, Order } = require('../../models');
    const userId = req.user.id;
    
    // 获取用户所有票券统计
    const totalTickets = await Ticket.count({ where: { user_id: userId } });
    const usedTickets = await Ticket.count({ where: { user_id: userId, status: 1 } });
    const unusedTickets = await Ticket.count({ where: { user_id: userId, status: 0 } });
    const expiredTickets = await Ticket.count({
      where: {
        user_id: userId,
        status: { [Op.ne]: 1 },
        expires_at: { [Op.lt]: new Date() }
      }
    });
    
    // 计算总消费金额
    const totalAmount = await Order.sum('final_amount', {
      where: {
        user_id: userId,
        payment_status: 1
      }
    }) || 0;
    
    res.json({
      success: true,
      data: {
        totalTickets,
        usedTickets,
        unusedTickets,
        expiredTickets,
        totalAmount: parseFloat(totalAmount)
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/detail', auth, async (req, res, next) => {
  try {
    const { Ticket, TicketType, Party } = require('../../models');
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;
    
    const { count, rows } = await Ticket.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: TicketType,
          as: 'ticket_type',
          attributes: ['id', 'name', 'price']
        },
        {
          model: Party,
          as: 'party',
          attributes: ['id', 'title', 'start_time', 'end_time']
        }
      ],
      order: [['created_at', 'DESC']],
      offset,
      limit: pageSize
    });
    
    res.json({
      success: true,
      data: {
        tickets: rows,
        total: count,
        page,
        pageSize
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/trend', auth, async (req, res, next) => {
  try {
    const { Ticket } = require('../../models');
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 30;
    
    // 生成最近N天的日期数组
    const dates = [];
    const values = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(dateStr);
      
      // 统计每天的票券获取数量
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const count = await Ticket.count({
        where: {
          user_id: userId,
          created_at: {
            [Op.gte]: startOfDay,
            [Op.lte]: endOfDay
          }
        }
      });
      
      values.push(count);
    }
    
    res.json({
      success: true,
      data: {
        dates,
        values
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/usage', auth, async (req, res, next) => {
  try {
    const { Ticket } = require('../../models');
    const userId = req.user.id;
    
    const totalTickets = await Ticket.count({ where: { user_id: userId } });
    const usedTickets = await Ticket.count({ where: { user_id: userId, status: 1 } });
    
    const usageRate = totalTickets > 0 ? (usedTickets / totalTickets * 100).toFixed(2) : 0;
    
    res.json({
      success: true,
      data: {
        usageRate: parseFloat(usageRate),
        totalUsage: usedTickets,
        totalTickets
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', auth, ticketController.getTicketById);

module.exports = router;
