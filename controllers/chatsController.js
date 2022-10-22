const conversationModel = require("../models/conversationModel");
const userModel = require("../models/userModel");
const User = require("../models/userModel");

const getChats = async (req, res) => {
  const allUsers = await User.find().select("-password");
  res.json({ chats: allUsers });
};

const getchatuser = async (req, res) => {
  const { id } = req.params;
  try {
    const chatUser = await User.findById(id)
      .select("-password")
      .select("-chats");
    res.json({ user: chatUser });
  } catch (e) {
    res.status(400).json({ error: e });
  }
};

const sendMessage = async (req, res) => {
  const senderId = req.user._id.toString();
  const { recieverId } = req.params;
  const { message } = req.body;

  const conversationId = getConversationId(senderId, recieverId);

  try {
    if (message) {
      const messageObj = {
        message,
        sender: senderId,
        reciever: recieverId,
      };

      // first we find a user
      const recieverUser = await userModel.findById(recieverId);
      if (recieverUser) {
        // updating message
        conversationModel.updateOne(
          { conversationId },
          { $push: { messages: messageObj } },
          {
            new: true,
            upsert: true,
          },
          (err, docs) => {
            if (err) {
              console.log(err);
              res.status(400).json({ error: "can't send message !" });
            }
          }
        );

        // Upadting Main view Chats
        const upateChatsDataOfUser = async (senderId, recieverId) => {
          const objToset = {
            user: recieverId,
            lastMessage: { ...messageObj, createdAt: Date.now() },
          };
          const chatObj = await userModel.findOneAndUpdate(
            { _id: senderId, "chats.user": recieverId },
            { $set: { "chats.$": objToset } }
          );
          // if not in a chat array then push new one
          if (!chatObj) {
            await userModel.updateOne(
              { _id: senderId },
              { $push: { chats: objToset } }
            );
          }
        };

        // for sender
        await upateChatsDataOfUser(senderId, recieverId);
        // for reciever
        await upateChatsDataOfUser(recieverId, senderId);

        res.json(messageObj);
      } else {
        res.status(400).json({
          error: "The user you're trying to reach , doesn't exists !",
        });
      }
    } else {
      res.status(400).json({ error: "message must be provided !" });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: e });
  }
};

const getConversation = async (req, res) => {
  const senderId = req.user._id.toString();
  const { recieverId } = req.params;
  const conversationId = getConversationId(senderId, recieverId);

  try {
    const conversation = await conversationModel.findOne({
      conversationId,
    });
    res.json({
      conversation,
    });
  } catch (e) {
    res.status(400).json({
      error: "cannot get conversation !",
      serverError: e,
    });
  }
};

// helper functions
const getConversationId = (firstId, secondId) => {
  const conversationId = [firstId, secondId].sort().join("");
  return conversationId;
};
module.exports = { getChats, getchatuser, sendMessage, getConversation };
