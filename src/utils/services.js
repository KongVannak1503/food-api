require('dotenv').config();
const fs = require('fs/promises');
const moment = require('moment');
const path = require('path');
const jwt = require("jsonwebtoken");
const userModel = require('../models/userModel');
const multer = require('multer');



const logError = async (controller, message, res) => {
    try {
        const timestamp = moment().format('DD/MM/YYYY HH:mm:ss');
        const path = "./logs/" + controller + ".txt";
        const logMessage = "[" + timestamp + "]" + message + "\n\n";
        await fs.appendFile(path, logMessage);
    } catch (error) {
        console.log("error writing to log file", error);
    }
    res.status(500).send("Internal server error!");
}

const isEmptyOrNull = (value) => {
    if (value === "" || value === null || value === undefined) {
        return true;
    }
    return false;
}

const validate_token = () => {
    return (req, res, next) => {
        try {
            const authorization = req.headers.authorization; // Token from client
            if (!authorization || !authorization.startsWith('Bearer ')) {
                return res.status(401).json({
                    msg: 'Unauthorized! Token is missing or malformed.',
                });
            }

            const token = authorization.split(' ')[1]; // Extract the token after 'Bearer'

            // Verify the token
            jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (error, decoded) => {
                if (error) {
                    return res.status(401).json({
                        msg: 'Unauthorized! Invalid token.',
                        error: error.message, // Provide more details about the error
                    });
                }

                // Attach user information to request object
                req.user = decoded.data;
                // req.user_id = decoded.data._id;

                next(); // Proceed to the next middleware or route handler
            });
        } catch (error) {
            console.error('Error in validate_token middleware:', error);
            res.status(500).json({
                msg: 'Internal server error.',
                error: error.message,
            });
        }
    }
}

const refresh_token = async (req, res) => {
    try {
        const { refresh_token } = req.body;

        // Check if the refresh token is provided
        if (!refresh_token) {
            return res.status(400).json({
                msg: "Refresh token is required!",
            });
        }

        // Verify the refresh token
        jwt.verify(refresh_token, process.env.REFRESH_TOKEN_KEY, async (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    msg: "Invalid or expired refresh token!",
                    error: err.message,
                });
            }

            // Extract user data from the token
            const user_from_token = decoded;

            // Check if the user exists in the database
            const user = await userModel.findById(user_from_token.id);
            if (!user) {
                return res.status(404).json({
                    msg: "User not found. Token invalid!",
                });
            }

            // Generate new tokens
            const access_token = jwt.sign(
                { id: user._id, email: user.email }, // Payload
                process.env.ACCESS_TOKEN_KEY,
                { expiresIn: '15m' } // e.g., '15m'
            );

            const new_refresh_token = jwt.sign(
                { id: user._id }, // Keep the payload minimal
                process.env.REFRESH_TOKEN_KEY,
                { expiresIn: process.env.EXPIRESIN } // e.g., '7d'
            );

            // Send response
            res.json({
                msg: "Token refreshed successfully!",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                access_token: access_token,
                refresh_token: new_refresh_token,
            });
        });
    } catch (error) {
        // Log the error for debugging purposes
        console.error("Error in refresh_token:", error);

        res.status(500).json({
            msg: "Internal server error.",
            error: error.message,
        });
    }
};

const uploadImage = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, process.env.IMAGE_PATH || 'uploads');
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const fileExtension = path.extname(file.originalname);
            cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
        }
    }),
    limits: {
        fileSize: 1024 * 1024 * 3, // max 3MB
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== "image/png" && file.mimetype !== "image/jpg" && file.mimetype !== "image/jpeg") {
            cb(null, false); // not allow
        } else {
            cb(null, true);
        }
    },
});


module.exports = uploadImage;

const removeFile = async (fileName) => {
    const filePath = path.join(process.env.IMAGE_PATH || 'uploads', fileName);
    try {
        await fs.unlink(filePath);
        return 'File deleted successfully!';
    } catch (error) {
        console.error('Error deleting file: ', error);
        throw error;
    }
}

module.exports = { logError, isEmptyOrNull, validate_token, refresh_token, uploadImage, removeFile };