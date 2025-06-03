const nodemailer = require('nodemailer');
const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
    io = new Server(server);
};

const sendEmailNotification = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const sendRealTimeNotification = (roomOrEvent, data) => {
    if (io) {
        // If the argument starts with "user:" or "delivery:", treat as a room
        if (roomOrEvent.startsWith('user:') || roomOrEvent.startsWith('delivery:')) {
            io.to(roomOrEvent).emit('notification', data);
        } else {
            io.emit(roomOrEvent, data);
        }
    }
};

const sendOtp = async (phone) => {
    const otp = '123456'; // Always use this for testing
    console.log(`OTP for ${phone}: ${otp}`);
    // Optionally, send SMS here
    return true;
};

const verifyOtp = async (email, otp) => {
    // Dummy: In production, verify OTP from DB or cache
    return otp === '123456'; // Accept '123456' as valid OTP for testing
};

// ...existing code...

module.exports = {
    initSocket,
    sendEmailNotification,
    sendRealTimeNotification,
    sendOtp,
    verifyOtp,
};