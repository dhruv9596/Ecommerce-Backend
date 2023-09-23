const catchAsyncErrors = require("./catchAsyncError");
const ErrorHandler  = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
require("dotenv").config();
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const {token} = req.cookies;
     
    if( !token ){
        return next( new ErrorHandler("Please Login to access this resource ", 401));
    }
    
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    //console.log(decodedData);
    req.user = await User.findById(  decodedData.id );
    next();
});


exports.authorizeRoles = ( ...roles ) => {
  return ( req , res , next ) => {
    //req.user.role id user but roles is coming from route which is admin
      if( !roles.includes( req.user.role)){
          return next(new ErrorHandler(`Roles : ${req.user.role} is not allowed to access this resource`, 403 ));
      }
      else{
          next();
      }
  }
}