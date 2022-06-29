const mongoose = require("mongoose");
const { Schema } = mongoose;
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Users = mongoose.model("Users", userSchema);
module.exports = Users;
