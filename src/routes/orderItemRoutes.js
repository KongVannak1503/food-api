const express = require('express');
const router = express.Router();
const orderItemController = require('../controllers/orderItemController');

// Add items to an order
router.post('/', orderItemController.addOrderItems);

// Remove an order item
router.delete('/:orderItemId', orderItemController.removeOrderItem);

module.exports = router;
