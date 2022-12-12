const { socketProtect } = require("../middlewares/authentication");

const realTimeSocket = (io) => {
  io.use(socketProtect);
  io.on("connection", (socket) => {
    console.log("user connected !");
  });
};
module.exports = realTimeSocket;
