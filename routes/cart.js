const express = require("express");
const cartController = require("../controllers/cart");
const { verify } = require("../auth");
const router = express.Router();

// Authenticated user access only
router.get("/get-cart", verify, cartController.getUserCart);

router.post("/add-to-cart", verify, cartController.addToCart);

router.patch("/update-cart-quantity", verify, cartController.changeProductQuantity);

router.patch("/:productId/remove-from-cart", verify, cartController.removeFromCart);

router.put("/clear-cart", verify, cartController.clearCartItems);


module.exports = router;