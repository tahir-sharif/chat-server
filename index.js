const express = require("express");
const connectDB = require("./config/db");
const http = require("http");
var cors = require("cors");
require("dotenv").config();
const app = express();
const { Server } = require("socket.io");
const { socketProtect } = require("./middlewares/authentication");
const realTimeSocket = require("./controllers/socket");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
// const io = require("socket.io")(server);
const port = process.env.PORT || 6500;

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
let requests = 0;
app.use((req, res, next) => {
  requests++;
  console.log("Req no. " + requests, req.method, req.url);
  next();
});

// RealTime Connections
realTimeSocket(io);

// Api Requests
app.get("/", (req, res) => {
  res.send("Hello Tahir !");
});

app.use("/api/user", require("./routes/userRoutes"));

app.use("/api/chats", require("./routes/chatRoutes"));

//--Connecting Database and Listening Server
connectDB();
server.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
