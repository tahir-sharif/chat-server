const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const checkifUser = async (query, extended) => {
  const userExists = await User.findOne(query)
    .populate({
      path: "chats.user",
      model: "User",
      select: "-chats",
    })
    .select("-user.chats");
  if (extended) return userExists;
  return userExists !== null;
};

const registerUser = async (req, res) => {
  const { name, userName, password } = req.body;
  //   trying to register a user
  if (name && userName && password) {
    const userExists = await checkifUser({ userName });
    if (userExists) {
      res.status(400).json({ error: "user already exists" });
    } else {
      try {
        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Finally create a user
        await User.create({
          name,
          userName,
          password: hashedPassword,
          profileImage:
            "https://i.pinimg.com/originals/28/a4/70/28a470426182529c6a58593f69eb1117.jpg",
        }).then(async (user) => {
          // sending response after registered
          const userTOsend = JSON.parse(JSON.stringify(user));
          delete userTOsend.password;
          const chats = await getChats();

          res.json({ user: userTOsend, token: generateToken(user._id) });
        });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    }
  } else {
    res.status(400).json({ error: "incomplete fields " });
  }
};

const loginUser = async (req, res) => {
  const { userName, password } = req.body;
  if (userName && password) {
    // finding user
    const user = await checkifUser({ userName }, true);

    if (user) {
      // checking password
      const passwordMatch = await bcrypt.compare(password, user.password);
      // removing password field
      const userTOsend = JSON.parse(JSON.stringify(user));
      delete userTOsend.password;
      if (passwordMatch) {
        // here user can login
        const chats = await getChats();

        res.json({
          user: userTOsend,
          token: generateToken(user._id),
          // chats,
        });
      } else {
        res
          .status(400)
          .json({ error: "sorry you've entered incorrect password !" });
      }
    } else {
      res.status(400).json({ error: "user doesn't exists" });
    }
  } else {
    res.status(401).json({ error: "incomplete fields " });
  }
};

const canRegister = async (req, res) => {
  const { userName } = req.params;
  const userExists = await checkifUser({ userName });
  res.json({ canRegister: !userExists });
};

const getMe = async (req, res) => {
  try {
    const user = await checkifUser({ _id: req.user._id.toString() }, true);
    // const user = await User.findById(userId);
    console.log(user);
    if (user) {
      const userTOsend = JSON.parse(JSON.stringify(user));
      delete userTOsend.password;
      const chats = await getChats();

      res.json({
        user: userTOsend,
      });
    } else {
      res.status(400).json({ error: "user doesn't exists" });
    }
  } catch (e) {
    // console.log(e);
    res.status(400).json({ error: "invalid user request !" });
  }
};

const searchUsers = async (req, res) => {
  const keywords = req.query?.q || "tahir";
  const reg = new RegExp(keywords, "i");
  const result = await User.find({ name: reg }).select("_id name profileImage");
  console.log("---searched for", keywords);
  res.json(result);
};

// helpers
const getChats = async () => {
  const chats = await User.find().select("-password");
  return chats;
};
const generateToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  return token;
};

module.exports = { registerUser, loginUser, canRegister, getMe, searchUsers };
