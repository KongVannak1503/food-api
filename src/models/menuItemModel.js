const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema(
    {
        restaurantId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Restaurant' },
        code: { type: String },
        name: { type: String },
        description: { type: String },
        price: { type: Number },
        image: { type: String, required: false },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('MenuItem', MenuItemSchema);