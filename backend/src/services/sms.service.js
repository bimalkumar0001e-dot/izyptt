const axios = require('axios');
require('dotenv').config();

exports.sendSMS = async (phone, otp) => {
  const apiKey = process.env.FAST2SMS_API_KEY; // Store your API key in .env
  const url = 'https://www.fast2sms.com/dev/bulkV2';
  try {
    const response = await axios.get(url, {
      params: {
        authorization: apiKey,
        route: 'otp',
        variables_values: otp,
        numbers: phone,
        flash: '0'
      }
    });
    return response.data;
  } catch (error) {
    console.log('Fast2SMS error:', error.message);
    return false;
  }
};