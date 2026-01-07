const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('./errorHandler');

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization');
  
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return next(new UnauthorizedError('No token, authorization denied'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    return next(new UnauthorizedError('Token is not valid'));
  }
};