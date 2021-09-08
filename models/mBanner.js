const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let BannerSchema = Schema({
  bImg: {
    type: String,
    required: true,
  },
  bNumber: {
    type: Number,
    required: true,
  },
  sId: {
    type: Schema.Types.ObjectId,
    ref: "col_staff",
  },
});

module.exports = mongoose.model("col_banner", BannerSchema);
