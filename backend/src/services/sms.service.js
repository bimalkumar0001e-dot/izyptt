const axios = require('axios');
require('dotenv').config();

exports.sendSMS = async (phone, message) => {
  // No SMS sending, just log for debugging
  console.log(`[OTP SMS] Would send to: ${phone} | OTP: ${message}`);
  return true;
};