const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const Admin = require('../models/adminModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const redisSessionClient = require('../utils/redis').redisSessionClient; // Import the Redis client

const protect = (model, allowedRoles = []) => {
  return catchAsync(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // // Check if the token is in Redis
    // const redisToken = await redisSessionClient.get(`user:${decoded.id}:token`);

    // if (!redisToken || redisToken !== token) {
    //   return next(new AppError('Invalid token or session expired.', 401));
    // }

    // Determine which model to use (User or Admin)
    const currentUser = await model.findById(decoded.id);

    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    if (!allowedRoles.includes(currentUser.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    req.user = currentUser;
    next();
  });
};

const restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return next(new AppError('User role is undefined or missing. Access denied.', 403));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }

        next();
    };
};

module.exports = {
    protect,
    restrictTo
};