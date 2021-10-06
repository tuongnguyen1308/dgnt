const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Prdreq = Schema(
  {
    prReason: {
      type: String,
      required: true,
    },
    prDeadlineAt: {
      type: Date,
      required: true,
    },
    prDetail: [
      {
        pId: {
          type: Schema.Types.ObjectId,
          ref: "col_product",
        },
        pQuantity: {
          type: Number,
          required: true,
        },
      },
    ],
    prState: {
      type: Number,
      default: 0,
      min: -1,
      max: 1,
    },
    scId: {
      type: Schema.Types.ObjectId,
      ref: "col_staff",
    },
    suId: {
      type: Schema.Types.ObjectId,
      ref: "col_staff",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("col_prdreq", Prdreq);
