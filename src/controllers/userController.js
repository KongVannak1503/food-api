const User = require('../models/userModel');
const { logError, isEmptyOrNull, removeFile } = require('../utils/services');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// User Registration
const register = async (req, res) =>{
    try {
        const {name, email, password, role} = req.body;
        var error = {};
        if(isEmptyOrNull(name)){
            error.name = "Name is required!";
        }
        if(isEmptyOrNull(email)){
            error.email = "Email is required!";
        }
        if(isEmptyOrNull(password)){
            error.password = "Password is required!";
        }
        if(Object.keys(error).length > 0){
            res.json({
                error: error
            });
            return false;
        }
        // check if email is already exist
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({error: "Email already exist!"});
        }

        const hashPassword = await bcrypt.hash(password,10);
        const user = new User({
            name,
            email,
            password: hashPassword,
            role: role || 'user',
        });

        const saveUser = await user.save();
        res.status(201).json({
            message: 'User created successfully',
            data: saveUser,
        });
    } catch (error) {
        logError('user.register', error, res);
    }
}

// Login
const login = async (req, res) =>{
    try {
        const {email, password} = req.body;
        var error = {};
        if(isEmptyOrNull(email)){
            error.email = "Email is required!";
        }
        if(isEmptyOrNull(password)){
            error.password = "Password is required!";
        }
        if(Object.keys(error).length > 0){
            res.json({
                error: error
            });
            return false;
        }
        // Check if email exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Email doesn't exist!" });
        }

        // Check password
        const isMatch = await bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Password incorrect!" });
        }

        // Generate JWTs
        const accessToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.ACCESS_TOKEN_KEY,
            { expiresIn: process.env.EXPIRESIN }
        );
        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.REFRESH_TOKEN_KEY
        );
        // Send response
        res.status(200).json({
            message: "Login successfully!",
            user: {
                // id: user._id,
                name: user.name,
                email: user.email,
            },
            access_token: accessToken,
            refresh_token: refreshToken,
        });
    } catch (error) {
        logError('user.login', error, res);
    }
}

// Get all users
const getList = async (req, res) =>{
    try {
        const user = await User.find();
        res.status(200).json({
            message: "List of users",
            data: user,
        });
    } catch (error) {
        logError('user.getList', error, res);
    }
}

// Get by Id
const getOne = async (req, res)=>{
    try {
        const {id} = req.params;
        const error = {};
        if(isEmptyOrNull(id)){
            error.id = "Id is required!";
        }
        if(Object.keys(error).length > 0){
            res.json({
                error: error
            });
            return false;
        }

        const user = await User.findById(id);
        if(!user){
            return res.status(404).json({error: "User not found!"});
        }else{
            res.status(200).json({
                message: `User id: ${id}`,
                data: user,
            });
        }
    } catch (error) {
        logError('user.getList', error, res);
    }
}

const update = async(req, res) =>{
    try {
        const {id} = req.params;
        const {name, gender, dob, phone, email, password, address, role} = req.body;
        const errors = {};
        if(isEmptyOrNull(id)){
            errors.id = "Id is required";
        }
        if(isEmptyOrNull(name)){
            errors.name = "name is required";
        }
        if(isEmptyOrNull(gender)){
            errors.gender = "gender is required";
        }
        if(isEmptyOrNull(dob)){
            errors.dob = "dob is required";
        }
        if(isEmptyOrNull(phone)){
            errors.phone = "Id is required";
        }
        if(isEmptyOrNull(email)){
            errors.email = "email is required";
        }
        if(isEmptyOrNull(password)){
            errors.password = "password is required";
        }
        if(isEmptyOrNull(address)){
            errors.address = "address is required";
        }
        if(Object.keys(errors).length > 0){
            res.json({
                error: errors,
            });
            return false;
        }

        // find user
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found!' });
        }

        // Handle email uniqueness
        if (email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already in use!' });
            }
        }

        // Hash new password if provided
        let hashedPassword = user.password; // Keep current password
        if (password && password.trim() !== '') {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Handle uploaded image (if any)
        let newImage = null;
        if (req.file) {
            newImage = req.file.filename;

            // Remove the old image if it exists
            if (user.image) {
                try {
                    await removeFile(user.image);
                } catch (error) {
                    console.error("Error deleting old image:", error);
                }
            }
        }
        // Update user fields
        user.name = name || user.name;
        user.email = email || user.email;
        user.gender = gender || user.gender;
        user.dob = dob ? new Date(dob) : user.dob;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.role = role || user.role;
        user.image = newImage || user.image;

        const updateUser = await user.save();
        res.status(200).json({
            message: "User updated successfully!",
            data: updateUser,
        });
    } catch (error) {
        logError('user.update', error, res);
    }
}

const remove = async(req, res) =>{
    try {
        const {id} = req.params;
        const error = {};
        if(isEmptyOrNull(id)){
            error.id = "Id is required"
        }
        if(Object.keys(error).length > 0){
            res.json({error: error}); return false;
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found!" });
        }

        // Remove the user's profile image (if exists)
        if (user.image) {
            try {
                await removeFile(user.image);
            } catch (error) {
                console.error("Error deleting user image:", error);
            }
        }

        await User.findByIdAndDelete(id);
        res.status(200).json({message: "User deleted successfully!"});
    } catch (error) {
        logError('user.remove', error, res);
    }
}

module.exports = {register, login, getList, getOne, update, remove};