const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (amount, currency) => {
    const options = {
        amount: amount * 100, // amount in the smallest currency unit
        currency: currency,
        receipt: crypto.randomBytes(16).toString('hex'),
    };

    try {
        const order = await razorpayInstance.orders.create(options);
        return order;
    } catch (error) {
        throw new Error('Error creating order: ' + error.message);
    }
};

const verifyPayment = (paymentId, orderId, signature) => {
    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(orderId + '|' + paymentId)
        .digest('hex');

    if (generatedSignature === signature) {
        return true;
    } else {
        throw new Error('Payment verification failed');
    }
};

module.exports = {
    createOrder,
    verifyPayment,
};