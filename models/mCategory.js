const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let CategoryScheme = mongoose.Schema(
  {
    pcName: {
      type: String,
      required: true,
      unique: true,
    },
    slugName: {
      type: String,
      required: true,
      unique: true,
    },
    pcImg: {
      type: String,
      default: "default.png",
    },
    rtId: {
      type: Schema.Types.ObjectId,
      ref: "col_roomtype",
    },
    sId: {
      type: Schema.Types.ObjectId,
      ref: "col_staff",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("col_category", CategoryScheme);
