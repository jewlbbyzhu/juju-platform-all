const express = require('express');
const router = express.Router();
const miscController = require('../../controllers/miscController');

router.get('/search', miscController.searchLocation);
router.get('/geocode', miscController.geocode);
router.get('/reverse-geocode', miscController.reverseGeocode);
router.get('/distance', miscController.getDistance);
router.get('/route', miscController.calculateRoute);

module.exports = router;
