const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Stock = require("../models/Stock");
const User = require("../models/User");
const { errorHandler } = require("../auth");

// Authenticated user access only

module.exports.getUserCart = (req, res) => {
    return User.findById(req.user.id)
        .then((user) => {
            if (!user) {
                return res.status(404).send({ message: "User not found" });
            }
            if (!user.isActive) {
                return res.status(403).send({ message: "Account is deactivated. Please contact support." });
            }

            return Cart.findOne({ userId: req.user.id })
                .populate("cartItems.productId", "name price imageUrl")
                .then((cart) => {
                    if (!cart) {
                        const newCart = new Cart({
                            userId: req.user.id,
                            cartItems: [],
                            totalPrice: 0
                        });
                        return newCart.save()
                            .then((savedCart) => res.status(200).send({ cart: savedCart }));
                    }

                    return res.status(200).send({ cart });
                });
        })
        .catch((err) => errorHandler(err, req, res));
};

module.exports.addToCart = (req, res) => {
    const { productId, quantity } = req.body;

    if (!quantity || quantity < 1 || !Number.isFinite(Number(quantity))) {
        return res.status(400).send({ message: "Invalid quantity" });
    }

    return User.findById(req.user.id)
        .then((user) => {
            if (!user) {
                return res.status(404).send({ message: "User not found" });
            }
            if (!user.isActive) {
                return res.status(403).send({ message: "Account is deactivated. Please contact support." });
            }

            return Product.findById(productId)
                .then((product) => {
                    if (!product) {
                        return res.status(404).send({ message: "Product not found" });
                    }
                    if (!product.isActive) {
                        return res.status(400).send({ message: "Product is unavailable" });
                    }

                    return Stock.findOne({ productId })
                        .then((stock) => {
                            if (!stock) {
                                return res.status(404).send({ message: "Stock record not found" });
                            }
                            if (stock.quantity === 0) {
                                return res.status(400).send({ message: "Item is out of stock" });
                            }
                            if (stock.quantity < quantity) {
                                return res.status(400).send({ message: `Only ${stock.quantity} item(s) left in stock` });
                            }

                            const subtotal = product.price * quantity;

                            return Cart.findOne({ userId: req.user.id })
                                .then((cart) => {
                                    if (!cart) {
                                        const newCart = new Cart({
                                            userId: req.user.id,
                                            cartItems: [{ productId, quantity, subtotal }],
                                            totalPrice: subtotal
                                        });
                                        return newCart.save()
                                            .then(() => Cart.findById(newCart._id)
                                                .populate("cartItems.productId", "name price imageUrl")
                                            )
                                            .then((populatedCart) => res.status(201).send({
                                                message: "Item added to cart successfully",
                                                cart: populatedCart
                                            }));
                                    }

                                    const existingItem = cart.cartItems.find(
                                        (item) => item.productId.toString() === productId
                                    );

                                    if (existingItem) {
                                        const newTotal = existingItem.quantity + quantity;
                                        if (newTotal > stock.quantity) {
                                            return res.status(400).send({ message: `Only ${stock.quantity} item(s) left in stock` });
                                        }
                                        existingItem.quantity += quantity;
                                        existingItem.subtotal += subtotal;
                                    } else {
                                        cart.cartItems.push({ productId, quantity, subtotal });
                                    }

                                    cart.totalPrice += subtotal;

                                    return cart.save()
                                        .then(() => Cart.findById(cart._id)
                                            .populate("cartItems.productId", "name price")
                                        )
                                        .then((populatedCart) => res.status(200).send({
                                            message: "Item added to cart successfully",
                                            cart: populatedCart
                                        }));
                                });
                        });
                });
        })
        .catch((err) => errorHandler(err, req, res));
};

module.exports.changeProductQuantity = (req, res) => {
    const { productId, newQuantity } = req.body;

    if (!newQuantity || newQuantity < 1 || !Number.isFinite(Number(newQuantity))) {
        return res.status(400).send({ message: "Invalid quantity" });
    }

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
                    if (!cart) {
                        return res.status(404).send({ message: "User cart not found" });
                    }

                    const item = cart.cartItems.find(
                        (item) => item.productId.toString() === productId
                    );

                    if (!item) {
                        return res.status(404).send({ message: "Product not found in cart" });
                    }

                    return Product.findById(item.productId)
                        .then((product) => {
                            if (!product) {
                                return res.status(404).send({ message: "Product not found" });
                            }

                            return Stock.findOne({ productId })
                                .then((stock) => {
                                    if (!stock) {
                                        return res.status(404).send({ message: "Stock record not found" });
                                    }
                                    if (newQuantity > stock.quantity) {
                                        return res.status(400).send({ message: `Only ${stock.quantity} item(s) left in stock` });
                                    }

                                    const oldSubtotal = item.subtotal;
                                    const quantity = Number(newQuantity);
                                    const newSubtotal = quantity * product.price;

                                    item.quantity = quantity;
                                    item.subtotal = newSubtotal;
                                    cart.totalPrice = Math.max(0, cart.totalPrice + newSubtotal - oldSubtotal);

                                    return cart.save()
                                        .then(() => Cart.findById(cart._id)
                                            .populate("cartItems.productId", "name price imageUrl")
                                        )
                                        .then((populatedCart) => res.status(200).send({
                                            message: "Item quantity updated successfully",
                                            updatedCart: populatedCart
                                        }));
                                });
                        });
                });
        })
        .catch((err) => errorHandler(err, req, res));
};

module.exports.removeFromCart = (req, res) => {
    const { productId } = req.params;

    return Cart.findOne({ userId: req.user.id })
    .then(cart => {
        if (!cart) return res.status(404).send({ message: "User cart not found" });

        const itemIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId);

        if (itemIndex === -1) {
            return res.status(404).send({ message: "Item not found in cart" });
        }

        cart.totalPrice -= cart.cartItems[itemIndex].subtotal;
        cart.cartItems.splice(itemIndex, 1); 

        return cart.save();
    })
    .then(result => res.status(200).send({
        message: "Item removed from cart successfully",
        updatedCart: result
    }))
    .catch(err => errorHandler(err, req, res));
};

// CLEAR ALL ITEMS
module.exports.clearCartItems = (req, res) => {

    return Cart.findOne({ userId: req.user.id })
    .then(cart => {
        if (!cart) return res.status(404).send({ message: "User cart not found" });

        if (cart.cartItems.length === 0) {
            return res.status(400).send({ message: "Cart is already empty" });
        }

        cart.cartItems = [];    
        cart.totalPrice = 0;
         
        return cart.save();
    })
    .then(result => res.status(200).send({
        message: "Cart cleared successfully",
        cart: result
    }))
    .catch(err => errorHandler(err, req, res));
};