const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter a name "],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please Enter a Description "],
  },
  price: {
    type: Number,
    required: [true, "Please Enter a Price "],
    maxLength: [8, "Price cannot exceed 8 character "],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [true, "Please Enter Product Category "],
  },
  stock: {
    type: Number,
    required: [true, "Please enter product Stock "],
    default: 1,
    maxLength: [4, "Stock cannot exceed 4 characters"],
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: false,
      },
      rating: {
        type: Number,
        required: false,
      },
      comment: {
        type: String,
        required: false,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product" , productSchema);