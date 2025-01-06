const express = require('express');
const multer = require('multer'); 

const { getList, getOne, create, update, remove, upload } = require('../controllers/restaurantController');
const { uploadImage } = require('../utils/services');
const router = express.Router();

router.get('/', getList);
router.get('/:id', getOne);
router.post('/', upload.single('image'), create);
router.put('/:id', upload.single('image'), update);
router.delete('/:id', remove);

module.exports = router;