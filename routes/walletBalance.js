const express = require("express");
const router = express.Router();
const walletBalanceDb = require("../Models/Wallet");
const fetchuser = require("../middleware/fetchuser");

//Route 1 : api to get the Balance "api/wallet/getBalance" :LOGIN required
router.get("/getBalance", fetchuser, async (req, res) => {
  let Balance = await walletBalanceDb.findOne({ user: req.user });
  //if balance is not there then it is a new user so we have to credit the balance to his wallet
  if (!Balance) {
    //creating a new object of the user with the user id
    let bal = new walletBalanceDb({
      user: req.user,
      walletBalance: 100000,
    });
    //Saving the object in DB
    bal.save();
    //Sending response to the client
    res.status(200).json({
      msg: "Your wallet balance is credited successfully",
      walletBalance: bal.walletBalance,
    });
  }
  if (Balance) {
    //If user already exist then send his balance
    res.json({ Balance: Balance.walletBalance });
  }
});

//Route 2 : api to update the Balance "api/wallet/updateBalance" :LOGIN required
router.put("/updateBalance/:type", fetchuser, async (req, res) => {
  try {
    //fetching the existing balance of the user
    let Balance = await walletBalanceDb.findOne({ user: req.user });
    if (
      req.params.type === "sell" &&
      Balance.walletBalance + req.body.amount > 100000
    ) {
      return res.status(400).send("Wallet balance must be less then 100000");
    }
    if (
      req.params.type === "buy" &&
      Balance.walletBalance - req.body.amount < 0
    ) {
      return res.status(400).send("You dont have enough balance");
    }
    if (!Balance) {
      //If balance is not there then we cant able fetch the balance of the user
      //So we are send msg to client
      return res
        .status(400)
        .json({ msg: "Sorry we dont have any balance with this account" });
    }
    //If we got Balance the we have to extract{destructure}the walletBalance from that
    let { walletBalance } = Balance;
    //Creating newBal object to store the updated Balance in that
    let newBal = {};
    if (walletBalance && req.params.type === "buy") {
      //If the request is buy then we have to subtact the walletBalance with the amount
      newBal.walletBalance = walletBalance - req.body.amount;
    } else {
      //If the request is sell then we have to add the amount to the walletBalance
      newBal.walletBalance = walletBalance + req.body.amount;
    }
    //udpating the walletBalance with the new one
    Balance = await walletBalanceDb.findByIdAndUpdate(
      Balance._id,
      { $set: newBal },
      { new: true }
    );
    //sending the new updated balance to the client
    res.json({ Balance });
  } catch (error) {
    res.json({ error });
  }
});
module.exports = router;
