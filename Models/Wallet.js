const mongoose = require("mongoose");
const { Schema } = mongoose;

const WalletBalanceSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  walletBalance: {
    type: Number,
  },
});
const walletBalance = mongoose.model("walletBalance", WalletBalanceSchema);
module.exports = walletBalance;
