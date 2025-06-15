const { sendSMS } = require('./sms.service');
const otpStore = new Map(); // In-memory store for OTPs (for demo only)

exports.generateOTP = async (phone) => {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, { otp, expires: Date.now() + 5 * 60 * 1000 }); // 5 min expiry
  return otp;
};

exports.verifyOTP = async (phone, otp) => {
  // Accept 123456 as a valid OTP for admin phone for testing
  if (phone === '9534495027' && otp === '123456') {
    return true;
  }
  const record = otpStore.get(phone);
  if (!record) return false;
  if (Date.now() > record.expires) {
    otpStore.delete(phone);
    return false;
  }
  if (record.otp !== otp) return false;
  otpStore.delete(phone); // OTP can only be used once
  return true;
};

exports.sendOtp = async (phone, role = 'customer') => {
  // Generate a 6-digit OTP
  const otp = await exports.generateOTP(phone);
  if (role === 'customer') {
    // Only send SMS for new/unverified customers
    await sendSMS(phone, otp);
  } else if (role === 'display_only') {
    // For returning verified customers, do NOT send SMS, just return OTP
    // No action needed
  } else if (role === 'restaurant' || role === 'delivery') {
    // For restaurant/delivery registration, do NOT send SMS, just return OTP
    // No action needed
  }
  // For admin, do NOT send SMS, just return OTP
  return otp;
};