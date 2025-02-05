const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');




module.exports = (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Unauthorized: No active session" });
    }
    next();
  };
  