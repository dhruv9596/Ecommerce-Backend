const express= require( "express" );

const app = express();

const cors = require('cors')
app.use(cors());

const errorMiddleware = require("./middleware/Error");
const cookieParser = require("cookie-parser");
app.use(express.json());
app.use(cookieParser());

//Route imports
const product = require("./routes/productRoutes");
const user = require("./routes/userRoutes");
const order = require("./routes/OrderRoutes");
app.use("/api/v1" , product);
app.use("/api/v1" , user);
app.use("/api/v1" , order);

//Middleware for Errors
app.use( errorMiddleware );



module.exports = app;
