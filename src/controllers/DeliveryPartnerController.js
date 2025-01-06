const DeliveryPartner = require('../models/deliveryPartnerModel');
const { logError, isEmptyOrNull } = require('../utils/services');


const create = async (req, res) => {
    try {
        const { name, phone_number, gender, address, available } = req.body;
        const error = {};

        // Validate required fields
        // if (isEmptyOrNull(name)) {
        //     error.name = "Name is required";
        // }
        // if (isEmptyOrNull(phone_number)) {
        //     error.phone_number = "Phone number is required";
        // }
        // if (isEmptyOrNull(gender)) {
        //     error.gender = "Gender is required";
        // }
        // if (isEmptyOrNull(address)) {
        //     error.address = "Address is required";
        // }
        // if (isEmptyOrNull(available)) {
        //     error.available = "Availability is required";
        // }

        // Return validation errors if any
        if (Object.keys(error).length > 0) {
            return res.status(400).json({ error });
        }

        // Create a new delivery partner
        const delivery = new DeliveryPartner({
            name,
            gender,
            phone_number,
            address,
            available,
        });

        const saveDelivery = await delivery.save();

        // Respond with success message
        res.status(201).json({
            message: "Delivery Partner created successfully",
            data: saveDelivery,
        });
    } catch (error) {
        logError('deliverypartner.create', error, res);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getList = async (req, res) => {
    try {
        const deliver = await DeliveryPartner.find();
        if (!deliver) {
            return res.status(404).json({ message: "Delivery partner not found" });
        }
        res.status(200).json({
            message: "List of delivery partner",
            data: deliver,
        });
    } catch (error) {
        logError('deliverypartner.getList', err, res);
    }
}

const getOne = async (req, res) => {
    try {
        const { id } = req.params;
        const deliver = await DeliveryPartner.findById(id);
        if (!deliver) {
            return res.status(404).json({ message: "Delivery partner not found" });
        }
        res.status(200).json({
            message: "List of delivery partner",
            data: deliver,
        });
    } catch (error) {
        logError('deliverypartner.getOne', err, res);
    }
}

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone_number, gender, address, available } = req.body;
        const error = {};
        if (isEmptyOrNull(id)) {
            error.id = "id is required";
        }
        if (isEmptyOrNull(name)) {
            error.name = "Name is required";
        }
        if (isEmptyOrNull(phone_number)) {
            error.phone_number = "phone_number is required";
        }
        if (isEmptyOrNull(gender)) {
            error.gender = "gender is required";
        }
        if (isEmptyOrNull(address)) {
            error.address = "address is required";
        }
        if (Object.keys(error).length > 0) {
            return res.json({ error: error });
        }

        const deliver = await DeliveryPartner.findById(id);
        if (!deliver) {
            return res.status(404).json({ message: "Delivery partner not found" });
        }

        deliver.name = name;
        deliver.gender = gender;
        deliver.phone_number = phone_number;
        deliver.address = address;
        deliver.available = available;

        const updateDeliver = await deliver.save();
        res.status(200).json({
            message: "Delivery Partner updated successfully",
            data: updateDeliver,
        });
    } catch (error) {
        logError('deliverypartner.update', error, res);
    }
}

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const error = {};
        if (isEmptyOrNull(id)) {
            error.id = "id is required";
        }
        if (Object.keys(error).length > 0) {
            return res.json({ error: error });
        }

        const deliver = await DeliveryPartner.findById(id);
        if (!deliver) {
            return res.status(404).json({ message: "Delivery partner not found" });
        }
        await deliver.deleteOne();
        res.status(200).json({ message: "Delivery partner deleted successfully!" });
    } catch (error) {
        logError('deliverypartner.remove', error, res);
    }
}

module.exports = { create, getList, getOne, update, remove };