const express = require('express');
const router = express.Router();
const authorizationController = require('../controllers/authorizationController');


router.get('/login', authorizationController.getLoginForm);

router.post('/login', authorizationController.postLoginForm);


router.get('/logout', authorizationController.logout);


router.get('/register', authorizationController.getRegisterForm);

router.post('/register', authorizationController.postRegisterForm);

module.exports = router;

