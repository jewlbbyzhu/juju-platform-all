const express = require('express');
const router = express.Router();
const ticketTypeController = require('../../controllers/ticketTypeController');
const { auth } = require('../../middleware/auth');

// 获取所有票种（公开接口，供前端票种选择器使用）
router.get('/', ticketTypeController.getAllTicketTypes);

// 获取聚会下的所有票种
router.get('/party/:partyId', ticketTypeController.getTicketTypesByParty);

// 获取单个票种详情
router.get('/:id', ticketTypeController.getTicketTypeById);

// 创建票种（需要登录，通常是聚会创建者或管理员）
router.post('/', auth, ticketTypeController.createTicketType);

// 更新票种
router.put('/:id', auth, ticketTypeController.updateTicketType);

// 删除票种
router.delete('/:id', auth, ticketTypeController.deleteTicketType);

// 检查票种库存
router.get('/:id/inventory', ticketTypeController.checkInventory);

// 批量更新票种状态
router.patch('/batch/status', auth, ticketTypeController.batchUpdateStatus);

module.exports = router;
