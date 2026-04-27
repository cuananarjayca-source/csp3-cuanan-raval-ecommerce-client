const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { errorHandler } = require("../auth");


module.exports.createOrder = (req, res) => {
	const { productId, quantity, subtotal } = req.body;

	return Order.findOne({ userId: req.user.id })
	.then(order=> {
		if (!order) {
			const newOrder = new Order({
				userId: req.user.id,
				productsOrdered: [{ productId, quantity, subtotal }],
				totalPrice: subtotal
			});
			return newOrder.save()
			.then(result=> res.status(201).send({
				message: "Items ordered successfully",
				result: result
			}));
		}

	order.productsOrdered.push({ productId, quantity, subtotal});
	order.totalPrice += subtotal; 

	return order.save()
	.then(result=> res.status(200).send({
		message: "Items ordered successfully",
		result: result
		}));
	})
	.catch(err=> errorHandler(err,req,res));
};	

module.exports.getUserOrder = (req, res) => {
    return Order.find({ userId: req.user.id })
    .then(order => {
        if (order.length === 0) {
            return res.status(404).send({ message: "No order history found"})
            };
            return newOrder.save()
            .then(savedOrder => res.status(200).send({
                order: order
            });
        })
    .catch(err => errorHandler(err, req, res));
};

module.exports.getAllOrders= (req, res) => {
	return Order.find()
	.then(result => {
		if (result.length === 0) {
			return res.status(404).send({ message: "No orders found"});
		}
		return res.status(200).send({
			message: "Orders found",
			result: result
		});
	})
	.catch(err=> errorHandler(err, req, res));	
};