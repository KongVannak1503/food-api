const mongoose = require('mongoose');

const DeliverySchema = new mongoose.Schema({
    pickup_time: { type: String }, // "HH:mm"
    delivered_time: { type: String },
    pickup_location: { type: String },
    delivery_location: { type: String },
    delivery_status: { type: String, enum: ['Pending', 'In Transit', 'Delivered'] },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    delivery_partner: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner' }
});

module.exports = mongoose.model('Delivery', DeliverySchema);
