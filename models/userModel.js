const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    userName: {
      type: String,
      required: [true, "Please add a username"],
      unique: true,
      validate: {
        validator: function (userName) {
          return userName.includes(".") || userName.includes("_");
        },
        message: "Please enter a valid username",
      },
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minLength: [6, "password must be equal or greator than 6 characters"],
    },
    chats: {
      type: Array,
      default: [],
    },
    profileImage: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
