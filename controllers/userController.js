const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const User = require("../models/UserModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail.js");
const crypto = require("crypto");
const cloudinary = require('cloudinary');
const jwt = require('jsonwebtoken');
const { log } = require("console");
//Register a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;
  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar , {
    folder : "avtars",
    width : 150,
    crop : "scale",
  });
  console.log( 'my Cloud ' , myCloud );
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });
  sendToken(user, 201, res);
});

//Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  // console.log('Req ' , req.body);
  const { email, password } = req.body;
  // console.log( 'login User request ' + email + " " + password );
  //checking if user has given password and email both
  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email & Password ", 400));
  }
  //In UserModel we've used password select = false we need to manually select it.
  const user = await User.findOne({ email }).select("+password");
  // console.log('User Found or Not ? ' , user);
  if (!user || Object.keys(user).length==0) {
    console.log('length ? ' , user);
    return next(new ErrorHandler("Invalid email or password"));
  }
  const isPasswordMatched = await user.comparePassword(password);
  
  if (!isPasswordMatched) {
    console.log('pass match ? ' , user);
    return next(new ErrorHandler("Invalid email or password"));
  }
  // sendToken(user, 200, res);
  const token = user.getJWTToken();
  // res.cookie("token", token, { maxAge: 900000, httpOnly: true });
  res.status(200).json({
    success: true,
    user,
    token,
  });
  // res
  //   .writeHead(200, {
  //     "Set-Cookie": `token=${token}; HttpOnly`,
  //     "Access-Control-Allow-Credentials": "true",
  //   })
  //   .send();
});

//Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out Successfully",
  });
});

//Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  //console.log(req.body.email);
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("Error User not found. ", 404));
  }

  //Get ResetPassword Token
  const resetToken = await user.getResetPasswordToken();
  // await User.updateOne(
  //   { email: user.email },
  //   { $set: { resetPasswordToken: resetToken } }
  // );
  await user.save({ validateBeforeSave: false });
  //user = await User.findOne({ email: req.body.email });
  console.log('Reset Token FP ', resetToken);
  console.log("<--User saved-->", user);

  const resetPassswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your Password resest token is :- \n\n ${resetPassswordUrl} \n\nIf you've not requested this url, then please ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery.`,
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    console.log("<------------- Catch Block ---------->");
    user.resetPasswordToken = undefined;
    user.resetPassswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

//Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  //creating hash token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  // console.log("Req" , req.body);
  console.log("Req token ", req.params.token);
  console.log("rpt" , resetPasswordToken);
  const findTokenUser = req.params.token;
  const user = await User.findOne({
    resetPasswordToken: findTokenUser,
    //resetPassswordExpire : { $gt : Date.now()}
  });
  console.log("User" , user);
  if (!user) {
    return next(
      new ErrorHandler(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }
  if( req.body.password !== req.body.confirmPassword ){
    return next(
      new ErrorHandler(
        "Password does not password ",
        400
      )
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  sendToken( user, 200 , res );
}); 


//GET User Details

exports.getUserDetails = catchAsyncErrors( async( req , res , next ) => {
  console.log(req.body);
  const token = req.body.token;
  const data = jwt.verify(token, `${process.env.JWT_SECRET}`)
  const user = await User.findById( data.id );
  res.status(200).json({
    success : true,
    data : user,
  })
});

//Update User Profile
exports.updateProfile = catchAsyncErrors( async( req , res , next ) => {
  const newUserData = {
    name : req.body.name,
    email : req.body.email,
  };
  console.log('Res-----> ' , newUserData);
  // we will cloudinary letter
  const user = await User.findByIdAndUpdate( req.user.id , newUserData , {
    new : true,
    runValidators : true, 
    useFindAndModify : false,
  })
  res.status(200).json({
    success : true,
  });
});

//Update User Details

exports.updatePassword = catchAsyncErrors( async( req , res , next ) => {

  const user = await User.findById( req.user.id ).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if( !isPasswordMatched ) {
    return next( new ErrorHandler("Old password is incorrect" , 400 ));
  }

  if (  req.body.newPassword !== req.body.confirmPassword ) {
    return next(new ErrorHandler("Password does not match ", 400));
  }

  user.password = req.body.newPassword;

  await user.save();
  sendToken( user , 200 , res);
});

//Get All Users
exports.getAllUsers = catchAsyncErrors( async( req , res , next ) => {

  const users = await User.find();
  res.status(200).json({
    success : true,
    users,
  });
});

//Get Single Users( Admin )
exports.getSingleUser = catchAsyncErrors( async( req , res , next ) => {

  const user = await User.findById(req.params.id);
  //console.log("User" , user);
  if( !user ){
    return next(new ErrorHandler(`User does not exist with id:${req.params.id}`));
  }

  res.status(200).json({
    success : true,
    user,
  });
});

//Update User Role -- Admin
exports.updateUserRole = catchAsyncErrors( async( req , res , next ) => {
  const newUserData = {
    name : req.body.name,
    email : req.body.email,
    role : req.body.role
  };
  const user = await User.findByIdAndUpdate( req.params.id , newUserData , {
    new : true,
    runValidators : true, 
    useFindAndModify : false,
  })
  res.status(200).json({
    success : true,
  });
});

//Delete User Admin
exports.deleteUser = catchAsyncErrors( async( req , res , next ) => {
  
  try {
       const user = await User.findById(req.params.id);
      const imageId = user.avatar.public_id;
      await cloudinary.v2.uploader.destroy(imageId);
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: "success",
      message: "User Deleted successfully", 
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: "Data not deletd!",
    });
  }
});