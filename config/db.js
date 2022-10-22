const mongoose = require("mongoose");
require("dotenv").config();
const mongoURI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB database Connected !`);
  } catch (error) {
    console.log("cannot connect to database ------", error);
  }
};

module.exports = connectDB;
