const express = require("express");
const cartController = require("../controllers/cart");
const { verify, verifyAdmin } = require("../auth");
const router = express.Router();

// Authenticated user access only

router.get("/get-cart", verify, cartController.getUserCart);
router.post("/add-to-cart", verify, cartController.addToCart);
router.patch("/update-cart-quantity", verify, cartController.changeProductQuantity);

// Additional cart functionalities
router.post("/remove-from-cart", verify, cartController.removeFromCart);
router.post("/clear-cart", verify, cartController.clearCartItems);
router.post("/search-item", verify, cartController.searchProductByName);
router.post("/search-item-by-pricerange", verify, cartController.searchProductByPriceRange);

module.exports = router;