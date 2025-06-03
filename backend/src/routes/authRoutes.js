const express = require('express');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
// Multer setup for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../restaurant_delv images');
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });




// Registration & Login
router.post('/register', upload.single('image'), authController.register); // <-- update here        // Customer/Restaurant/Delivery registration
router.post('/login', authController.login);               // Restaurant/Delivery login

// OTP Verification
router.post('/send-otp', authController.sendOtp);          // Send OTP (registration/resend)
router.post('/resend-otp', authController.resendOtp);      // Resend OTP
router.post('/verify-otp', authController.verifyOtp);      // Verify OTP (registration/login)

// Forgot Password (restaurant/delivery)
router.post('/forgot-password', authController.forgotPassword);      // Send OTP for password reset
router.post('/verify-forgot-otp', authController.verifyForgotOtp);   // Verify OTP for password reset
router.post('/reset-password', authController.resetPassword);        // Reset password

// Token Management
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', verifyToken, authController.logout);

// Multer error handler (must be after all routes using multer)
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    return res.status(400).json({ message: 'File upload error', error: err.message });
  } else if (err) {
    // Other errors
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
  next();
});

module.exports = router;