const mongoose = require('mongoose');

// Order Schema
const OrderSchema = new mongoose.Schema({
    order_date: { type: Date, default: Date.now }, // Date when the order was placed
    order_time: { type: String }, // Time when the order was placed
    total_amount: { type: Number, required: true }, // Total amount of the order
    delivery_fee: { type: Number, required: true }, // Delivery fee for the order
    order_status: {
        type: String,
        enum: ['Pending', 'Delivered', 'Cancelled'], // Order status options
        default: 'Pending',
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the user placing the order
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true }, // Reference to the restaurant
    order_items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem' }], // Array of order items (references to OrderItem)
    address: { type: String, required: true }, // Address where the order will be delivered
    addressLink: { type: String, required: true }, // Link to the address, if any
});

// Export the Order model
module.exports = mongoose.model('Order', OrderSchema);
