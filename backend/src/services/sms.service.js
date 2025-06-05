const axios = require('axios');
require('dotenv').config();

exports.sendSMS = async (phone, message) => {
  // Use Fast2SMS API to send SMS
  try {
    const apiKey = process.env.FAST2SMS_API_KEY;
    if (!apiKey) {
      throw new Error('FAST2SMS_API_KEY not set in environment');
    }
    const url = 'https://www.fast2sms.com/dev/bulkV2';
    const payload = {
      route: 'otp',
      variables_values: message,
      numbers: phone,
      sender_id: 'FSTSMS',
      message: message,
      language: 'english',
      flash: 0
    };
    const headers = {
      'authorization': apiKey,
      'Content-Type': 'application/json'
    };
    const response = await axios.post(url, payload, { headers });
    console.log(`[OTP SMS] Sent to: ${phone} | Response:`, response.data);
    return true;
  } catch (error) {
    console.error('Error sending SMS via Fast2SMS:', error.response ? error.response.data : error.message);
    return false;
  }
};