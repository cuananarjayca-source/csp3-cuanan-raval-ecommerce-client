const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
	name: {
        type: String,
        required: [true, "Product name is required"]
    },
    description: {
        type: String,
        required: [true, "Product description is required"]
    },
    price: {
        type: Number,
        required: [true, "Product price is required"]
    },
    avgRating: {
        type: Number,
        default: 0,
        index: true // Makes searching by rating lightning fast
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    imageUrl: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Product", productSchema);