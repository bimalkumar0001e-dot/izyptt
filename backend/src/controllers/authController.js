const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendOtp, verifyOTP: verifyOtp } = require('../services/auth.service');

const tempRegistrationStore = new Map(); // phone -> { ...formData, imagePath }

// Registration (only for restaurant/delivery)
exports.register = async (req, res) => {
    const { name, phone, role, email, password, vehicle } = req.body;
    try {
        // Debug log incoming data
        console.log('Register request:', { name, phone, role, email, password, file: req.file });

        // Block admin and customer registration
        if (role === 'admin' || role === 'customer') {
            return res.status(403).json({ message: 'Registration not allowed for this role' });
        }
        if (!name || !phone || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        // Require image for restaurant/delivery
        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }
        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }
        let user = await User.findOne({ $or: [{ email }, { phone }] });
        if (user) {
            return res.status(400).json({ message: 'User already exists with this email or phone' });
        }
        // Do NOT hash password here, let Mongoose pre-save hook handle it

        // Save image path (fix: use correct folder for static serving)
        let imagePath = '/restaurant_delv images/' + req.file.filename;

        // Require vehicle for delivery partners only
        if (role === 'delivery' && (!vehicle || vehicle.trim() === '')) {
            return res.status(400).json({ message: 'Vehicle name is required for delivery partners' });
        }

        // Save registration data in temp store
        tempRegistrationStore.set(phone, {
            name, phone, role, email, password, imagePath,
            ...(role === 'delivery' ? { vehicle } : {})
        });
        console.log('Temp registration store set for phone:', phone); // Debug

        // --- CHANGED LOGIC BELOW ---
        // For restaurant/delivery, generate OTP and return in response (do NOT send SMS)
        if (role === 'restaurant' || role === 'delivery') {
            const otp = await sendOtp(phone, role); // role will trigger display-only logic in service
            return res.status(201).json({ message: 'OTP generated. Please verify.', otp });
        }
        // For customer (should not reach here, but fallback)
        await sendOtp(phone, 'customer');
        return res.status(201).json({ message: 'OTP sent to phone. Please verify.' });
    } catch (error) {
        console.error('Register error:', error);
        // Return the error stack for debugging (remove in production)
        res.status(500).json({ message: 'Error registering user', error: error.message, stack: error.stack });
    }
};

