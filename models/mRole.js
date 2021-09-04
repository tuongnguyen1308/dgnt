const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let RoleSchema = Schema({
  rName: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("col_role", RoleSchema);
