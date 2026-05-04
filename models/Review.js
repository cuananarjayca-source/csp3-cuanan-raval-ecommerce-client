const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true
	},

	productId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product",
		required: true
	},
	
	rating: {
		type: Number,
		min: 1,
		max: 5,
		required: true
	},

	comment: {
		type: String		
	}

}, { timestamps: true });

reviewSchema.index({ userId: 1, productId: 1}, { unique: true });

reviewSchema.statics.calculateAverage = function(productId) {
    return this.aggregate([
        { $match: { productId: productId } },
        { $group: {
            _id: "$productId",
            nRating: { $sum: 1 },
            avgRating: { $avg: "$rating" }
        }}
    ]).then(stats => {
        if (stats.length > 0) {
            return mongoose.model("Product").findByIdAndUpdate(productId, {
                avgRating: Math.round(stats[0].avgRating * 10) / 10,
                totalReviews: stats[0].nRating
            });
        } else {
            return mongoose.model("Product").findByIdAndUpdate(productId, {
                avgRating: 0,
                totalReviews: 0
            });
        }
    });
};

reviewSchema.post("save", function() {
    this.constructor.calculateAverage(this.productId);
});

reviewSchema.post("deleteOne", { document: true, query: false }, function() {
    this.constructor.calculateAverage(this.productId);
});

module.exports = mongoose.model("Review", reviewSchema);