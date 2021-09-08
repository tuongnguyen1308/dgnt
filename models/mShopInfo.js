const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let ShopInfoSchema = Schema({
  siName: {
    type: String,
  },
  siLogo: {
    type: String,
  },
  siAddress: {
    type: String,
    max: 256,
  },
  siHotline: {
    type: String,
  },
  siFacebook: {
    type: String,
  },
  siZalo: {
    type: String,
  },
  sId: {
    type: Schema.Types.ObjectId,
    ref: "col_staff",
  },
});

module.exports = mongoose.model("col_shopinfo", ShopInfoSchema);
