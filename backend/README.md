# Food and Grocery Delivery Platform

## Overview
This project is a backend application for a food and grocery delivery platform built using Node.js and Express.js. It provides RESTful APIs for user authentication, product management, order processing, and restaurant management.

## Features
- User authentication (register, login, password reset)
- Product management (CRUD operations)
- Order management (place, update, retrieve orders)
- Restaurant management (CRUD operations)
- Middleware for error handling and authentication
- Notification service for real-time updates
- Payment processing integration

## Technologies Used
- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT for authentication
- Socket.IO for real-time notifications
- Razorpay for payment processing

## Project Structure
```
food-grocery-backend
├── src
│   ├── app.js
│   ├── config
│   │   └── db.js
│   ├── controllers
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   ├── restaurantController.js
│   │   └── userController.js
│   ├── middlewares
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── models
│   │   ├── order.js
│   │   ├── product.js
│   │   ├── restaurant.js
│   │   └── user.js
│   ├── routes
│   │   ├── authRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── productRoutes.js
│   │   ├── restaurantRoutes.js
│   │   └── userRoutes.js
│   ├── services
│   │   ├── notificationService.js
│   │   └── paymentService.js
│   └── utils
│       └── helpers.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   cd food-grocery-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```
   DATABASE_URL=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   RAZORPAY_KEY=<your-razorpay-key>
   RAZORPAY_SECRET=<your-razorpay-secret>
   ```

4. Start the application:
   ```
   npm start
   ```

## API Usage
Refer to the API documentation for detailed information on the available endpoints and their usage.

## License
This project is licensed under the MIT License.