const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let State = Schema({
  osName: {
    type: String,
    required: true,
    unique: true,
  },
  roles: [
    {
      rId: {
        type: Schema.Types.ObjectId,
        ref: "col_role",
      },
    },
  ],
});

module.exports = mongoose.model("col_state", State);
