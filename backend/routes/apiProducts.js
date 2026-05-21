const express = require("express");
const apiProductController = require("../controllers/apiProduct");

const router = express.Router();

// GET /api/products/meta/categories — must be registered before /:id
router.get("/meta/categories", apiProductController.getCategories);

// GET /api/products?category=&search=&sort=&minPrice=&maxPrice=&featured=
router.get("/", apiProductController.listProducts);

// GET /api/products/:id
router.get("/:id", apiProductController.getProductById);

module.exports = router;
