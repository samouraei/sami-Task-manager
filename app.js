require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const Router = require('./routes/mainRoute');
const { startTaskScheduler } = require('./services/taskSchedulerService');
const session = require("express-session");
const { redisStore } = require('./utils/redis'); // Add this line at the top

const app = express();


// Start the task scheduler
startTaskScheduler();

app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend port
}));

app.use(
  session({
    store: redisStore, // Store session in Redis
    secret: process.env.SESSION_SECRET || "supersecretkey", // Change this in production
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production if using HTTPS
      httpOnly: true, // Prevent client-side JS from accessing cookies
      maxAge: 1000 * 60 * 60 * 24, // 1 day expiration
    },
  })
);

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from the same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour.',
});
app.use('/api', limiter);

// Body parser reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes
app.use('/api/v1/web', Router);

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
