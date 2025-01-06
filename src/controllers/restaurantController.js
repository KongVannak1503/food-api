const Restaurant = require('../models/restaurantModel');
const { logError, isEmptyOrNull, removeFile } = require('../utils/services');
const { v4: uuidv4 } = require('uuid');
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

const getList = async (req, res) => {
    try {
        const restaurant = await Restaurant.find();
        res.status(200).json({
            message: "List of restaurant",
            data: restaurant,
        });
    } catch (error) {
        logError('restaurant.getList', error, res);
    }
}

const getOne = async (req, res) => {
    try {
        const { id } = req.params;
        const error = {};
        if (isEmptyOrNull(id)) {
            error.id = "Id is required";
        }
        if (Object.keys(error).length > 0) {
            res.json({ error: error }); return false;
        }

        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        res.status(200).json({
            message: "Restaurant found",
            data: restaurant,
        });
    } catch (error) {
        logError('restaurant.getOne', error, res);
    }
}

const create = async (req, res) => {
    try {
        const { name, phone, address, open_time, close_time } = req.body;
        const error = {};

        // Validate required fields
        // if (isEmptyOrNull(name)) {
        //     error.name = "Name is required";
        // }
        // if (isEmptyOrNull(phone)) {
        //     error.phone = "Phone is required";
        // }
        // if (isEmptyOrNull(address)) {
        //     error.address = "Address is required";
        // }
        // if (isEmptyOrNull(open_time)) {
        //     error.open_time = "Open time is required";
        // }
        // if (isEmptyOrNull(close_time)) {
        //     error.close_time = "Close time is required";
        // }

        // if (Object.keys(error).length > 0) {
        //     return res.status(400).json({ error });
        // }

        // Generate unique code for the restaurant
        const code = uuidv4();
        const existingCode = await Restaurant.findOne({ code });
        if (existingCode) {
            return res.status(400).json({ error: "Code already exists" });
        }

        // Handle image upload to Google Drive
        // let imageUrl = null;
        // if (req.file) {
        //     const fileName = `${Date.now()}-${req.file.originalname}`;
        //     const fileBuffer = req.file.buffer; // Get file buffer from multer
        //     imageUrl = await uploadFileToDrive(fileBuffer, fileName); // Upload to Google Drive
        // } const filePath = path.join('uploads', req.file.filename);
        const filePath = path.join('uploads', req.file.filename);

        // Create new restaurant object
        const restaurant = new Restaurant({
            code,
            name,
            phone,
            address,
            open_time,
            close_time,
            image: filePath,
        });

        // Save restaurant to the database
        const savedRestaurant = await restaurant.save();
        res.status(201).json({
            message: "Restaurant created successfully!",
            data: savedRestaurant,
        });
    } catch (error) {
        logError('restaurant.create', error, res);
        console.error('Error in restaurant.create:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};


const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, address, open_time, close_time } = req.body;
        const error = {};

        if (isEmptyOrNull(id)) {
            error.id = "Id is required";
        }
        if (isEmptyOrNull(name)) {
            error.name = "Name is required";
        }
        if (isEmptyOrNull(phone)) {
            error.phone = "Phone is required";
        }
        if (isEmptyOrNull(address)) {
            error.address = "Address is required";
        }
        if (isEmptyOrNull(open_time)) {
            error.open_time = "open_time is required";
        }
        if (isEmptyOrNull(close_time)) {
            error.close_time = "close_time is required";
        }

        if (Object.keys(error).length > 0) {
            return res.json({ error: error });
        }

        // Fetch the existing restaurant
        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        // Optional image handling: only update the image if provided
        let newImage = null;
        if (req.file) {
            newImage = req.file.filename;

            // Remove the old image if it exists
            if (restaurant.image) {
                try {
                    await removeFile(restaurant.image);
                } catch (error) {
                    console.error("Error deleting old image:", error);
                }
            }
        }

        // Update the restaurant with provided fields or retain existing values
        restaurant.name = name || restaurant.name;
        restaurant.phone = phone || restaurant.phone;
        restaurant.address = address || restaurant.address;
        restaurant.open_time = open_time || restaurant.open_time;
        restaurant.close_time = close_time || restaurant.close_time;
        restaurant.image = newImage || restaurant.image; // Only update the image if it's provided

        // Save the updated restaurant
        const updateRestaurant = await restaurant.save();

        // Return the response
        res.status(200).json({
            message: "Restaurant updated successfully!",
            data: updateRestaurant,
        });
    } catch (error) {
        logError('restaurant.update', error, res);
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const error = {};
        if (isEmptyOrNull(id)) {
            error.id = "Id is required"
        }
        if (Object.keys(error).length > 0) {
            res.json({ error: error }); return false;
        }

        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found!" });
        }

        // Remove the user's profile image (if exists)
        if (restaurant.image) {
            try {
                await removeFile(restaurant.image);
            } catch (error) {
                console.error("Error deleting Restaurant image:", error);
            }
        }

        await Restaurant.findByIdAndDelete(id);
        res.status(200).json({ message: "Restaurant deleted successfully!" });
    } catch (error) {
        logError('restaurant.remove', error, res);
    }
}

module.exports = { getList, getOne, create, update, remove, upload };