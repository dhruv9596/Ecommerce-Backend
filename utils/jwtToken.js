//creating Token and saving in cookie
require("dotenv").config();
const sendToken = ( user , statusCode , res ) => {
    // console.log('User in jwt Token' , user);
    const token = user.getJWTToken();
    console.log('Jwt Token ' , token);
    //option for cookie
    var n = new Date();
    var t = n.getTime();
    var expireTime = t + 1000*3600;
    const options = {
        expires :  new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
          ),
        httpOnly : true,
    };
    // console.log( '---->Options ' , options);
    // Cookies.set("token", token, { expires: 7, secure: true });
    
    // res.status(statusCode).cookie("token",token,options).json({
    //     success : true,
    //     user,
    //     token,
    // });

    res.cookie("token", token, { maxAge: 1000 * 60 * 10, httpOnly: false });
    
    res.status(statusCode).json({
        success : true,
        user,
        token,
    });
};

module.exports = sendToken;