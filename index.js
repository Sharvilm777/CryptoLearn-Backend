const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const Dbconnection = require("./Dbconnection");

Dbconnection();

const app = express();
const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());
app.use("/api/auth", require("./routes/auth"));
app.use("/api/coins", require("./routes/wallet"));
app.use("/api/wallet", require("./routes/walletBalance"));
app.get("/hello", (req, res) => {
  res.send("Hello Guys");
});

app.listen(port, () => {
  console.log(`App is listening at port ${port}`);
});
