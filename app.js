require('dotenv').config();  

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');  // Authentication routes
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log('Connected to MongoDB');
        console.log('Using Database:', mongoose.connection.db.databaseName); 
    })
    .catch(err => console.error('Could not connect to MongoDB...', err));

console.log('Current working directory:', __dirname);


const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Public folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Sessions
app.use(session({
    secret: '&5^6_0s',  
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL
    }),
    cookie: {
        maxAge: 180 * 60 * 1000, 
        secure: false  
    }
}));


app.use((req, res, next) => {

    if (req.session && req.session.user) {
       
        res.locals.isAuthenticated = true;
        res.locals.isAdmin = req.session.user.isAdmin || false;  
        res.locals.user = req.session.user;
    } else {
       
        res.locals.isAuthenticated = false;
        res.locals.isAdmin = false;
        res.locals.user = null;
    }

    
    next();
});

app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " + 
        "img-src 'self' https://images.unsplash.com https://your-image-host.com; " + 
        "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; " + 
        "font-src 'self' https://fonts.gstatic.com data:;" 
    );
    next();
});


// Routes
app.use('/admin', adminRoutes);
app.use('/', userRoutes);
app.use(authRoutes);  


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
