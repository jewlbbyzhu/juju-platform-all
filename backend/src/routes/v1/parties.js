const express = require('express');
const router = express.Router();
const partyController = require('../../controllers/partyController');
const { auth } = require('../../middleware/auth');

router.get('/', partyController.getPartyList);
// 前端兼容性路由 - /parties/list 和 /party/list 是 /parties 的别名
router.get('/list', partyController.getPartyList);
router.post('/', auth, partyController.createParty);  // 前端调用 POST /parties 创建聚会
router.get('/published', partyController.getPublishedParties);
router.get('/public', partyController.getPublishedParties);
router.get('/upcoming', partyController.getUpcomingParties);
router.get('/hot', partyController.getHotParties);
router.get('/search', partyController.searchParties);
router.get('/my', auth, partyController.getMyParties);
router.get('/participated', auth, partyController.getMyParties);  // 前端调用 /parties/participated，映射到getMyParties

// 前端兼容性路由 - GET /parties/featured 获取精选聚会 (必须在 /:id 之前)
router.get('/featured', partyController.getHotParties);

// 前端兼容性路由 - GET /parties/categories 获取聚会分类 (必须在 /:id 之前)
router.get('/categories', async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: [
        { id: 1, name: '派对', icon: 'party' },
        { id: 2, name: '音乐', icon: 'music' },
        { id: 3, name: '运动', icon: 'sports' },
        { id: 4, name: '美食', icon: 'food' },
        { id: 5, name: '旅行', icon: 'travel' }
      ]
    });
  } catch (error) {
    next(error);
  }
});

// 前端兼容性路由 - GET /parties/themes 获取聚会主题 (必须在 /:id 之前)
router.get('/themes', async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: [
        { id: 1, name: '复古风', icon: 'retro' },
        { id: 2, name: '现代风', icon: 'modern' },
        { id: 3, name: '自然风', icon: 'nature' },
        { id: 4, name: '奢华风', icon: 'luxury' }
      ]
    });
  } catch (error) {
    next(error);
  }
});

// 前端兼容性路由 - GET /parties/reviews 提交评价 (必须在 /:id 之前)
router.post('/reviews', auth, async (req, res, next) => {
  try {
    // TODO: 实现真实评价保存逻辑，当前为临时占位
    res.status(501).json({
      success: false,
      message: '评价功能正在开发中',
      data: req.body
    });
  } catch (error) {
    next(error);
  }
});

// 前端兼容性路由 - GET /parties/tickets/inventory 获取票券库存 (必须在 /:id 之前)
router.get('/tickets/inventory', auth, async (req, res, next) => {
  try {
    // TODO: 实现真实库存查询逻辑，当前为临时占位
    res.status(501).json({
      success: false,
      message: '库存查询功能正在开发中',
      data: {
        inventory: [],
        total: 0
      }
    });
  } catch (error) {
    next(error);
  }
});

  // 前端兼容性路由 - PUT /parties/tickets/:ticketId/status 更新票券状态 (必须在 /:id 之前)
router.put('/tickets/:ticketId/status', auth, async (req, res, next) => {
  try {
    // TODO: 实现真实票券状态更新逻辑，当前为临时占位
    res.status(501).json({
      success: false,
      message: '票券状态更新功能正在开发中',
      data: {
        ticketId: req.params.ticketId,
        status: req.body.status
      }
    });
  } catch (error) {
    next(error);
  }
});

// 前端兼容性路由 - PUT /parties/tickets/:id/status (前端使用id而非ticketId) (必须在 /:id 之前)
router.put('/tickets/:id/status', auth, async (req, res, next) => {
  try {
    // TODO: 实现真实票券状态更新逻辑，当前为临时占位
    res.status(501).json({
      success: false,
      message: '票券状态更新功能正在开发中',
      data: {
        ticketId: req.params.id,
        status: req.body.status
      }
    });
  } catch (error) {
    next(error);
  }
});

// 参数化路由必须放在最后
router.get('/:id', partyController.getPartyById);
router.put('/:id', auth, partyController.updateParty);
router.delete('/:id', auth, partyController.deleteParty);
router.patch('/:id', auth, partyController.updatePartyStatus);
router.post('/:id/publish', auth, partyController.publishParty);
router.post('/:id/cancel', auth, partyController.cancelParty);
router.post('/:id/end', auth, partyController.endParty);
router.get('/:id/participants', partyController.getParticipants);
router.get('/:id/statistics', auth, partyController.getPartyStatistics);
router.get('/:id/tickets', partyController.getAvailableTickets);
router.get('/:id/availability', partyController.checkAvailability);

module.exports = router;
