const mongoose = require("mongoose");

let UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      min: 3,
      max: 20,
      unique: true,
    },
    fullname: {
      type: String,
    },
    email: {
      type: String,
      max: 50,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "default.png",
    },
    role: {
      rNumber: {
        type: Number,
        required: true,
        default: 0,
      },
      rTitle: {
        type: String,
        required: true,
        dafault: "Khách hàng",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
