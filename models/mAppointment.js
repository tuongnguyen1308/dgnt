const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Appointment = Schema(
  {
    apLocation: {
      type: String,
      required: true,
    },
    apTime: {
      type: Date,
      required: true,
    },
    apResult: {
      type: String,
    },
    cId: {
      type: Schema.Types.ObjectId,
      ref: "col_customer",
      required: true,
    },
    scId: {
      type: Schema.Types.ObjectId,
      ref: "col_staff",
      required: true,
    },
    suId: {
      type: Schema.Types.ObjectId,
      ref: "col_staff",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("col_appointment", Appointment);
