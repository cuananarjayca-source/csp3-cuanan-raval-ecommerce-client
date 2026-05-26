const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Stock = require("../models/Stock");
const User = require("../models/User");
const { errorHandler } = require("../auth");

const VALID_STATUSES = ["Pending", "Confirmed", "Cancelled"];

// Authenticated user access only

module.exports.createOrder = (req, res) => {
	return User.findById(req.user.id)
		.then((user) => {
			if (!user) {
				return res.status(404).send({ message: "User not found" });
			}
			if (!user.isActive) {
				return res.status(403).send({ message: "Account is deactivated. Please contact support." });
			}

			return Cart.findOne({ userId: req.user.id })
				.then((cart) => {
					if (!cart || cart.cartItems.length === 0) {
						return res.status(400).send({ message: "No items to checkout" });
					}

					const orderItems = cart.cartItems.map((item) => ({
						productId: item.productId,
						quantity: item.quantity,
						subtotal: item.subtotal
					}));

					const order = new Order({
						userId: req.user.id,
						productsOrdered: orderItems,
						totalPrice: cart.totalPrice,
						status: "Confirmed"
					});

					return order.save()
						.then((savedOrder) => {
							cart.cartItems = [];
							cart.totalPrice = 0;

							const stockUpdates = savedOrder.productsOrdered.map((item) =>
								Stock.findOne({ productId: item.productId })
									.then((stock) => {
										if (stock) {
											stock.quantity = Math.max(0, stock.quantity - item.quantity);
											return stock.save();
										}
									})
							);

							return Promise.all(stockUpdates)
								.then(() => cart.save())
								.then(() => Order.findById(savedOrder._id)
									.populate("productsOrdered.productId", "name price imageUrl")
								)
								.then((populatedOrder) => res.status(201).send({
									message: "Ordered successfully",
									order: populatedOrder
								}));
						});
				});
		})
		.catch((err) => errorHandler(err, req, res));
};

module.exports.getUserOrder = (req, res) => {
	return User.findById(req.user.id)
		.then((user) => {
			if (!user) {
				return res.status(404).send({ message: "User not found" });
			}
			if (!user.isActive) {
				return res.status(403).send({ message: "Account is deactivated. Please contact support." });
			}

			return Order.find({ userId: req.user.id })
				.populate("productsOrdered.productId", "name price")
				.then((result) => {
					if (result.length === 0) {
						return res.status(404).send({ message: "No orders found" });
					}
					return res.status(200).send({ orders: result });
				});
		})
		.catch((err) => errorHandler(err, req, res));
};

// Admin level access

module.exports.getAllOrders = (req, res) => {
	return Order.find()
		.populate("productsOrdered.productId", "name price")
		.then((result) => {
			if (result.length === 0) {
				return res.status(404).send({ message: "No orders found" });
			}
			return res.status(200).send({ orders: result });
		})
		.catch((err) => errorHandler(err, req, res));
};

module.exports.updateOrderStatus = (req, res) => {
	const { status } = req.body;

	if (!status) {
		return res.status(400).send({ message: "Status is required" });
	}
	if (!VALID_STATUSES.includes(status)) {
		return res.status(400).send({ message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
	}

	return Order.findById(req.params.id)
		.then((order) => {
			if (!order) {
				return res.status(404).send({ message: "Order not found" });
			}
			if (order.status === status) {
				return res.status(400).send({ message: `Order is already ${status}` });
			}

			const previousStatus = order.status;
			order.status = status;

			return order.save()
				.then((savedOrder) => {
					if (status === "Cancelled" && previousStatus !== "Cancelled") {
						const stockRestores = savedOrder.productsOrdered.map((item) =>
							Stock.findOne({ productId: item.productId })
								.then((stock) => {
									if (stock) {
										stock.quantity += item.quantity;
										return stock.save();
									}
								})
						);
						return Promise.all(stockRestores);
					}
				})
				.then(() => Order.findById(order._id)
					.populate("productsOrdered.productId", "name price")
				)
				.then((populatedOrder) => res.status(200).send({
					message: "Order status updated successfully",
					updatedOrder: populatedOrder
				}));
		})
		.catch((err) => errorHandler(err, req, res));
};