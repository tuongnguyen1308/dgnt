const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Mtrbatch = Schema(
  {
    mbSupplier: {
      type: String,
      required: true,
    },
    mbBatchAt: {
      type: Date,
      required: true,
    },
    mbTotal: {
      type: Number,
      required: true,
    },
    mrId: {
      type: Schema.Types.ObjectId,
      ref: "col_mtrreq",
    },
    mbDetail: [
      {
        mId: {
          type: Schema.Types.ObjectId,
          ref: "col_material",
          required: true,
        },
        mQuantity: {
          type: Number,
          required: true,
        },
        mPrice: {
          type: Number,
          required: true,
        },
      },
    ],
    sId: {
      type: Schema.Types.ObjectId,
      ref: "col_staff",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("col_mtrbatch", Mtrbatch);
