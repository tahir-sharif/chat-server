const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      const user = await userModel.findById(decoded.id).select("-password");
      console.log(user.userName);
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(401).json({ error: "you are not exists !" });
      }
    } catch (error) {
      console.log(error);
      res.status(401).json({ error: "Token not autorized !" });
    }
  } else {
    res.status(401).json({ error: "Token not provided" });
  }
};

const socketProtect = (socket, next) => {
  if (socket.request.headers) {
    next();
  } else {
    next(new Error("unauthorized"));
  }
};

module.exports = { protect, socketProtect };
