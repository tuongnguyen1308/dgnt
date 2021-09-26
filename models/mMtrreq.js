const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Mtrreq = Schema(
  {
    mrReason: {
      type: String,
      required: true,
    },
    mrDetail: [
      {
        mId: {
          type: Schema.Types.ObjectId,
          ref: "col_material",
        },
        mQuantity: {
          type: Number,
          required: true,
        },
      },
    ],
    mrState: {
      type: Boolean,
      required: true,
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

module.exports = mongoose.model("col_mtrreq", Mtrreq);
