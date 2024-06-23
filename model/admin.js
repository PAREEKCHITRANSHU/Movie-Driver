const mongoose = require("mongoose");
const Admin = new mongoose.Schema({
  username: {
    require: true,
    type: String,
  },
  email: {
    require: true,
    unique: true,
    type: String,
  },
  password: {
    require: true,
    type: String,
  },
  cart: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
      },
      title: {
        type: String,
        required: true,
      },
      img: {
        type: String,
        required: true,
      },
    },
  ],
});
module.exports = mongoose.model("Admin", Admin);
