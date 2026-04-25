const express = require('express');
const router = express.Router();
const ticketController = require('../../controllers/ticketController');
const { auth } = require('../../middleware/auth');
const { validateVerifyTicket, validateUseTicket } = require('../../validators/ticketValidator');

router.get('/', auth, ticketController.getTicketList);
router.get('/stats', auth, ticketController.getTicketStats);
router.get('/:id', auth, ticketController.getTicketById);
router.get('/code/:code', ticketController.getTicketByCode);
router.post('/:id/verify', validateVerifyTicket, ticketController.verifyTicket);
router.patch('/:id', auth, validateUseTicket, ticketController.useTicket);

module.exports = router;
