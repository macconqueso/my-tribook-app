

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { createReservation } = require('../controllers/userController');


router.get('/', userController.getApartments);


router.get('/apartment/:idApartment', userController.getApartmentById);


router.post('/apartment/new-reservation', userController.createReservation);

router.get('/search', userController.searchApartments);

module.exports = router;
