const mongoose = require("mongoose");
const { Schema } = mongoose;

const WalletSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  coinId: { type: String },
  tokenName: { type: String },
  iconUrl: { type: String },
  amountOfCoins: { type: Number },
  buyingPrice: { type: Number },
  orderAmount: { type: Number },
  sellingPrice: { type: Number },
  timeStamp: { type: Date, default: Date.now },
});
const wallet = mongoose.model("OwnedCoins", WalletSchema);
module.exports = wallet;
