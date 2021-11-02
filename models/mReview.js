const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Review = Schema({
  rScore: {
    type: Number,
    required: true,
  },
  rContent: {
    type: String,
  },
  rAt: {
    type: Date,
  },
  rState: {
    type: Boolean,
  },
  imgs: [
    {
      riImg: {
        type: String,
      },
    },
  ],
  cId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "col_customer",
  },
  pId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "col_product",
  },
});

module.exports = mongoose.model("col_review", Review);
