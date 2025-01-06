const mongoose = require('mongoose');

const DeliveryPartnerSchema = new mongoose.Schema({
    name: { type: String },
    phone_number: { type: String },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    address: { type: String },
    available: { type: Boolean, default: true }
});

module.exports = mongoose.model('DeliveryPartner', DeliveryPartnerSchema);
