const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

// Create a new delivery
router.post('/', deliveryController.createDelivery);

// Update delivery status
router.put('/:deliveryId', deliveryController.updateDeliveryStatus);

module.exports = router;
