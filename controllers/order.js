const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const { errorHandler } = require("../auth");


module.exports.createOrder = (req, res) => {
	return Cart.findOne({ userId: req.user.id })
	.then(cart => {
		if (!cart || cart.cartItems.length === 0) {
			return res.status(400).send({ error: "No Items to Checkout" });
		}
		const orderItems = cart.cartItems.map(item => ({ //
			productId: item.productId,
			quantity: item.quantity,
			subtotal: item.subtotal 
		}));
		const totalPrice = cart.totalPrice;
		const order = new Order({
			userId: req.user.id,
			productsOrdered: orderItems,
			totalPrice: totalPrice
		});
		return order.save()
		.then(result => res.status(201).send({
			message: "Ordered successfully"
		}));
	})
	.catch(err => errorHandler(err, req, res));
};


module.exports.getUserOrder = (req, res) => {
	return Order.find({ userId: req.user.id })
	.then(result => {
		if (result.length === 0) {
			return res.status(404).send({ error: "No orders found" });
		}
		return res.status(200).send({
			orders: result
		});
	})
	.catch(err => errorHandler(err, req, res));
};


// Admin can view all orders
module.exports.getAllOrders = (req, res) => {

	return Order.find()
	.then(result => {
		if (result.length === 0) {
			return res.status(404).send({ message: "No orders found"});
		}
		return res.status(200).send({
			orders: result
		});
	})
	.catch(err=> errorHandler(err, req, res));	
};