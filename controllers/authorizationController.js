
const User = require('../models/user');
const bcrypt = require('bcrypt');


exports.getLoginForm = (req, res) => {
    res.render('login', {
        success_msg: req.session.success_msg || '',
        error_msg: req.session.error_msg || ''
    });
    req.session.success_msg = null;
    req.session.error_msg = null;
};


exports.postLoginForm = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            req.session.error_msg = 'Invalid email or password.';
            return res.redirect('/login');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.session.error_msg = 'Invalid email or password.';
            return res.redirect('/login');
        }

        req.session.isAuthenticated = true;
        req.session.isAdmin = user.isAdmin || false;
        req.session.user = { id: user._id, firstName: user.firstName };
        req.session.success_msg = 'Login successful!';
        res.redirect('/');
    } catch (error) {
        console.error('Error during login:', error);
        req.session.error_msg = 'An error occurred during login.';
        res.redirect('/login');
    }
};


exports.getRegisterForm = (req, res) => {
    res.render('register', {
        success_msg: req.session.success_msg || '',
        error_msg: req.session.error_msg || ''
    });
    req.session.success_msg = null;
    req.session.error_msg = null;
};


exports.postRegisterForm = async (req, res) => {
    const { firstName, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        req.session.error_msg = 'Passwords do not match.';
        return res.redirect('/register');
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.session.error_msg = 'Email already registered.';
            return res.redirect('/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            firstName,
            email,
            password: hashedPassword,
            isAdmin: false
        });

        await newUser.save();
        req.session.success_msg = 'Registration successful! You can now log in.';
        res.redirect('/login');
    } catch (error) {
        console.error('Error during registration:', error);
        req.session.error_msg = 'An error occurred during registration. Please try again.';
        res.redirect('/register');
    }
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            req.session.error_msg = 'Error logging out.';
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        return res.redirect('/login');
    });
};

