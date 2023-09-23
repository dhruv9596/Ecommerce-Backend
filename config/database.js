const mongoose = require('mongoose');
// require("dotenv").config();
require("dotenv").config();
console.log(process.env.DB_URI);
const connectDatabse = () => {
  mongoose.set('strictQuery', false);
    mongoose
      .connect(process.env.DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        //useCreateIndex : true,
      })
      .then((data) => {
        console.log(`DB Connected! :${data.connection.host}`);
      });
}

module.exports = connectDatabse