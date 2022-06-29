const jwt = require("jsonwebtoken");
const JWTSIGN = process.env.JWTSIGN;
//This is a middleware to check the authToken send by the user is really belongs to him
//Is to check the user is valid user or not
const fetchuser = (req, res, next) => {
  //Here im getting the token from the request header
  let token = req.header("authToken");
  //If token is not there that means he is not a valid user
  //So send a status of unauthorised user(401) and send some text to the client
  if (!token) {
    res.status(401).json({ error: "Please authenticate with valid authToken" });
  }
  try {
    //Here im verifying the user and getting the id from that token
    jwt.verify(token, JWTSIGN, (err, decoded) => {
      if (err) {
        res.status(400).json({ error: err });
      }
      //here we have to append the decoded user id to request body so that routes can use the user id to fetch the details faster
      req.user = decoded.user.id;
    });
    //calling next() ,It just simply call the next fucntion
    //In middleware we have to call the next function to take over the program
    next();
  } catch (errors) {
    //If any error occurs during verfying that token means user tried to tamper the token or its not a valid token
    //So we have to send unauthorised status and some text
    res.status(401).json({
      error: errors,
    });
  }
};
module.exports = fetchuser;
