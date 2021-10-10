const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let RoomtypeScheme = mongoose.Schema(
  {
    rtName: {
      type: String,
      required: true,
      unique: true,
    },
    slugName: {
      type: String,
      required: true,
      unique: true,
    },
    rtImg: {
      type: String,
      default: "default.png",
    },
    sId: {
      type: Schema.Types.ObjectId,
      ref: "col_staff",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("col_roomtype", RoomtypeScheme);
