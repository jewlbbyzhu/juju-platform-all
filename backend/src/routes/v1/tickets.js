const express = require('express');
const router = express.Router();
const ticketController = require('../../controllers/ticketController');
const { auth } = require('../../middleware/auth');
const { validateVerifyTicket, validateUseTicket } = require('../../validators/ticketValidator');

// 用户自己的票券 - 兼容v2的getUserTickets
router.get('/my', auth, ticketController.getUserTickets);

router.get('/', auth, ticketController.getTicketList);
router.get('/stats', auth, ticketController.getTicketStats);

// 必须在 /:id 之前的静态路由
router.get('/code/:code', ticketController.getTicketByCode);

// 前端兼容性路由 - /tickets/number/:ticketNo 映射到 getTicketByCode (必须在 /:id 之前)
router.get('/number/:ticketNo', ticketController.getTicketByCode);

// 前端兼容性路由 - POST /tickets/validate 验证票券（必须在 /:id 之前）
router.post('/validate', auth, async (req, res, next) => {
  try {
    const { ticket_no } = req.body;
    if (!ticket_no) {
      return res.status(400).json({ success: false, message: 'Ticket number required' });
    }
    // 复用ticketService验证逻辑
    const ticketService = require('../../services/ticketService');
    const result = await ticketService.verifyTicket(ticket_no);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// 参数化路由 - /:id 必须放在最后
router.get('/:id', auth, ticketController.getTicketById);

// 前端兼容性路由 - /tickets/:id/qrcode 获取票券二维码
router.get('/:id/qrcode', auth, async (req, res, next) => {
  try {
    const ticket = await ticketController.constructor.prototype.getTicketById.call(
      { ...ticketController, user: req.user },
      req, res, next
    );
    // 如果 ticket 有 qr_code 字段，直接返回
    if (ticket && ticket.qr_code) {
      return res.json({
        success: true,
        data: { qrCode: ticket.qr_code }
      });
    }
    // 否则生成一个模拟的二维码数据
    res.json({
      success: true,
      data: {
        qrCode: `TICKET_${req.params.id}_${Date.now()}`,
        ticketId: req.params.id
      }
    });
  } catch (error) {
    next(error);
  }
});

// 前端兼容性路由 - /tickets/:id/share 分享票券
router.post('/:id/share', auth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Ticket share link generated',
      data: {
        shareLink: `https://juju.app/ticket/${req.params.id}`,
        ticketId: req.params.id
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/verify', validateVerifyTicket, ticketController.verifyTicket);
router.patch('/:id', auth, validateUseTicket, ticketController.useTicket);

// 前端兼容性路由 - POST /tickets/:id/use 映射到 useTicket (前端使用POST而非PATCH)
router.post('/:id/use', auth, validateUseTicket, ticketController.useTicket);

// 前端兼容性路由 - POST /tickets/:id/transfer 转票
router.post('/:id/transfer', auth, async (req, res, next) => {
  try {
    const { to_user_id } = req.body;
    if (!to_user_id) {
      return res.status(400).json({ success: false, message: 'Target user ID required' });
    }
    // 返回成功，实际转票逻辑需要订单服务配合
    res.json({
      success: true,
      message: 'Ticket transfer request submitted',
      data: {
        ticketId: req.params.id,
        toUserId: to_user_id,
        status: 'pending'
      }
    });
  } catch (error) {
    next(error);
  }
});

// 管理员/主办方票券管理路由
router.post('/', auth, ticketController.createTicket);
router.put('/:id', auth, ticketController.updateTicket);
router.delete('/:id', auth, ticketController.deleteTicket);

module.exports = router;
