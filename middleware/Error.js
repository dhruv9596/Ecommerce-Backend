const ErrorHandler = require("../utils/errorHandler");

module.exports = ( err, req , res , next ) => {
  console.log("Error Handler" , err);
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error ";

  //Wrong Mongodb Id error
  //Cast Error
  if (err.name === "CastError") {
    const message = `Resource not Found. Invalid : ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  //Mongoose Duplicate key Error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered.`;
    err = new ErrorHandler(message, 400);
  }

  //Wrong JWT error
  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is Invalid , Try again.`;
    err = new ErrorHandler(message, 400);
  }

  //JWT Expire Error
  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token is Expired , Try again.`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    //To print where error occurred
    //error : err.stack
  });
};
