const express = require('express');
const multer = require('multer');
const { uploadImage } = require('../utils/services');
const { getMenuByRestaurant, getMenuItemById, createMenuItem, updateMenuItem, removeMenuItem, getMenuItemCountByRestaurant, getMenuItemCounts, getAllMenus, upload } = require('../controllers/menuItemController');
const router = express.Router();
// const upload = multer({ dest: 'uploads/' }); 

router.get('/:id', getMenuByRestaurant);
router.get('/view/:itemId', getMenuItemById);
router.get('/', getAllMenus);
router.post('/create/:id', upload.single('image'), createMenuItem);
router.put('/update/:itemId', upload.single('image'), updateMenuItem);
router.delete('/delete/:id', removeMenuItem);
router.post('/counts', getMenuItemCounts);

module.exports = router;