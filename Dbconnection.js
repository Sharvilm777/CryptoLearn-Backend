const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
// const collectionName = "CryptoLearn-Database";
// const URI = `mongodb://localhost:27017/${collectionName}?readPreference=primary&appname=MongoDB%20Compass&ssl=false`;
// const URI = `mongodb+srv://Sharvil:Sharvilm@143@cluster0.6e3jweq.mongodb.net/CryptoLearn?retryWrites=true&w=majority`;
console.log(process.env.DB_URI);
const Dbconnection = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("Hey Wohh We connected to the database successfully");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

module.exports = Dbconnection;
