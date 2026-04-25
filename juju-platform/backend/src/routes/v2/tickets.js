const express = require('express');
const router = express.Router();
const ticketController = require('../../controllers/ticketController');
const { auth, adminAuth } = require('../../middleware/auth');
const { validateInvalidateTicket } = require('../../validators/ticketValidator');

// User ticket routes (without adminAuth)
router.get('/', auth, ticketController.getUserTickets);
router.get('/:id', auth, ticketController.getUserTicketById);
router.post('/', auth, ticketController.createTicket);
router.put('/:id', auth, ticketController.updateTicket);
router.delete('/:id', auth, ticketController.deleteTicket);

// Admin ticket routes
router.get('/admin', auth, adminAuth, ticketController.getTicketList);
router.get('/admin/:id', auth, adminAuth, ticketController.getTicketById);
router.put('/admin/:id/invalidate', auth, adminAuth, validateInvalidateTicket, ticketController.invalidateTicket);
router.post('/admin/check-expired', auth, adminAuth, ticketController.checkExpiredTickets);

module.exports = router;
