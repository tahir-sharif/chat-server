const conversationModel = require('../models/conversationModel');
const userModel = require('../models/userModel');
const User = require('../models/userModel');

const getChats = async (req, res) => {
  const allUsers = await User.find().select('-password');
  res.json({ chats: allUsers });
};

const getchatuser = async (req, res) => {
  const { id } = req.params;
  try {
    const chatUser = await User.findById(id)
      .select('-password')
      .select('-chats');
    res.json({ user: chatUser });
  } catch (e) {
    res.status(400).json({ error: e });
  }
};

const sendMessage = async (req, res) => {
  const senderId = req.user._id.toString();
  const { receiverId } = req.params;
  const { message } = req.body;

  const conversationId = getConversationId(senderId, receiverId);

  try {
    if (message) {
      const messageObj = {
        message,
        sender: senderId
      };

      // first we find a user
      const recieverUser = await userModel.findById(receiverId);
      if (recieverUser) {
        // updating message
        conversationModel.updateOne(
          { conversationId },
          { $push: { messages: messageObj } },
          {
            new: true,
            upsert: true
          },
          (err, docs) => {
            if (err) {
              console.log(err);
              res.status(400).json({ error: "can't send message !" });
            }
          }
        );

        // Upadting Main view Chats
        const upateChatsDataOfUser = async (firstId, secondId) => {
          const objToset = {
            user: secondId,
            lastMessage: { ...messageObj, createdAt: Date.now() },
            createdAt: Date.now()
          };
          const chatObj = await userModel.findOneAndUpdate(
            { _id: firstId, 'chats.user': secondId },
            { $set: { 'chats.$': objToset } }
          );
          // if not in a chat array then push new one
          if (!chatObj) {
            return await userModel.updateOne(
              { _id: firstId },
              { $push: { chats: objToset } }
            );
          }
        };

        // for sender
        await upateChatsDataOfUser(senderId, receiverId);
        // for reciever
        await upateChatsDataOfUser(receiverId, senderId);

        res.json(messageObj);
      } else {
        res.status(400).json({
          error: "The user you're trying to reach , doesn't exists !"
        });
      }
    } else {
      res.status(400).json({ error: 'message must be provided !' });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: e });
  }
};

const saveMessageToDB = async ({ senderId, receiverId, message }) => {
  const conversationId = getConversationId(senderId, receiverId);

  try {
    if (message) {
      const messageObj = {
        message,
        senderId
      };

      // first we find a user
      const recieverUser = await userModel.findById(receiverId);
      console.log(recieverUser, receiverId);
      if (recieverUser) {
        // updating message
        conversationModel.updateOne(
          { conversationId },
          { $push: { messages: messageObj } },
          {
            new: true,
            upsert: true
          },
          (err, docs) => {
            if (err) {
              console.log(err);
              return new Error("can't update conversation");
            }
          }
        );

        // Upadting Main view Chats
        const upateChatsDataOfUser = async (firstId, secondId) => {
          const objToset = {
            user: secondId,
            lastMessage: { ...messageObj, createdAt: Date.now() },
            createdAt: Date.now()
          };
          const chatObj = await userModel.findOneAndUpdate(
            { _id: firstId, 'chats.user': secondId },
            { $set: { 'chats.$': objToset } }
          );
          // if not in a chat array then push new one
          if (!chatObj) {
            return await userModel.updateOne(
              { _id: firstId },
              { $push: { chats: objToset } }
            );
          }
        };

        // for sender
        await upateChatsDataOfUser(senderId, receiverId);
        // for reciever
        await upateChatsDataOfUser(receiverId, senderId);

        console.log('sett');
        return;
      } else {
        return new Error("The user you're trying to reach , doesn't exists !");
      }
    } else {
      return new Error('message must be provided !');
    }
  } catch (e) {
    console.log(e);
    return new Error("can't send message");
  }
};

const getConversation = async (req, res) => {
  const senderId = req.user._id.toString();
  const { receiverId } = req.params;
  const conversationId = getConversationId(senderId, receiverId);
  try {
    const conversation = await conversationModel.findOne({
      conversationId
    });
    res.json({
      conversation
    });
  } catch (e) {
    res.status(400).json({
      error: 'cannot get conversation !',
      serverError: e
    });
  }
};

// helper functions
const getConversationId = (firstId, secondId) => {
  const conversationId = [firstId, secondId].sort().join('');
  return conversationId;
};
module.exports = {
  getChats,
  getchatuser,
  sendMessage,
  getConversation,
  saveMessageToDB
};
