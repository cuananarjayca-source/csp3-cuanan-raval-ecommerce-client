const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product ID is required"],
            unique: true
        },
        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [0, "Quantity cannot be negative"],
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Stock", stockSchema);