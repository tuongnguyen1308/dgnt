const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let Order = Schema({
  oId: {
    type: String,
    unique: true,
    required: true,
  },
  oTotal: {
    type: Number,
    required: true,
    min: 0,
  },
  oAmountPaid: {
    type: Number,
    required: true,
    min: 0,
  },
  oRecDate: {
    type: Date,
  },
  oNote: {
    type: String,
  },
  sdId: {
    type: Schema.Types.ObjectId,
    ref: "col_state",
  },
  products: [
    {
      pId: {
        type: Schema.Types.ObjectId,
        ref: "col_product",
      },
      odQuantity: {
        type: Number,
        required: true,
        min: 0,
      },
      odPrice: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
  cId: {
    type: Schema.Types.ObjectId,
    require: true,
    ref: "col_customer",
  },
  adId: {
    type: Schema.Types.ObjectId,
    require: true,
    ref: "col_deliveryaddress",
  },
  pmId: {
    type: Schema.Types.ObjectId,
    require: true,
    ref: "col_paymentmethod",
  },
  scId: {
    type: Schema.Types.ObjectId,
    ref: "col_staff",
  },
  suId: {
    type: Schema.Types.ObjectId,
    ref: "col_staff",
  },
  bh: {
    sId: {
      type: Schema.Types.ObjectId,
      ref: "col_staff",
    },
    oNote: {
      type: String,
    },
    sdId: {
      type: Schema.Types.ObjectId,
      ref: "col_state",
    },
    ouUpdateAt: {
      type: Date,
    },
  },
  sx: {
    sId: {
      type: Schema.Types.ObjectId,
      ref: "col_staff",
    },
    oNote: {
      type: String,
    },
    sdId: {
      type: Schema.Types.ObjectId,
      ref: "col_state",
    },
    ouUpdateAt: {
      type: Date,
    },
  },
  gh: {
    sId: {
      type: Schema.Types.ObjectId,
      ref: "col_staff",
    },
    oNote: {
      type: String,
    },
    sdId: {
      type: Schema.Types.ObjectId,
      ref: "col_state",
    },
    ouUpdateAt: {
      type: Date,
    },
  },
  createdAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("col_order", Order);