// Send OTP (for login/resend)
exports.sendOtp = async (req, res) => {
    const { phone, role } = req.body;
    try {
        // Validate phone number: must be exactly 10 digits, all numeric
        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({ message: 'Invalid phone number. Please enter a valid 10-digit Indian mobile number.' });
        }
        let userRole = role;
        if (!userRole) {
            const user = await User.findOne({ phone });
            userRole = user ? user.role : 'customer';
        }

<<<<<<< HEAD
        // Special handling for customer: always generate and return OTP, do NOT send SMS
        if (userRole === 'customer') {
            const otp = await sendOtp(phone, 'customer');
            return res.status(200).json({ message: 'OTP generated. Please enter the code shown below.', otp });
=======
        // Always generate and return OTP for customer
        if (userRole === 'customer') {
            const otp = await sendOtp(phone, 'customer');
            return res.status(200).json({ message: 'OTP sent successfully', otp });
>>>>>>> 561765f (final1)
        }

        // --- Role-based login gating for restaurant/delivery ---
        if (userRole === 'restaurant' || userRole === 'delivery') {
            const user = await User.findOne({ phone, role: userRole });
            if (!user) {
                return res.status(404).json({ message: 'Your number is not registered yet. Please register first.' });
            }
            if (!user.isApproved) {
                return res.status(403).json({ message: 'Your request has not been approved by the admin yet.' });
            }
            if (user.status === 'inactive' || user.status === 'blocked') {
                return res.status(403).json({ message: 'Your account is blocked' });
            }
            // Only allow login if approved and active
            const otp = await sendOtp(phone, userRole);
            return res.status(200).json({ message: 'OTP (for login)', otp });
        }

        // Admin login
        if (userRole === 'admin') {
            const otp = await sendOtp(phone, 'admin');
            return res.status(200).json({ message: 'OTP (for admin)', otp });
        }

        // Fallback (should not reach here)
        return res.status(400).json({ message: 'Invalid role or login flow.' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
};

// Resend OTP
exports.resendOtp = async (req, res) => {
    const { phone } = req.body;
    try {
        await sendOtp(phone);
        res.status(200).json({ message: 'OTP resent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error resending OTP', error: error.message });
    }
};

// Verify OTP (for admin/customer login, and restaurant/delivery verification)
exports.verifyOtp = async (req, res) => {
    const { phone, otp, name, role } = req.body;
    // Add validation for required fields
    if (!phone || !otp) {
        return res.status(400).json({ message: 'Phone and OTP are required.' });
    }
    try {
        const isValid = await verifyOtp(phone, otp);
        if (!isValid) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        // Restaurant/Delivery OTP verification for registration
        if (tempRegistrationStore.has(phone)) {
            const regData = tempRegistrationStore.get(phone);
            // Double-check user doesn't exist
            let existing = await User.findOne({ $or: [{ email: regData.email }, { phone }] });
            if (existing) {
                tempRegistrationStore.delete(phone);
                return res.status(400).json({ message: 'User already exists with this email or phone' });
            }
            let newUser = new User({
                name: regData.name,
                phone: regData.phone,
                email: regData.email,
                password: regData.password, // Will be hashed by pre-save hook
                role: regData.role,
                isVerified: true,
                isApproved: false, // pending admin approval
                status: 'pending',
                addresses: [], // <-- Fix: prevent validation error
                ...(regData.role === 'restaurant'
                  ? { restaurantDetails: { image: regData.imagePath } }
                  : { deliveryDetails: { image: regData.imagePath, vehicleType: regData.vehicle } })
            });
            await newUser.save();
            tempRegistrationStore.delete(phone);
            return res.status(200).json({
                message: 'Phone verified. Registration request sent for admin approval.',
            });
        } 
        // Admin OTP login
        else if (phone === '9534495027') {
            // Admin OTP login
            let user = await User.findOne({ phone, role: 'admin' });
            if (!user) {
                user = new User({
                    name: name || 'Admin',
                    phone,
                    role: 'admin',
                    password: 'adminotp', // <-- Add this line
                    isVerified: true,
                    isApproved: true,
                    status: 'active',
                    addresses: [] // <-- Fix: prevent validation error
                    // Do NOT set email at all here!
                });
                await user.save();
            }
            user.isVerified = true;
            user.isApproved = true;
            user.status = 'active';
            await user.save();
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
            return res.status(200).json({
                message: 'OTP verified, logged in as admin',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    phone: user.phone,
                    role: user.role
                }
            });
        } 
        // Restaurant/Delivery OTP login (not registration)
        else if (role === 'restaurant' || role === 'delivery') {
            // Defensive: fallback to checking all roles if role is missing
            let user = await User.findOne({ phone, role: role || { $in: ['restaurant', 'delivery'] } });
            if (!user) {
                return res.status(404).json({ message: 'Your number is not registered yet. Please register first.' });
            }
            if (!user.isApproved) {
                return res.status(403).json({ message: 'Your request has not been approved by the admin yet.' });
            }
            if (user.status === 'inactive' || user.status === 'blocked') {
                return res.status(403).json({ message: 'Your account is blocked' });
            }
            user.isVerified = true;
            user.status = 'active';
            await user.save();
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
            return res.status(200).json({
                message: 'OTP verified, logged in as ' + user.role,
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    isVerified: user.isVerified,
                    isApproved: user.isApproved,
                    status: user.status,
                    restaurantDetails: user.restaurantDetails,
                    deliveryDetails: user.deliveryDetails
                }
            });
        }
        // Customer OTP login (existing logic, only if role is customer or fallback)
        else {
            let user = await User.findOne({ phone, role: 'customer' });
            if (!user) {
                // Only require name for new user
                if (!name) {
                    return res.status(400).json({ message: 'Name is required for new customer registration' });
                }
                user = new User({
                    name: name,
                    phone,
                    role: 'customer',
                    isVerified: true,
                    isApproved: true,
                    status: 'active',
                    addresses: [] // <-- Fix: prevent validation error for new customer
                });
                await user.save();
            } else {
                if (user.status === 'inactive' || user.status === 'blocked') {
                    return res.status(403).json({ message: 'Your account is blocked' });
                }
                // Update name if provided and different
                if (name && user.name !== name) {
                    user.name = name;
                    await user.save();
                }
            }
            user.isVerified = true;
            user.isApproved = true;
            user.status = 'active';
            await user.save();
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
            return res.status(200).json({
                message: 'OTP verified, logged in as customer',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    phone: user.phone,
                    role: user.role
                }
            });
        }
    } catch (error) {
        console.error('Verify OTP error:', error); // Debug
        // Add error stack for debugging
        res.status(500).json({ message: 'Error verifying OTP', error: error.message, stack: error.stack });
    }
};

// Login user (only for restaurant/delivery after approval)
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || user.role === 'customer') {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Block login if status is inactive or blocked
        if (user.status === 'inactive' || user.status === 'blocked') {
            return res.status(403).json({ message: 'Your account is blocked' });
        }
        if (!user.isVerified) {
            return res.status(403).json({ message: 'Please verify your phone number first.' });
        }
        if (!user.isApproved) {
            return res.status(403).json({ message: 'Your register request is pending, waiting for admin to approve it.' });
        }
        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified,
                isApproved: user.isApproved,
                status: user.status,
                restaurantDetails: user.restaurantDetails,
                deliveryDetails: user.deliveryDetails
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

// Forgot password (restaurant/delivery): send OTP to phone
exports.forgotPassword = async (req, res) => {
    const { phone } = req.body;
    try {
        const user = await User.findOne({ phone, role: { $in: ['restaurant', 'delivery'] } });
        if (!user) {
            return res.status(404).json({ message: 'User not found with this phone' });
        }
        await sendOtp(phone);
        res.status(200).json({ message: 'OTP sent to your phone for password reset' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
};

// Verify OTP for forgot password (restaurant/delivery)
exports.verifyForgotOtp = async (req, res) => {
    const { phone, otp } = req.body;
    try {
        const isValid = await verifyOtp(phone, otp);
        if (!isValid) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        // Mark as verified for password reset
        res.status(200).json({ message: 'OTP verified. You can now reset your password.' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying OTP', error: error.message });
    }
};

// Reset password (restaurant/delivery)
exports.resetPassword = async (req, res) => {
    const { phone, newPassword } = req.body;
    try {
        const user = await User.findOne({ phone, role: { $in: ['restaurant', 'delivery'] } });
        if (!user) {
            return res.status(404).json({ message: 'User not found with this phone' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
};

// Refresh token
exports.refreshToken = async (req, res) => {
    const { token } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ token: newToken });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Logout
exports.logout = async (req, res) => {
    // Logic to handle logout (e.g., blacklist token if needed)
    res.status(200).json({ message: 'User logged out successfully' });
};