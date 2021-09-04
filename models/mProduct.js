const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//#region danh sách ảnh
let imgSchema = Schema({
  src: {
    type: String,
    required: true,
  },
  isMain: {
    type: Boolean,
    default: false,
  },
});
//#endregion

//#region danh sách kích thước sản phẩm
let sizeSchema = Schema({
  thickness: {
    type: Number,
  },
  height: {
    type: Number,
  },
  weight: {
    type: Number,
  },
  price: {
    type: Number,
  },
  discount: {
    type: Number,
  },
});
//#endregion

let Product = Schema(
  {
    pCode: {
      type: String,
      required: true,
      unique: true,
    },
    pName: {
      type: String,
      required: true,
      unique: true,
    },
    unit: {
      type: String,
    },
    stock: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    state: {
      type: Boolean,
      default: true,
    },
    pImgs: [imgSchema],
    size: [sizeSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", Product);
