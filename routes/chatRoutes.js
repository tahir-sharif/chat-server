const express = require('express');
const router = express.Router();
const {
  getChats,
  getchatuser,
  sendMessage,
  getConversation
} = require('../controllers/chatsController');

const { protect } = require('../middlewares/authentication');

router.get('/getchats', protect, getChats);

router.get('/getuser/:id', protect, getchatuser);

router.post('/sendmessage/:receiverId', protect, sendMessage);

router.get('/getconversation/:receiverId', protect, getConversation);

module.exports = router;
