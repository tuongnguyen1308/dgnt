const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let AccountSchema = Schema({
  aUsername: {
    type: String,
    required: true,
    min: 6,
    max: 60,
    unique: true,
  },
  aPassword: {
    type: String,
    required: true,
    min: 6,
  },
  rId: {
    type: Schema.Types.ObjectId,
    ref: "col_role",
  },
});

module.exports = mongoose.model("col_account", AccountSchema);
