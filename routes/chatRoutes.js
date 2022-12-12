const express = require("express");
const router = express.Router();
const {
  getChats,
  getchatuser,
  sendMessage,
  getConversation,
} = require("../controllers/chatsController");

const { protect } = require("../middlewares/authentication");

router.get("/getchats", protect, getChats);

router.get("/getuser/:id", protect, getchatuser);

router.post("/sendmessage/:recieverId", protect, sendMessage);

router.get("/getconversation/:recieverId", protect, getConversation);

module.exports = router;
