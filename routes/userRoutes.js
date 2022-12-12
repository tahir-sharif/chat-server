const express = require("express");
const router = express.Router();
const {
  loginUser,
  registerUser,
  canRegister,
  getMe,
  searchUsers,
} = require("../controllers/userControler");
const { protect } = require("../middlewares/authentication");

router.post("/login", loginUser);

router.post("/register", registerUser);

router.get("/canregister/:userName", canRegister);

router.get("/getme/", protect, getMe);

router.get("/autocomplete", searchUsers);

module.exports = router;
