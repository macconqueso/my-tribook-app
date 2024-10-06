const Apartment = require('../models/apartment');


exports.renderAddNewApartmentForm = (req, res) => {
    res.render('admin/addNewApartment', {
        title: 'Add New Apartment',
        success_msg: req.session.success_msg || '',  
        error_msg: req.session.error_msg || '',    
        isAdmin: req.session.isAdmin || false        
    });

  
    req.session.success_msg = null;
    req.session.error_msg = null;
};


exports.addNewApartment = async (req, res) => {
    try {

        const services = {
            airConditioning: req.body.services.airConditioning === 'on',
            heating: req.body.services.heating === 'on',
            adaptedForReducedMobility: req.body.services.adaptedForReducedMobility === 'on',
            television: req.body.services.television === 'on',
            kitchen: req.body.services.kitchen === 'on',
            internet: req.body.services.internet === 'on',
        };


        const latitude = parseFloat(req.body.location.gpsCoordinates[0]);
        const longitude = parseFloat(req.body.location.gpsCoordinates[1]);

        if (isNaN(latitude) || isNaN(longitude)) {
            throw new Error('Invalid GPS coordinates');
        }

  
        const location = {
            province: req.body.location.province,
            city: req.body.location.city,
            gpsCoordinates: [latitude, longitude]
        };


        const additionalPhotos = req.body.additionalPhotos.map(photo => ({
            url: photo.url,
            caption: photo.caption
        }));

  
        const apartment = new Apartment({
            title: req.body.title,
            description: req.body.description,
            rules: req.body.rules,
            rooms: parseInt(req.body.rooms),
            beds: parseInt(req.body.beds),
            numBathrooms: parseInt(req.body.numBathrooms),
            maxPeople: parseInt(req.body.maxPeople),
            pricePerNight: parseFloat(req.body.pricePerNight),
            squareMeters: parseFloat(req.body.squareMeters),
            mainPhoto: req.body.mainPhoto,
            services: services,
            location: location,
            additionalPhotos: additionalPhotos,
            isActive: true
        });

  
        await apartment.save();

       
        res.render('success', {
            success_msg: 'Apartment added successfully!',
            error_msg: '',
            isAdmin: req.session.isAdmin || false
        });
    } catch (err) {
        console.error('Error adding new apartment:', err);


        req.session.error_msg = 'Failed to add the apartment. Please try again.';
        res.redirect('/admin/apartment/add-new');
    }
};



exports.getEditApartmentForm = async (req, res) => {
    const { idApartment } = req.params;

    try {
        // Fetch the apartment by its ID
        const apartment = await Apartment.findById(idApartment);

        if (!apartment) {
            req.session.error_msg = 'Apartment not found.';
            return res.redirect('/admin/apartments');  // Redirect to list of apartments if not found
        }

        // Render the edit form with existing apartment data prefilled
        res.render('edit-apartment', {
            apartment,
            success_msg: req.session.success_msg || '',
            error_msg: req.session.error_msg || '',
            isAdmin: req.session.isAdmin || false
        });

        // Clear session messages
        req.session.success_msg = null;
        req.session.error_msg = null;

    } catch (err) {
        console.error('Error fetching apartment:', err);
        req.session.error_msg = 'Error fetching apartment. Please try again.';
        res.redirect('/admin/apartments');  // Redirect in case of error
    }
};


// POST: Handle apartment updates
exports.postEditApartment = async (req, res) => {
    const { idApartment } = req.params;

    // Convert checkbox values to boolean for services
    const services = {
        airConditioning: req.body.services?.airConditioning === 'on',
        heating: req.body.services?.heating === 'on',
        adaptedForReducedMobility: req.body.services?.adaptedForReducedMobility === 'on',
        television: req.body.services?.television === 'on',
        kitchen: req.body.services?.kitchen === 'on',
        internet: req.body.services?.internet === 'on',
    };

    // Extract location details
    const location = {
        province: req.body.location?.province || '',  // Ensure the fallback to an empty string if undefined
        city: req.body.location?.city || '',
        gpsCoordinates: [
            req.body.location?.gpsCoordinates?.[0] || 0,  // Latitude
            req.body.location?.gpsCoordinates?.[1] || 0   // Longitude
        ]
    };

    // Extract additional photos if provided
    const additionalPhotos = req.body.additionalPhotos?.map((photo, index) => ({
        url: photo.url || '',
        caption: photo.caption || ''
    })) || [];

    try {
        // console.log(`Received update request for apartment ${req.params.idApartment}`);

        // Perform the update
        await Apartment.findByIdAndUpdate(idApartment, {
            title: req.body.title,
            description: req.body.description,
            pricePerNight: req.body.pricePerNight,
            squareMeters: req.body.squareMeters,
            rooms: req.body.rooms,
            beds: req.body.beds,
            maxPeople: req.body.maxPeople,
            mainPhoto: req.body.mainPhoto,
            rules: req.body.rules,  // Update the rules field
            services: services,     // Update services
            location: location,     // Update location details
            additionalPhotos: additionalPhotos  // Update additional photos if provided
        });

        // Set success message and redirect
        req.session.success_msg = 'Apartment updated successfully.';
        res.redirect(`/admin/apartment/${idApartment}/edit`);

    } catch (err) {
        // Handle error and redirect back to the edit page
        console.error('Error updating apartment:', err);
        req.session.error_msg = 'Error updating apartment. Please try again.';
        res.redirect(`/admin/apartment/${idApartment}/edit`);
    }
};





exports.toggleApartmentStatus = async (req, res) => {
    const apartmentId = req.params.id;

    try {
        // Fetch the apartment by ID to check the current isActive status
        const apartment = await Apartment.findById(apartmentId);
        if (!apartment) {
            req.session.error_msg = 'Apartment not found.';
            return res.redirect('/');
        }

        // Toggle the isActive status
        const newStatus = !apartment.isActive;

        // Use findByIdAndUpdate to only update the isActive field
        await Apartment.findByIdAndUpdate(apartmentId, { isActive: newStatus }, { runValidators: false, new: true });

        // Set success message based on new status
        req.session.success_msg = newStatus 
            ? 'Apartment reactivated successfully.' 
            : 'Apartment deactivated successfully.';

        // Redirect back to the apartment detail page
        return res.redirect(`/apartment/${apartmentId}`);
    } catch (error) {
        console.error('Error toggling apartment status:', error);
        req.session.error_msg = 'Error updating apartment status.';
        return res.redirect('/');
    }
};



