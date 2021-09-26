const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Material = Schema(
  {
    mName: {
      type: String,
      required: true,
      unique: true,
    },
    mDesc: {
      type: String,
    },
    mUnit: {
      type: String,
    },
    mImg: {
      type: String,
    },
    mStock: {
      type: Number,
      required: true,
    },
    sId: {
      type: Schema.Types.ObjectId,
      ref: "col_staff",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("col_material", Material);
