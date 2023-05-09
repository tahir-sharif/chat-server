const { socketProtect } = require('../middlewares/authentication');
const { saveMessageToDB } = require('./chatsController');

const realTimeSocket = (io) => {
  const connectedUsers = new Map();

  // authenticate
  io.use(socketProtect);

  const statuses = {
    sent: 'sent',
    delivered: 'delivered'
  };

  // connect
  io.on('connection', (socket) => {
    const user = socket.data.user;
    connectedUsers.set(user.id, socket.id);
    console.log('user connected !', user.name, '==>', user.id);

    socket.on('send-message', ({ message, id: receiverId, createdAt }, ack) => {
      const recieverSocketId = connectedUsers.get(receiverId);

      saveMessageToDB({
        senderId: user.id,
        receiverId,
        message
      });

      const messageObj = {
        senderId: user.id,
        receiverId,
        message,
        createdAt
      };

      if (recieverSocketId) {
        io.to(recieverSocketId).emit('receive-message', messageObj);
        return ack({
          ...messageObj,
          status: statuses.delivered
        });
      }

      ack({
        ...messageObj,
        status: statuses.sent
      });
    });

    socket.on('disconnect', () => {
      console.log('user disconnected !', user.name, '==>', user.id);
      connectedUsers.delete(user.id);
    });
  });
};
module.exports = realTimeSocket;
