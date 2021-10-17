const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let da = Schema({
  adReceiver: {
    type: String,
    required: true,
  },
  adNumber: {
    type: String,
    required: true,
  },
  adProvince: {
    type: String,
    required: true,
  },
  adDistrict: {
    type: String,
    required: true,
  },
  adWard: {
    type: String,
    required: true,
  },
  adDetail: {
    type: String,
    required: true,
  },
  adIsDefault: {
    type: Boolean,
    default: false,
  },
  cId: {
    type: Schema.Types.ObjectId,
    ref: "col_customer",
  },
});

module.exports = mongoose.model("col_deliveryaddress", da);
