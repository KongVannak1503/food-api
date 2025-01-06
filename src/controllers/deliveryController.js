const Delivery = require('../models/deliveryModel');
const DeliveryPartner = require('../models/deliveryPartnerModel');

// Create a new delivery
exports.createDelivery = async (req, res) => {
    try {
        const { order, pickup_time, pickup_location, delivery_location, delivery_partner } = req.body;

        const newDelivery = new Delivery({
            order,
            pickup_time,
            pickup_location,
            delivery_location,
            delivery_status: 'Pending',
            delivery_partner
        });

        await newDelivery.save();

        return res.status(201).json({ message: 'Delivery created successfully', newDelivery });
    } catch (error) {
        return res.status(500).json({ message: 'Error creating delivery', error });
    }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const {status} = req.body;
        const validStatuses = ['Pending', 'In Transit', 'Delivered'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updatedDelivery = await Delivery.findByIdAndUpdate(deliveryId, { delivery_status: status }, { new: true });

        if (!updatedDelivery) {
            return res.status(404).json({ message: 'Delivery not found' });
        }

        return res.status(200).json({ message: 'Delivery status updated successfully', updatedDelivery });
    } catch (error) {
        return res.status(500).json({ message: 'Error updating delivery status', error });
    }
};
