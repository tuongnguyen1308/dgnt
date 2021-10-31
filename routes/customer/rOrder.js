const router = require("express").Router();
const cOrder = require("../../controllers/customer/cOrder");
const cvnpay = require("../../controllers/customer/cvnpay");

router.get("/", cOrder.index);
router.get("/view", cOrder.view);
router.post("/create_payment_url", cvnpay.createPaymentUrl);
router.post("/update-state", cOrder.updateState);
router.get("/result", cvnpay.vnpayReturn);
router.get("/vnpay_ipn", cvnpay.vnpayIpn);

module.exports = router;
