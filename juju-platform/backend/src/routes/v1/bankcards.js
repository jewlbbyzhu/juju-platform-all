const express = require('express');
const router = express.Router();
const bankCardController = require('../../controllers/bankCardController');
const { auth } = require('../../middleware/auth');

router.get('/', auth, bankCardController.getBankCards);
router.post('/', auth, bankCardController.addBankCard);
router.delete('/:id', auth, bankCardController.deleteBankCard);
router.put('/:id/default', auth, bankCardController.setDefaultBankCard);

module.exports = router;
