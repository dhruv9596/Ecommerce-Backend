const express = require("express");
const dotenv = require("dotenv");
const app = express();

const cors = require('cors')
app.use(cors());

const errorMiddleware = require("./middleware/Error");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Credentials", true);
   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
   next();
 });
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
const corsOptions = {
  origin: ["http://localhost:4000", "http://localhost:3000"],
  credentials: true,
};
app.use(cors(corsOptions));



dotenv.config({ path : "backend/config/config.env" });
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

//Route imports
const payment = require("./routes/PaymentRoutes");
const product = require("./routes/ProductRoutes");
const user = require("./routes/userRoutes");
const order = require("./routes/OrderRoutes");
app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", payment);
//Middleware for Errors
app.use(errorMiddleware);
module.exports = app;
