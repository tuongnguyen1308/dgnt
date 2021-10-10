const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Product = Schema(
  {
    pName: {
      type: String,
      required: true,
      unique: true,
    },
    slugName: {
      type: String,
      required: true,
      unique: true,
    },
    pUnit: {
      type: String,
      required: true,
    },
    pSize: {
      type: String,
      required: true,
    },
    pStock: {
      type: Number,
      required: true,
    },
    pPrice: {
      type: Number,
      required: true,
    },
    pDiscount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    pDesc: {
      type: String,
    },
    pState: {
      type: Boolean,
      default: true,
    },
    pImgs: [
      {
        piImg: {
          type: String,
          required: true,
        },
        piIsMain: {
          type: Boolean,
          default: false,
        },
      },
    ],
    mConsume: [
      {
        mId: {
          type: Schema.Types.ObjectId,
          ref: "col_material",
        },
        mQuantity: {
          type: Number,
          min: 1,
          required: true,
        },
      },
    ],
    pcId: {
      type: Schema.Types.ObjectId,
      ref: "col_category",
    },
    sId: {
      type: Schema.Types.ObjectId,
      ref: "col_staff",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("col_product", Product);
