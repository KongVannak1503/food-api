const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    menu_item: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    quantity: { type: Number },
    price: { type: Number }
});

module.exports = mongoose.model('OrderItem', OrderItemSchema);
