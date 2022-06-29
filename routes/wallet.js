const express = require("express");
const router = express.Router();
const portfolio = require("../Models/CoinCollections");
const validator = require("express-validator");
const { body, validationResult } = validator;
const fetchuser = require("../middleware/fetchuser");

//Route 1:Api call to get all the coins that user own "api/coin/fetchAll" : LOGIN required
router.get("/fetchAll", fetchuser, async (req, res) => {
  //fetching all the details of the user
  let ownedCoins = await portfolio.find({ user: req.user });
  //Sending all details to the client
  res.json(ownedCoins);
});
//Route 2:Api call to buy the coin "api/coin/buyCoin" :LOGIN required
router.post("/buyCoin", fetchuser, async (req, res) => {
  //fetching the coin details if coin already exist then we have to update the buy order
  let coin = await portfolio.findOne({ coinId: req.body.coinId });
  //if not then we have to create a new order request
  if (!coin) {
    //creating a new object of the coin and setting the details from the body of the request
    let buyingCoin = new portfolio({
      user: req.user,
      coinId: req.body.coinId,
      tokenName: req.body.tokenName,
      iconUrl: req.body.iconUrl,
      amountOfCoins: req.body.amountOfCoins,
      buyingPrice: req.body.buyingPrice,
      orderAmount: req.body.orderAmount,
      sellingPrice: req.body.sellingPrice,
    });
    //Saving the new coin in DB
    buyingCoin.save();
    //sending that new object to the client
    res.json(buyingCoin);
  }
  if (coin) {
    //If coin already exists then destructure all details from the coin object
    let { amountOfCoins, buyingPrice, orderAmount, sellingPrice } = coin;
    //creating a new object to save the updates
    let newCoin = {};
    //Is to check wheter we received the amountOfCoins and update it
    if (amountOfCoins) {
      newCoin.amountOfCoins = amountOfCoins + req.body.amountOfCoins;
    }
    //Is to check wheter we received the buyingPrice and update it
    if (buyingPrice) {
      let updatedPrice = (buyingPrice + req.body.buyingPrice) / 2;
      newCoin.buyingPrice = updatedPrice;
    }
    //Is to check wheter we received the sellingPrice and update it
    if (sellingPrice) {
      newCoin.sellingPrice = req.body.sellingPrice;
    }
    //Is to check wheter we received the sellingPrice and update it
    if (orderAmount) {
      newCoin.orderAmount = orderAmount + req.body.orderAmount;
    }
    //finding that coin and update it with the newCoin
    coin = await portfolio.findByIdAndUpdate(
      coin._id,
      { $set: newCoin },
      { new: true }
    );
    //Sending the coin to the client
    res.json(coin);
  }
});

//Route 3: Api to sell the coin "api/coin/sellcoin" LOGIN:required
router.post("/sellCoin", fetchuser, async (req, res) => {
  //fecthing the coin with the id
  let coin = await portfolio.findOne({ coinId: req.body.coinId });
  //If coin is not there then send a bad status and some msg
  if (!coin) {
    return res.status(400).json({ msg: "You dont have this coin to sell" });
  }
  //If coin is present in DB
  if (coin) {
    //getting the all details of the coin
    let { amountOfCoins, buyingPrice, orderAmount, sellingPrice } = coin;

    //creating a new object to save the updates
    let newCoin = {};

    //Is to check wheter we received the amountOfCoins and update it
    if (amountOfCoins) {
      //If amountOfCoins - amountOfCoins in request body is less then or equal to 0
      //user is trying to sell the coin completly so we have to delete that object from the DB
      if (amountOfCoins - req.body.amountOfCoins == 0) {
        // portfolio.findOneAndDelete(coin._id, (err, result) => {
        //   if (err) {
        //     return res.json({ err });
        //   } else {
        //     return res.json({ msg: "Deleted successfully from DB", result });
        //   }
        // });
        let result = await portfolio.findOneAndDelete(coin._id);
        return res.json({ msg: "Deleted successfully from DB", result });
      }
      //else user trying to sell some of his holding
      //So we have to sell how much user saying to sell
      if (amountOfCoins - req.body.amountOfCoins > 0) {
        console.log(amountOfCoins, req.body.amountOfCoins);
        //Subtracting the amountOfCoins with the amountOfCoins request body
        newCoin.amountOfCoins = amountOfCoins - req.body.amountOfCoins;
        //After setting the newCoin Here we are Updating the coin from DB
        coin = await portfolio.findByIdAndUpdate(
          coin._id,
          { $set: newCoin },
          { new: true }
        );
        //Sending the coin to the user
        return res.json({ coin });
      }
      //If user is tryign to sell more then he have then we have to send bad status and some texts
      if (amountOfCoins - req.body.amountOfCoins < 0) {
        return res.status(400).send("You cant sell more than u have");
      }
    }
  }
});

module.exports = router;
