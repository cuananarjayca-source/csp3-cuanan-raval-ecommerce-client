const Product = require("../models/Product");
const Review = require("../models/Review");
const { errorHandler } = require("../auth");

module.exports.createReview = (req, res) => {
		const { productId, rating, comment } = req.body;

		if(!productId) {
			return res.status(400).send({ message: "Product ID is required" });
		}
		if(!rating) {
			return res.status(400).send({ message: "Rating 1-5 is required" });
		}

		return Product.findById(productId)
			.then ((product) => {
				if(!product) {
					return res.status(404).send({ message: "Product not found" });
				}

				return Review.findOne({ userId: req.user.id, productId })
    				.then((existing) => {
        		if (existing) {
            		return res.status(409).send({ message: "You have already reviewed this product" });
        		}
        	const newReview = new Review({
						userId: req.user.id,
						productId,
						rating,
						comment
				});

			return newReview.save()
				.then((result) =>res.status(201).send({
					message: "Review created successfully",
					result
			}));
		});
    })
	.catch((err) => errorHandler(err,req,res));
};

module.exports.getMyReviews = (req, res) => {
  return Review.find({ userId: req.user.id })
    .populate("productId", "name price imageUrl") 
    .then((result) => {
      if (result.length === 0) {
        return res.status(404).send({ message: "No reviews found" });
      }
      return res.status(200).send({
        message: "Reviews found",
        reviews: result
      });
    })
    .catch((err) => errorHandler(err, req, res));
};

module.exports.editReview = (req, res) => {
	const { rating, comment } = req.body;

	 return Review.findById(req.params.id)
	        .then((review) => {
	            if (!review) {
	                return res.status(404).send({ message: "Review not found" });
	            }

	            if (review.userId.toString() !== req.user.id) {
	                return res.status(403).send({ message: "Unauthorized to edit this review" });
	            }

	            review.rating = rating;
	            review.comment = comment;
	            return review.save()
	            .then((result) => res.status(200).send({
	                message: "Review updated successfully",
	                result
	            }));
	        })
	        .catch((err) => errorHandler(err, req, res));
	};

module.exports.deleteReview = (req,res) => {
	return Review.findById(req.params.id)
	       .then((review) => {
	           if (!review) {
	               return res.status(404).send({ message: "Review not found" });
	           }
	           if (review.userId.toString() !== req.user.id) {
	               return res.status(403).send({ message: "Unauthorized to delete this review" });
	           }

	           return review.deleteOne()
	           .then(() => res.status(200).send({ message: "Review deleted successfully" }));
	       })
	       .catch((err) => errorHandler(err, req, res));
};


// ADMIN LEVEL ACCESS

module.exports.getAllReviews = (req, res) => {
  return Review.find()
    .then((result) => {
      if (result.length === 0) {
        return res.status(404).send({ message: "No reviews found" });
      }
      return res.status(200).send({
        message: "Reviews found",
        reviews: result
      });
    })
    .catch((err) => errorHandler(err, req, res));
};

module.exports.getReviewById = (req, res) => {
  return Review.findById(req.params.id)
    .then((result) => {
      if (!result) {
        return res.status(404).send({ message: "No review found" });
      }
      return res.status(200).send({
        message: "Review found",
        result
      });
    })
    .catch((err) => errorHandler(err, req, res));
};

module.exports.getReviewsByProduct = (req, res) => {
    return Review.find({ productId: req.params.productId })
        .populate("userId", "firstName lastName") 
        .then(result => {
            if (result.length === 0) {
                return res.status(404).send({ message: "No reviews found for this product." });
            }
            return res.status(200).send({
                message: "Product reviews found",
                reviews: result
            });
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.getReviewsByUser = (req, res) => {
    return Review.find({ userId: req.params.userId })
        .populate("productId", "name imageUrl") 
        .then(result => {
            if (result.length === 0) {
                return res.status(404).send({ message: "This user has not submitted any reviews." });
            }
            return res.status(200).send({
                message: "User history found",
                reviews: result
            });
        })
        .catch(err => errorHandler(err, req, res));
};

module.exports.editReviewAsAdmin = (req, res) => {
  const { rating, comment } = req.body;

  	 return Review.findById(req.params.id)
  	        .then((review) => {
  	            if (!review) {
  	                return res.status(404).send({ message: "Review not found" });
  	            }
    
  	            review.rating = rating;
	            review.comment = comment;
	            return review.save()
	            .then((result) => res.status(200).send({
	                message: "Review updated successfully",
	                result
  	            }));
  	        })
  	        .catch((err) => errorHandler(err, req, res));
};

module.exports.deleteReviewAsAdmin = (req,res) => {
	return Review.findById(req.params.id)
	       .then((review) => {
	           if (!review) {
	               return res.status(404).send({ message: "Review not found" });
	           }
	           
	           return review.deleteOne()
	           .then(() => res.status(200).send({ message: "Review deleted successfully" }));
	       })
	       .catch((err) => errorHandler(err, req, res));
};