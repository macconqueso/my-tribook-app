const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');


router.get('/apartment/add-new', adminController.renderAddNewApartmentForm);


router.post('/apartment/add-new', adminController.addNewApartment);




router.get('/success', (req, res) => {
    res.render('success');
});

router.get('/apartment/:idApartment/edit', adminController.getEditApartmentForm);
router.post('/apartment/:idApartment/edit', adminController.postEditApartment);


router.post('/apartment/:id/deactivate', adminController.toggleApartmentStatus);


module.exports = router;
