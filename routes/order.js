const express = require("express");
const orderController = require("../controllers/order");
const { verify, verifyAdmin } = require("../auth");
const router = express.Router();

// Authenticated user access only
router.post("/checkout", verify, orderController.createOrder);
router.get("/my-orders", verify, orderController.getUserOrder);

// ADMIN ONLY
router.get("/all-orders", verify, verifyAdmin, orderController.getAllOrders);


module.exports = router;