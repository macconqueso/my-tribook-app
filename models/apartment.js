const { Schema, model } = require('mongoose');

const servicesSchema = new Schema({
    airConditioning: { type: Boolean, default: false },
    heating: { type: Boolean, default: false },
    adaptedForReducedMobility: { type: Boolean, default: false },
    television: { type: Boolean, default: false },
    kitchen: { type: Boolean, default: false },
    internet: { type: Boolean, default: false }
}, { _id: false });


const locationSchema = new Schema({
    province: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    gpsCoordinates: {
        type: [Number],  
        required: true,
        validate: {
            validator: function(coords) {
                return coords.length === 2 && 
                    coords.every(coord => typeof coord === 'number');
            },
            message: 'GPS coordinates must be an array with latitude and longitude.'
        }
    }
}, { _id: false });


const photoSchema = new Schema({
    url: {
        type: String,
        required: true,
        match: [/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/, 'Please enter a valid URL']  
    },
    caption: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false });


const apartmentSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    rules: {
        type: String,
        required: true
    },
    rooms: {
        type: Number,
        required: true,
        min: 0
    },
    beds: {
        type: Number,
        required: true,
        min: 0
    },
    numBathrooms: {
        type: Number,
        required: true,
        min: 0
    },
    maxPeople: {
        type: Number,
        required: true,
        min: 1
    },
    pricePerNight: {
        type: Number,
        required: true,
        min: 0
    },
    squareMeters: {
        type: Number,
        required: true,
        min: 0
    },
    mainPhoto: {
        type: String,
        required: true,
        match: [/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/, 'Please enter a valid URL']
    },
    services: servicesSchema,
    location: locationSchema,  

    additionalPhotos: [photoSchema],  

    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { timestamps: true }); 

const Apartment = model('Apartment', apartmentSchema);

module.exports = Apartment;
