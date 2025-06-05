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
  if (record.otp !== otp) return false;
  if (Date.now() > record.expires) return false;
  otpStore.delete(phone); // OTP can only be used once
  return true;
};

exports.sendOtp = async (phone) => {
  // Generate a 6-digit OTP
  const otp = await exports.generateOTP(phone);
  // Send only the numeric OTP to Fast2SMS (OTP route requires only numbers)
  await sendSMS(phone, otp);
  // Optionally log or return the OTP for debugging
  return otp;
};