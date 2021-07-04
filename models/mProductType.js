const mongoose = require("mongoose");

let ProductTypeScheme = mongoose.Schema(
  {
    tName: {
      type: String,
      required: true,
      unique: true,
    },
    tImg: {
      type: String,
      default: "default.png",
    },
    tState: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductType", ProductTypeScheme);
