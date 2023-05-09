const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      const user = await userModel.findById(decoded.id).select('-password');
      console.log(user.userName);
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(401).json({ error: 'you are not exists !' });
      }
    } catch (error) {
      console.log(error);
      res.status(401).json({ error: 'Token not autorized !' });
    }
  } else {
    res.status(401).json({ error: 'Token not provided' });
  }
};

const socketProtect = async (socket, next) => {
  let token = socket.handshake.query?.token;
  if (!token) {
    return next(new Error('unauthorized'));
  }

  try {
    // Get token from header
    token = token.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token
    const user = await userModel.findById(decoded.id).select('-password');
    if (user) {
      socket.data.user = user;
      next();
    } else {
      return next(new Error('you are not exists !'));
    }
  } catch (error) {
    console.log(error);
    return next(new Error('Token not autorized !'));
  }
};

module.exports = { protect, socketProtect };
