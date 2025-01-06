const OrderItem = require('../models/orderItemModel');

// Add items to an order
exports.addOrderItems = async (req, res) => {
    try {
        const { orderId, items } = req.body;

        for (const item of items) {
            const newOrderItem = new OrderItem({
                order: orderId,
                menu_item: item.menu_item,
                quantity: item.quantity,
                price: item.price
            });
            await newOrderItem.save();
        }

        return res.status(201).json({ message: 'Order items added successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error adding order items', error });
    }
};

// Remove an order item
exports.removeOrderItem = async (req, res) => {
    try {
        const { orderItemId } = req.params;

        const deletedItem = await OrderItem.findByIdAndDelete(orderItemId);

        if (!deletedItem) {
            return res.status(404).json({ message: 'Order item not found' });
        }

        return res.status(200).json({ message: 'Order item removed successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error removing order item', error });
    }
};
