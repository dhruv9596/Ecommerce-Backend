const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
    maxLength: [30, "Name cannot exceed 30 characters"],
    minLength: [4, "Name should have more than 4 characters"],
  },
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please Enter Your Password"],
    minLength: [8, "Password should be more than 8 characters"],
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  role: {
    type: String,
    default: "user",
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

//we've used function keyword coz this we cann't use inside arraow func.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  console.log("pre password", this.password);
});

//JWT Token
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, `${process.env.JWT_SECRET}`);
};

//Compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
  // console.log('Entered Password', enteredPassword);
  // console.log("Org Pass ",await bcrypt.hash(this.password,10));
  return await bcrypt.compare(enteredPassword, this.password);
};

//Generating Password and Token
userSchema.methods.getResetPasswordToken = function() {
  //Generating Password
  const resetToken = crypto.randomBytes(20).toString("hex");
  //console.log("Reset Token", resetToken);
  //Hashing and adding resetPasswordToken to userSchema
  //"sha256" is algorithm & digest is used to convert buffer genrated value to hex string
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  //console.log("Reset Pass Token", this.resetPasswordToken);
  this.resetPasswordExpire = Date.now() + 15*15 * 15 * 60 * 1000;
  console.log("Reset Expire Time", Date.now() + 15 * 15 * 15 * 60 * 1000);
  console.log("Forgot Password Token " ,resetToken);
  return this.resetPasswordToken;
};

module.exports = mongoose.model("User", userSchema);
