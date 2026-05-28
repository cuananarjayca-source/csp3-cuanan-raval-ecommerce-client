const express = require("express");
const reviewController = require("../controllers/review");
const { verify, verifyAdmin } = require("../auth");
const router = express.Router();

// PUBLIC ACCESS 
router.get("/product/:productId", reviewController.getReviewsByProduct);

// USER LEVEL ACCESS
router.post("/create-review", verify, reviewController.createReview);

router.get("/my-reviews", verify, reviewController.getMyReviews);

router.patch("/edit-review/:id", verify, reviewController.editReview);

router.delete("/delete-review/:id", verify, reviewController.deleteReview);

// ADMIN ONLY ACCESS
router.get("/get-all-reviews", verify, verifyAdmin, reviewController.getAllReviews);

router.get("/get-review/:id", verify, verifyAdmin, reviewController.getReviewById);

router.get("/user/:userId", verify, verifyAdmin, reviewController.getReviewsByUser);

router.patch("/admin-edit-review/:id", verify, verifyAdmin, reviewController.editReviewAsAdmin);

router.delete("/admin-delete-review/:id", verify, verifyAdmin, reviewController.deleteReviewAsAdmin);

module.exports = router;