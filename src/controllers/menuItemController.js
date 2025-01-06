const MenuItem = require('../models/menuItemModel');
const Restaurant = require('../models/restaurantModel');
const { logError, isEmptyOrNull } = require('../utils/services');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup for local file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Store files in the "uploads" folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp to avoid name conflicts
    },
});

const upload = multer({ storage: storage }); // Initialize multer with the storage configuration

// Create Menu Item with Local File Storage
const createMenuItem = async (req, res) => {
    try {
        const restaurantId = req.params.id;
        const { code, name, description, price } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

        const filePath = path.join('uploads', req.file.filename); // Save local file path

        const newMenuItem = new MenuItem({
            restaurantId,
            code,
            name,
            description,
            price,
            image: filePath, // Store local file path
        });

        const savedMenuItem = await newMenuItem.save();
        restaurant.menuItems.push(savedMenuItem._id);
        await restaurant.save();

        res.status(201).json({
            message: "Menu Item created successfully",
            data: savedMenuItem,
        });
    } catch (err) {
        console.error('Error in createMenuItem:', err);
        res.status(500).json({ message: "Server error" });
    }
};

const updateMenuItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { restaurantId, code, name, description, price } = req.body;

        const error = {};
        if (isEmptyOrNull(itemId)) error.itemId = "Id is required";
        if (isEmptyOrNull(restaurantId)) error.restaurantId = "RestaurantId is required";
        if (isEmptyOrNull(code)) error.code = "Code is required";
        if (isEmptyOrNull(name)) error.name = "Name is required";
        if (isEmptyOrNull(price)) error.price = "Price is required";
        else if (isNaN(price)) error.price = "Price must be a valid number";

        if (Object.keys(error).length > 0) return res.status(400).json({ error });

        const menuItem = await MenuItem.findById(itemId);
        if (!menuItem) return res.status(404).json({ error: "Menu Item not found" });

        let newImage = menuItem.image; // Default to the current image path

        if (req.file) {
            console.log("New file uploaded:", req.file); // Debug log to check the uploaded file
            newImage = path.join('uploads', req.file.filename);

            // Delete old image from local storage
            if (menuItem.image) {
                try {
                    fs.unlinkSync(menuItem.image); // Remove the old image file
                    console.log("Old image deleted:", menuItem.image); // Debug log
                } catch (error) {
                    console.error("Error deleting old image:", error);
                }
            }
        }

        // Update the fields with provided data or retain the old ones
        menuItem.restaurantId = restaurantId || menuItem.restaurantId;
        menuItem.code = code || menuItem.code;
        menuItem.name = name || menuItem.name;
        menuItem.description = description || menuItem.description;
        menuItem.price = price || menuItem.price;
        menuItem.image = newImage; // Set the new image or keep the old one if no new file is uploaded

        const updatedMenuItem = await menuItem.save();

        res.status(200).json({
            message: "Menu Item updated successfully",
            data: updatedMenuItem,
        });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ error: 'Failed to update menu item' });
    }
};


// Remove Menu Item and Its Image
const removeMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const error = {};

        if (isEmptyOrNull(id)) {
            error.id = "Id is required";
        }
        if (Object.keys(error).length > 0) {
            return res.json({ error: error });
        }

        const menuItem = await MenuItem.findById(id);
        if (!menuItem) {
            return res.status(404).json({ error: "Menu Item not found" });
        }

        if (menuItem.image) {
            try {
                fs.unlinkSync(menuItem.image); // Delete the image from local storage
            } catch (error) {
                console.error("Error deleting MenuItem image:", error);
            }
        }

        await menuItem.deleteOne();
        await Restaurant.updateOne(
            { menuItems: id },
            { $pull: { menuItems: id } }
        );

        res.status(200).json({
            message: "MenuItem deleted",
        });
    } catch (error) {
        logError('menuItem.removeMenuItem', error, res);
    }
};

// Get Menu by Restaurant ID
const getMenuByRestaurant = async (req, res) => {
    try {
        const id = req.params.id;
        const error = {};
        if (isEmptyOrNull(id)) {
            error.id = "Id is required";
        }
        if (Object.keys(error).length > 0) {
            return res.json({ error: error });
        }

        const restaurant = await Restaurant.findById(id).populate('menuItems');
        if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

        res.status(200).json({
            message: "List of Menu by restaurant",
            data: restaurant.menuItems,
        });
    } catch (error) {
        logError('menuItem.getMenuByRestaurant', error, res);
    }
};

// Get Menu Item by ID
const getMenuItemById = async (req, res) => {
    try {
        const id = req.params.itemId;
        const error = {};
        if (isEmptyOrNull(id)) {
            error.id = "Id is required";
        }
        if (Object.keys(error).length > 0) {
            return res.json({ error: error });
        }

        const menuItem = await MenuItem.findById(id).populate('restaurantId');
        if (!menuItem) return res.status(404).json({ message: 'Menu item not found' });

        res.status(200).json({
            message: "List of Menus",
            data: menuItem,
        });
    } catch (err) {
        logError('menuItem.getMenuItemById', err, res);
    }
};

// Get Menu Item Counts
const getMenuItemCounts = async (req, res) => {
    console.log('Request received at /api/restaurant/items/counts');
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Invalid or missing "ids" array' });
        }

        const counts = await Promise.all(
            ids.map(async (id) => {
                const count = await MenuItem.countDocuments({ restaurantId: id });
                return { restaurantId: id, count };
            })
        );

        res.status(200).json({ counts });
    } catch (error) {
        console.error('Error fetching menu item counts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Exporting functions and the upload middleware
module.exports = { 
    getMenuByRestaurant, 
    getMenuItemById, 
    createMenuItem, 
    updateMenuItem, 
    removeMenuItem, 
    getMenuItemCounts, 
    upload 
};
