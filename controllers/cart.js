const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { errorHandler } = require("../auth");


// Authenticated user access only

module.exports.getUserCart = (req, res) => {
    return Cart.findOne({ userId: req.user.id })
    .then(cart => {
        if (!cart) {
            return res.status(404).send({ message: "User cart not found"});
        }

        return res.status(200).send({
            cart: cart
        });
    })
    .catch(err => errorHandler(err, req, res));
};

module.exports.addToCart = (req, res) => {
	const { productId, quantity, subtotal } = req.body;

	return Cart.findOne({ userId: req.user.id })
	.then(cart=> {
		if (!cart) {
			return res.status(404).send({ message: "User cart not found"});
		}

	cart.cartItems.push({ productId, quantity, subtotal});
	cart.totalPrice += subtotal; 

	return cart.save()
	.then(result=> res.status(200).send({
		message: "Item added to cart successfully",
		result: result
		}));
	})
	.catch(err=> errorHandler(err,req,res));
};	

module.exports.changeProductQuantity = (req, res) => {
	const { productId, newQuantity } = req.body;

	if (!newQuantity || newQuantity < 1 || !Number.isFinite(Number(newQuantity))) {
		return res.status(400).send({ message: "Invalid quantity" });
	}

	return Cart.findOne({ userId: req.user.id })
	.then(cart=> {
		if (!cart) {
			return res.status(404).send({ message: "User cart not found"});
		}

	const item = cart.cartItems.find(
		item => item.productId.toString() === productId);

	if (!item) {
		return res.status(404).send({ message: "Product not found in cart"});
	}

	return Product.findById(item.productId)
		.then(product => {
			if (!product) {
				return res.status(404).send({ message: "Product not found" });
			}

			const oldSubtotal = item.subtotal;
			const quantity = Number(newQuantity);
			const newSubtotal = quantity * product.price;

			item.quantity = quantity;
			item.subtotal = newSubtotal;

			cart.totalPrice += newSubtotal - oldSubtotal;

			return cart.save();
		})
		.then(result=> res.status(200).send({
			message: "Item quantity updated successfully",
			updateCart: result
		}));
	})
	.catch(err=> errorHandler(err,req,res));
};
