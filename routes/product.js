const express = require("express");
const productController = require("../controllers/product");
const { verify, verifyAdmin } = require("../auth");
const router = express.Router();

// ADMIN LEVEL ACCESS
router.post("/", verify, verifyAdmin, productController.createProduct);

router.get("/all", verify, verifyAdmin, productController.getAllProduct);

router.patch("/:productId/update", verify, verifyAdmin, productController.updateProduct);

router.patch("/:productId/archive", verify, verifyAdmin, productController.archiveProduct);

router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct);

// ALL USERS

router.get("/active", productController.getActiveProduct);

router.get("/search-by-rating", productController.searchProductByRating);

router.get("/:productId", productController.getProductById);

router.post("/search-by-name", productController.searchProductByName);

router.post("/search-by-price", productController.searchProductByPriceRange);

module.exports = router;