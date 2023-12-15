require("dotenv").config();
const catchAsyncErrors = require("../middleware/catchAsyncError");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.processPayment = catchAsyncErrors(async (req, res, next) => {
  console.log('Payment/process in backend ' , req.body);  
  const myPayment = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",
    metadata: {
      company: "Ecommerce",
    },
  });

  res
    .status(200)
    .json({ success: true, client_secret: myPayment.client_secret });
});

exports.sendStripeApiKey = catchAsyncErrors(async (req, res, next) => {
  // console.log("StripeApiKey ", process.env.STRIPE_API_KEY);
  res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY });
});
