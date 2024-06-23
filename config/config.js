require("dotenv").config();
const mongoose = require("mongoose");
exports.connect = () => {
  mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => {
      console.log("DB connnected");
    })
    .catch((err) => {
      console.log("Connection Issues");
      console.error(err); //Log the error message
      process.exit(1);
    });
};
