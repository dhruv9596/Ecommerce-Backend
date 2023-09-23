const Order = require("../models/OrderModel.js");
const Product = require("../models/ProductModel");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");

//Create new Order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

//Get Single Order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if(!order){
    return next( new ErrorHandler("Order not found with this Id ", 404 ));
  }
  res.status(200).json({
    success : true, 
    order,
  });
});

//Get Logged in user Orders
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({user : req.user._id });

  if (!orders) {
    return next(new ErrorHandler("Order not found with this Id ", 404));
  }
  res.status(200).json({
    success: true,
    orders,
  });
});

//Get All Orders
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;
  orders.forEach(order => {
    totalAmount += order.totalPrice;
  });

  if (!orders) {
    return next(new ErrorHandler("Order not found with this Id ", 404));
  }
  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

//Update Order Status --Admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  console.log('Order' , order);
  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }
  if( order.orderStatus === "Delivered"){
    return next("You have Delivered this Order" ,404);
  }

  order.orderItems.forEach( async (order) => {
    await updateStock(order.product , order.quantity);
  });
  console.log('Order After' , order.stock);
  order.orderStatus = req.body.status;
  
  if( req.body.status === "Delivered" ){
    order.deliveredAt = Date.now();
  }

  await Order.findByIdAndUpdate( req.params.id , {
    $set : {
      orderStatus : req.body.status,
      deliveredAt : Date.now(),
    }
  })
  res.status(200).json({
    success: true,
  });
});


//Delete Order
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  //console.log("order API");
  const order = await Order.findById(req.params.id);
  //console.log('order' , order);
  if (!order) {
    return next(new ErrorHandler("Order not found with this Id ", 404));
  }
  await Order.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
   
  });
});

async function updateStock( id , quantity) {
  const product = await Product.findById(id);
  let s = product.stock;
  s-=quantity;
  await Product.findByIdAndUpdate( id , {
    $set : {
      stock : s,
    }
  });

}