const express = require('express');
const router = express.Router();
const partyController = require('../../controllers/partyController');
const { auth } = require('../../middleware/auth');

router.get('/', partyController.getPartyList);
router.get('/published', partyController.getPublishedParties);
router.get('/public', partyController.getPublishedParties);
router.get('/upcoming', partyController.getUpcomingParties);
router.get('/hot', partyController.getHotParties);
router.get('/search', partyController.searchParties);
router.get('/my', auth, partyController.getMyParties);
router.get('/:id', partyController.getPartyById);
router.patch('/:id', auth, partyController.updatePartyStatus);
router.post('/:id/publish', auth, partyController.publishParty);
router.post('/:id/cancel', auth, partyController.cancelParty);
router.post('/:id/end', auth, partyController.endParty);
router.get('/:id/participants', partyController.getParticipants);
router.get('/:id/statistics', auth, partyController.getPartyStatistics);
router.get('/:id/tickets', partyController.getAvailableTickets);
router.get('/:id/availability', partyController.checkAvailability);

module.exports = router;
