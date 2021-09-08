const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let PaymentMethodSchema = Schema({
  pmName: {
    type: String,
    max: 50,
  },
  pmDesc: {
    type: String,
    max: 256,
  },
  pmState: {
    type: Boolean,
  },
  sId: {
    type: Schema.Types.ObjectId,
    ref: "col_staff",
  },
});

module.exports = mongoose.model("col_paymentmethod", PaymentMethodSchema);
