const express = require("express");
const connectDB = require("./config/db");
var cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT;

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Api Requests
app.get("/", (req, res) => {
  res.send("Hello Tahir !");
});

app.use(
  "/api/user",
  (req, res, next) => {
    console.log(req.url, req.body);
    next();
  },
  require("./routes/userRoutes")
);

app.use(
  "/api/chats",
  (req, res, next) => {
    console.log(req.url, req.body);
    next();
  },
  require("./routes/chatRoutes")
);

//--Connecting Database and Listening Server
connectDB();
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
