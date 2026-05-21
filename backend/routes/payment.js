const express = require("express");
const paymentController = require("../controllers/payment");
const { verify, verifyAdmin } = require("../auth");
const router = express.Router();

// Authenticated user access only
router.post("/create-payment", verify, paymentController.createPayment);

router.get("/my-payments", verify, paymentController.getMyPayments);

// ADMIN ONLY
router.get("/get-all-payments", verify, verifyAdmin, paymentController.getAllPayments);

router.get("/get-payment/:id", verify, verifyAdmin, paymentController.getPaymentById);

router.patch("/update-payment-status/:id", verify, verifyAdmin, paymentController.updatePaymentStatus);




module.exports = router;