const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let StaffSchema = Schema({
  sName: {
    type: String,
  },
  sDofB: {
    type: Schema.Types.Date,
  },
  sEmail: {
    type: String,
    max: 100,
  },
  sNumber: {
    type: String,
    max: 10,
  },
  sImg: {
    type: String,
    default: "default.png",
  },
  sState: {
    type: Boolean,
    default: false,
  },
  aId: {
    type: Schema.Types.ObjectId,
    ref: "col_account",
  },
});

module.exports = mongoose.model("col_staff", StaffSchema);
