const mongoose = require("mongoose");
const collectionName = "CryptoLearn-Backend";
const URI = `mongodb://localhost:27017/${collectionName}?readPreference=primary&appname=MongoDB%20Compass&ssl=false`;

const Dbconnection = async () => {
  mongoose.connect(URI, () => {
    console.log("Hey Wohh We connect to db successfully");
  });
};

module.exports = Dbconnection;
