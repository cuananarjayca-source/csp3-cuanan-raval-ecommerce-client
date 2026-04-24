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

module.exports.removeFromCart = (req, res) => {
	const { productId } = req.body;

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

	cart.totalPrice -= item.subtotal;
	cart.cartItems.pull({ _id: item._id});	 

	return cart.save()
	.then(result=> res.status(200).send({
		message: "Item removed from cart successfully",
		result: result
		}));
	})
	.catch(err=> errorHandler(err,req,res));
};

module.exports.clearCartItems = (req, res) => {
	return Cart.findOne({ userId: req.user.id })
	.then(cart=> {
		if (!cart) {
			return res.status(404).send({ message: "User cart not found"});
		}

	cart.cartItems = [];	
	cart.totalPrice = 0;
	 
	return cart.save()
	.then(result=> res.status(200).send({
		success: true,
		result: result
		}));
	})
	.catch(err=> errorHandler(err,req,res));
};

module.exports.searchProductByName = (req, res) => {
	const { name } = req.body;

	return Cart.findOne({ userId: req.user.id })
	.then(cart => {
		if (!cart) {
			return res.status(404).send({ message: "User cart not found"});
		}

		return cart.populate("cartItems.productId")
			.then(populatedCart => {
			const item = populatedCart.cartItems.find(
				item => item.productId.name === name
		);
			if (!item) {
				return res.status(404).send({ message: "Product not found in cart"});
			}

			return res.status(200).send({
				success: true,
				result: item
			});
		});	
	})
	.catch(err=> errorHandler(err,req,res));
};


module.exports.searchProductByPriceRange = (req, res) => {
	const { minPrice, maxPrice } = req.body;

	return Cart.findOne({ userId: req.user.id })
	.then(cart => {
		if (!cart) {
			return res.status(404).send({ message: "User cart not found"});
		}

		return cart.populate("cartItems.productId")
			.then(populatedCart => {
			const items = populatedCart.cartItems.filter(
				item => item.subtotal >= minPrice && item.subtotal <= maxPrice
		);
			
			if (!items.length) {
				return res.status(404).send({ message: "No product found in that price range"});
			}

			return res.status(200).send({
				success: true,
				result: items
			});
		});	
	})
	.catch(err=> errorHandler(err,req,res));
}