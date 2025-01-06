const Order = require('../models/orderModel');
const OrderItem = require('../models/orderItemModel');
const Delivery = require('../models/deliveryModel');

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        const { total_amount, delivery_fee, order_status, user, restaurant, order_items } = req.body;

        // Step 1: Create OrderItem documents
        const createdOrderItems = await Promise.all(
            order_items.map(async (item) => {
                const orderItem = new OrderItem(item);
                await orderItem.save();
                return orderItem._id; // Return the ID of the created OrderItem
            })
        );

        // Step 2: Create the Order document with references to OrderItem IDs
        const newOrder = new Order({
            user,
            restaurant,
            order_items: createdOrderItems,
            delivery_fee,
            total_amount,
            order_status,
        });

        await newOrder.save();

        res.status(201).json({
            message: 'Order created successfully',
            order: newOrder,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error creating order', error });
    }
};

// Get all orders
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
                                    .populate('user', 'name email') // Populate user details
                                    .populate('restaurant', 'name') // Populate restaurant details
                                    .populate({
                                        path: 'order_items',
                                        populate: { path: 'menu_item', select: 'name price' }, // Populate menu_item inside order_items
                                    });
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching orders', error });
    }
};

// Update an order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const {status} = req.body;
        const validStatuses = ['Pending', 'Delivered', 'Cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updatedOrder = await Order.findByIdAndUpdate(orderId, { order_status: status }, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json({ message: 'Order status updated successfully', updatedOrder });
    } catch (error) {
        return res.status(500).json({ message: 'Error updating order status', error });
    }
};

// Delete an order
exports.deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const deletedOrder = await Order.findByIdAndDelete(orderId);

        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting order', error });
    }
};
