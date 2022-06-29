const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const User = require("../Models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

//Route 1: "api/auth/login" Login : API is to signup the user
router.post(
  "/login",
  //check the body with the expressvalidator
  [body("email").isEmail(), body("password").isLength({ min: 5 })],
  async (req, res) => {
    //Assigning a validationResult to errors
    const errors = validationResult(req);
    //Check the error array is empty
    //If not then we have to send the errors to the client
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    //fetching the details from the DB
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      //If user is not exists then the user with that email doesnot exist
      //so we have to send the same to the client
      return res
        .status(400)
        .json({ msg: "User with the Email Doesn't Exists" });
    }
    //assiging the user id to jwtData to send that to sign in jwt
    //Here we are sending id of the user because it is easy to validate with id and retrival of data using unique id is faster compare to others
    let jwtData = {
      user: {
        id: user.id,
      },
    };
    //Here we are signing the authToken with the data and JWTSIGNATURE
    //And we made the token to expires in 6h
    let authToken = jwt.sign(jwtData, process.env.JWTSIGN, {
      expiresIn: "6h",
    });
    //we are using bcrypt to encrypt the data
    //Here we are using compareSync() to check the user password
    //It checks the hash of the password stored in DB and the entered passowrd is matching or not
    //If yes then it returns true
    //Then user can login succesfully
    if (bcrypt.compareSync(req.body.password, user.password)) {
      //it is matching then we have to send the status of OK and some texts
      return res
        .status(200)
        .json({ msg: "User signed in succesfully", authToken });
    } else {
      //If it is not matching then the entered password is wrong so we have to send the client a status bad requst and some texts
      res.status(400).json({ msg: "Entered password is Wrong" });
    }
  }
);

// Route 2:APi to create a new user :"api/auth/signup"
router.post(
  "/signup",
  [
    //check the body with the expressvalidator
    body("name").isLength({ min: 3 }),
    body("password").isLength({ min: 5 }),
    body("email").isEmail(),
  ],
  async (req, res) => {
    //Assigning a validationResult to errors
    const errs = validationResult(req);
    //Check the error array is empty
    //If not then we have to send the errors to the client
    if (!errs.isEmpty()) {
      return res.status(400).json({ errors: errs.array() });
    }
    //Here we are checking If the user with the email already exists or not
    let user = await User.findOne({ email: req.body.email });
    //If yes then we are returning the bad request status and some texts
    if (user) {
      return res
        .status(400)
        .json({ error: "Sorry User with Email already exists" });
    }
    //If not then we have to create that user
    /*Im using bcryptjs to encrypt the sensitve data like password
    Because storing senstive data in plain text is bad idea 
    If hacker get access to the DB then he will get the senstive data easily 
    So we have to save our senstive data from the hackers 
    Thats why im using encryption(hashing)
    hash is one way function we cant reverse it back
    */
    //Here we are generating salt using genSalt() function of bcryptjs package
    const salt = await bcrypt.genSalt(10);
    //Here we are genrating a hash of the user password and salt together
    const securedPassword = await bcrypt.hash(req.body.password, salt);
    //here we are creating a new User object with the details of the user
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: securedPassword,
    });
    //Sending the created user to client
    res.json(user);
  }
);
//Route 3: Get the details of the user :"api/auth/getDetails : LOGIN required"
//Here we are using fetchuser middleware that is to validate the authToken and append the user id to request
router.post("/getDetails", fetchuser, async (req, res) => {
  try {
    //Here we are trying to find the user and send details of the user except password
    let user = await User.findById(req.user).select("-password");
    if (!user) {
      //If user is not exists then we have to send the same to the client
      return res.status(400).json({ msg: "User Doesn't Exists Please Login" });
    }
    //If user is present then we have send all details except password
    res.json(user);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});
module.exports = router;
