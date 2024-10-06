
const Apartment = require('../models/apartment');
const Reservation = require('../models/reservation');

const getApartments = async (req, res) => {
    try {
        let apartments;

        if (req.session.isAdmin) {
            apartments = await Apartment.find().lean();  
        } else {
            apartments = await Apartment.find({ isActive: true }).lean();  
        }

    

      
        res.render('index', {
            apartments,  
            success_msg: req.session.success_msg || '', 
            error_msg: req.session.error_msg || '',     
            isAdmin: req.session.isAdmin || false        
        });

    
        req.session.success_msg = null;
        req.session.error_msg = null;
    } catch (err) {
        console.error('Error fetching apartments:', err);
        res.status(500).send('Internal Server Error');
    }
};




const getApartmentById = async (req, res) => {
    const { idApartment } = req.params;

    try {
        const selectedApartment = await Apartment.findById(idApartment).lean(); 

        if (!selectedApartment) {
            return res.status(404).send('Apartment not found');
        }

        res.render('detail-apartment', {
            selectedApartment, 
            isAdmin: req.session.isAdmin || false,
            success_msg: req.session.success_msg || '',
            error_msg: req.session.error_msg || ''
        });

        req.session.success_msg = null;
        req.session.error_msg = null;
    } catch (err) {
        console.error('Error fetching apartment:', err);
        res.status(500).send('Internal Server Error');
    }
};


const postNewReservation = async (req, res) => {
    const { email, startDate, endDate, idApartment } = req.body;

    const apartment = await Apartment.findById(idApartment);
    const newReservation = await Reservation.create({
        email,
        startDate,
        endDate,
        apartment
    })


    await apartment.save();


    res.render('reservation-made');
};

const createReservation = async (req, res) => {
    const { email, startDate, endDate, idApartment } = req.body;

    try {
       
        const start = new Date(startDate);
        const end = new Date(endDate);

        
        const conflictingReservations = await Reservation.find({
            apartment: idApartment,
            $or: [
                { startDate: { $lt: end, $gte: start } },
                { endDate: { $gt: start, $lte: end } },
                { startDate: { $lte: start }, endDate: { $gte: end } }
            ]
        });

        if (conflictingReservations.length > 0) {
            return res.render('reservation-made', {
                success_msg: '', 
                error_msg: 'These dates are already booked. Please try different dates.',
                isAdmin: req.session.isAdmin || false 
            });
        }


        const newReservation = new Reservation({
            email,
            startDate: start,
            endDate: end,
            apartment: idApartment
        });

        await newReservation.save();


        res.render('reservation-made', {
            success_msg: 'Your reservation has been successfully made!',
            error_msg: '', 
            isAdmin: req.session.isAdmin || false 
        });
    } catch (err) {
        console.error('Error creating reservation:', err);
        res.status(500).render('reservation-made', {
            success_msg: '',
            error_msg: 'Internal Server Error. Please try again later.',
            isAdmin: req.session.isAdmin || false 
        });
    }
};



const searchApartments = async (req, res) => {
    const { minPeople, maxPrice, city, startDate, endDate } = req.query;

    try {
 
        const query = {
            maxPeople: { $gte: parseInt(minPeople) }, 
            pricePerNight: { $lte: parseFloat(maxPrice) }, 
            ...(city && { "location.city": { $regex: new RegExp(city, 'i') } }) 
        };


        let apartments = await Apartment.find(query).lean();

   
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

           
            const conflictingReservations = await Reservation.find({
                $or: [
                    { startDate: { $lt: end, $gte: start } },
                    { endDate: { $gt: start, $lte: end } },
                    { startDate: { $lte: start }, endDate: { $gte: end } }
                ]
            }).lean();

         
            const reservedApartmentIds = conflictingReservations.map(reservation => reservation.apartment.toString());

           
            apartments = apartments.filter(apartment => !reservedApartmentIds.includes(apartment._id.toString()));
        }

        res.render('index', { apartments, success_msg: '', error_msg: '', isAdmin: req.session.isAdmin });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error searching apartments');
    }
};


module.exports = {
    getApartments,
    getApartmentById,
    postNewReservation,
    createReservation,
    searchApartments
};