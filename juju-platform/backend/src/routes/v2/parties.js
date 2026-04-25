const express = require('express');
const router = express.Router();
const partyController = require('../../controllers/partyController');
const { auth, adminAuth } = require('../../middleware/auth');
const { validateCreateParty, validateUpdateParty, validateAuditParty, validateUpdatePartyStatus } = require('../../validators/partyValidator');

router.get('/stats', auth, adminAuth, partyController.getPartyStats);
router.get('/search', auth, adminAuth, partyController.searchParties);
router.get('/export', auth, adminAuth, partyController.exportParties);
router.get('/pending', auth, adminAuth, partyController.getPendingParties);
router.get('/:id/audit-history', auth, adminAuth, partyController.getPartyAuditHistory);
router.get('/:id', auth, adminAuth, partyController.getPartyById);
router.get('/', auth, adminAuth, partyController.getPartyList);
router.post('/batch/audit', auth, adminAuth, partyController.batchAuditParties);
router.post('/:id/cancel', auth, adminAuth, partyController.cancelParty);
router.post('/:id/complete', auth, adminAuth, partyController.completeParty);
router.post('/', auth, validateCreateParty, partyController.createParty);
router.delete('/:id', auth, partyController.deleteParty);
router.put('/:id', auth, validateUpdateParty, partyController.updateParty);
router.put('/:id/audit', auth, adminAuth, validateAuditParty, partyController.auditParty);
router.put('/:id/status', auth, adminAuth, validateUpdatePartyStatus, partyController.updatePartyStatus);

module.exports = router;
