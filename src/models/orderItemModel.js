const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    menu_item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    quantity: { type: Number },
    price: { type: Number }
});

module.exports = mongoose.model('OrderItem', OrderItemSchema);
