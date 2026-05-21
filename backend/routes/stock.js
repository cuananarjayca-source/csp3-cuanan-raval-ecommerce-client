const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stock");
const { verify, verifyAdmin } = require("../auth");

// USER LEVEL ACCESS
router.get("/check-stock/:productId", verify, stockController.checkStock);

// ADMIN LEVEL ACCESS
router.post("/create-stock", verify, verifyAdmin, stockController.createStock);
router.get("/get-all-stocks", verify, verifyAdmin, stockController.getAllStock);
router.get("/get-stock/:productId", verify, verifyAdmin, stockController.getStockByProduct);
router.put("/update-stock/:productId", verify, verifyAdmin, stockController.updateStock);
router.patch("/adjust-stock/:productId", verify, verifyAdmin, stockController.adjustStock);
router.delete("/delete-stock/:productId", verify, verifyAdmin, stockController.deleteStock);

module.exports = router;