const express = require('express');
const { create, getList, getOne, update, remove } = require('../controllers/DeliveryPartnerController');
const router = express.Router();

router.get('/', getList);
router.get('/:id', getOne);
router.post('/create', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;