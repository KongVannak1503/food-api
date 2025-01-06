const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema(
    {
        code: { type: String, unique: true },
        name: { type: String },
        phone: { type: String },
        address: { type: String },
        open_time: { type: String },
        close_time: { type: String },
        image: { type: String },
        menuItems: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'MenuItem',
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Restaurant', RestaurantSchema);