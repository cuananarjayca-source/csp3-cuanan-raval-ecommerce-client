const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true
	},

	orderId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Order",
		required: true
	},

	paymentMethod: {
		type: String,
		enum: ["credit_card", "debit_card", "gcash", "cash_on_delivery", "paypal"],
		required: true
	},
	amount: {
		type: Number,
		required: true
	},
	status: {
		type: String,
		enum: ["pending", "paid", "failed", "refunded", "cancelled"],
		default: "pending"
	},
	transactionId: {
		type: String,
		unique: true
	},
	paidAt: {
		type: Date,
		default: null
	}

}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);