const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Cart = Schema(
  {
    products: [
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
    cId: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: "col_customer",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("col_cart", Cart);
