const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    order_date: { type: Date, default: Date.now },
    order_time: { type: String },
    total_amount: { type: Number },
    delivery_fee: { type: Number },
    order_status: { type: String, enum: ['Pending', 'Delivered', 'Cancelled'], default: 'Pending' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    delivery: { type: mongoose.Schema.Types.ObjectId, ref: 'Delivery' },
    delivery_partner: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner' },
    order_items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem' }],
});

module.exports = mongoose.model('Order', OrderSchema);
