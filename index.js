const express = require('express');
const connectDB = require('./config/db');
const http = require('http');
const cors = require('cors');
require('dotenv').config();
const app = express();
const { Server } = require('socket.io');
const realTimeSocket = require('./controllers/socket');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'https://chat-app-git-master-tahir150.vercel.app',
      'http://localhost:6501',
      'https://chat-app-tahir150.vercel.app'
    ],
    methods: ['GET', 'POST']
  }
});
const port = process.env.PORT || 6500;

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// enable CORS
app.use(cors());

// log incoming requests
let requests = 0;
app.use((req, res, next) => {
  requests++;
  console.log('Req no. ' + requests, req.method, req.url);
  next();
});

// RealTime Connections
realTimeSocket(io);

// Api Requests
app.get('/', (req, res) => {
  res.send('Hello Tahir !');
});

app.use('/api/user', require('./routes/userRoutes'));

app.use('/api/chats', require('./routes/chatRoutes'));

// Handle CORS errors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

// Connect to the database and start listening
connectDB();
server.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
