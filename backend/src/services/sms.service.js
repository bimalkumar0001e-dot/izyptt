const axios = require('axios');

exports.sendSMS = async (phone, message) => {
  // For now, just log the OTP message to the terminal
  console.log(`[OTP SMS] To: ${phone} | Message: ${message}`);
  return true;
};