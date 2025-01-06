const express = require('express');
const { register, login, getList, getOne, update, remove } = require('../controllers/userController');
const { validate_token, refresh_token, uploadImage } = require('../utils/services');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh_token', validate_token(), refresh_token);
router.get('/', getList);
router.get('/:id', getOne);
router.put('/:id', uploadImage.single('image'), update);
router.delete('/:id', validate_token(), remove);

module.exports = router;