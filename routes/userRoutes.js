const express = require("express");
const router = express.Router();
const {
  loginUser,
  registerUser,
  canRegister,
  getMe,
} = require("../controllers/userControler");
const dummyprotect = require("../middlewares/authentication");

router.post("/login", loginUser);

router.post("/register", registerUser);

router.get("/canregister/:userName", canRegister);

router.get("/getme/", dummyprotect, getMe);


module.exports = router;
