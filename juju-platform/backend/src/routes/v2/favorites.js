const express = require('express');
const router = express.Router();
const favoriteController = require('../../controllers/favoriteController');
const { auth } = require('../../middleware/auth');

// User favorite routes
router.get('/', auth, favoriteController.getFavorites);
router.post('/', auth, favoriteController.addFavorite);
router.delete('/:id', auth, favoriteController.removeFavorite);
router.get('/check/:targetId', auth, favoriteController.checkFavorite);

module.exports = router;
