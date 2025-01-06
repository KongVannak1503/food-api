const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    dob: { type: Date },
    phone: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    address: { type: String },
    role: { type: String, enum: ['user', 'restaurant', 'delivery', 'admin'], default: 'user' },
    image: { type: String }
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', UserSchema);