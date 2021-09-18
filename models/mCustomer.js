const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let CustomerSchema = Schema({
  cName: {
    type: String,
  },
  cDofB: {
    type: Schema.Types.Date,
  },
  cEmail: {
    type: String,
    max: 100,
  },
  cNumber: {
    type: String,
    max: 10,
  },
  cImg: {
    type: String,
    default: "default.png",
  },
  aId: {
    type: Schema.Types.ObjectId,
    ref: "col_account",
  },
});

module.exports = mongoose.model("col_customer", CustomerSchema);
