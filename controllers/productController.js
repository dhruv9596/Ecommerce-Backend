const Product = require("../models/ProductModel");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apiFeatures");

//Create a Product - Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user.id;

  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    product,
  });
});

//GET All Products
exports.getAllProducts = catchAsyncErrors(async (req, res) => {
  const resultPerPage = 3;
  const productsCount = await Product.countDocuments();
  //req.query will get all after ? in original request
  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter();
  // console.log('Products After-->', products );
   let products = await apiFeature.query;
   let filteredProductsCount = products.length;
   apiFeature.pagination(resultPerPage);
   products = await apiFeature.query.clone();
  //name = "samosamosa"
  res.status(200).send({
    success: true,
    products,
    productsCount,
    resultPerPage,
    filteredProductsCount,
  });
  
});

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(500).json({
      success: false,
      message: "Product Not Found!",
    });
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

//Get a Single Product
exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  console.log("--->" + req.params.id);
  // console.log("inside backend");
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product Not Found! ", 404));
  }

  return res.status(200).json({
    status: "success",
    product,
  });
});

//Delete a Product
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: "Data not deletd!",
    });
  }
});

//Create a New Review or Update review --> Update Not Done
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const product = await Product.findById({ _id: productId });
  let rev = product.reviews;
  let f = 0;
  rev.map((item) => {
    if (item.user.toString() === req.user._id.toString()) {
      item["rating"] = rating;
      item["comment"] = comment;
      f = 1;
    }
  });
  if (f === 0) {
    rev.unshift({
      user: req.user._id,
      name: req.user.name,
      rating: rating,
      comment: comment,
    });
  }
  await Product.findByIdAndUpdate(productId, {
    $set: {
      reviews: rev,
    },
  });
  res.status(200).json({
    success: true,
  });
});

// Get All Reviews of a Product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler("Product Not Found!!", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Get All Reviews of a Product
exports.deleteProductReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product Not Found!!", 404));
  }
  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  const ratings = avg / reviews.length;
  const numOfReviews = reviews.length;
  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
    message: "Review successfully deleted",
  });
});

// if (product.reviews.length > 0) {
//   product.reviews.map(async (item) => {
//     if (item.reviews.user.toString() === req.user._id.toString()) {
//         await Product.updateOne(
//           {
//             _id: productId,
//             reviews: {
//               user: req.user._id,
//             },
//           },
//           {
//             $replaceWith: {
//               reviews: {
//                 user: req.user._id,
//                 name: req.user.name,
//                 rating: rating,
//                 comment: comment,
//               },
//             },
//           }
//         );
//       // await Product.findByIdAndUpdate(productId, {
//       //   $set: {
//       //     reviews: {
//       //       user: req.user._id,
//       //       name: req.user.name,
//       //       rating: rating,
//       //       comment: comment,
//       //     },
//       //   },
//       // });
//     }
//     else{
//       await Product.findByIdAndUpdate(productId, {
//         $push: {
//           reviews: {
//             user: req.user._id,
//             name: req.user.name,
//             rating: rating,
//             comment: comment,
//           },
//         },
//       });
//     }
//   });
// } else {
//   await Product.findByIdAndUpdate(productId, {
//     $push: {
//       reviews: {
//         user: req.user._id,
//         name: req.user.name,
//         rating: rating,
//         comment: comment,
//       },
//     },
//   });
// //}

// let avg = 0;
// product.reviews.forEach((rev) => {
//   avg += rev.rating;
// });
// let numOfReviews = product.reviews.length + 1 ;
// let a = avg / (product.reviews.length + 1);
// await Product.updateMany(
//   { _id: productId },
//   {
//     $set: {
//       numOfReviews: product.reviews.length + 1,
//       ratings: a,
//     },
//   }
// );
