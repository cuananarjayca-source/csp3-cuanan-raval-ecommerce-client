const Product = require("../models/Product");
const Stock = require("../models/Stock");
const { errorHandler } = require("../auth");

// USER LEVEL ACCESS

module.exports.checkStock = (req, res) => {
    const { productId } = req.params;

    return Stock.findOne({ productId })
        .then((stock) => {
            if (!stock) {
                return res.status(404).send({ message: "Stock record not found" });
            }
            if (stock.quantity === 0) {
                return res.status(200).send({ message: "Item is out of stock" });
            }
            return res.status(200).send({ message: "Item found", quantity: stock.quantity });
        })
        .catch((err) => errorHandler(err, req, res));
};

// ADMIN LEVEL ACCESS

module.exports.createStock = (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId) {
        return res.status(400).send({ message: "Product ID is required" });
    }
    if (quantity === undefined || quantity === null || !Number.isFinite(Number(quantity)) || quantity < 0) {
        return res.status(400).send({ message: "Valid quantity is required" });
    }

    return Product.findById(productId)
        .then((product) => {
            if (!product) {
                return res.status(404).send({ message: "Product not found" });
            }

            return Stock.findOne({ productId })
                .then((existing) => {
                    if (existing) {
                        return res.status(409).send({ message: "Stock record already exists for this product" });
                    }

                    const stock = new Stock({ productId, quantity });

                    return stock.save()
                        .then((result) => res.status(201).send({
                            message: "Stock record created successfully",
                            stock: result
                        }));
                });
        })
        .catch((err) => errorHandler(err, req, res));
};

module.exports.getAllStock = (req, res) => {
    return Stock.find()
        .populate("productId", "name price imageUrl")
        .then((result) => res.status(200).send({ stocks: result }))
        .catch((err) => errorHandler(err, req, res));
};

module.exports.getStockByProduct = (req, res) => {
    return Stock.findOne({ productId: req.params.productId })
        .populate("productId", "name price imageUrl")
        .then((result) => {
            if (!result) {
                return res.status(404).send({ message: "Stock record not found" });
            }
            return res.status(200).send({ stock: result });
        })
        .catch((err) => errorHandler(err, req, res));
};

module.exports.updateStock = (req, res) => {
    const { quantity } = req.body;

    if (quantity === undefined || quantity === null || !Number.isFinite(Number(quantity)) || quantity < 0) {
        return res.status(400).send({ message: "Valid quantity is required" });
    }

    return Stock.findOne({ productId: req.params.productId })
        .then((stock) => {
            if (!stock) {
                return res.status(404).send({ message: "Stock record not found" });
            }

            stock.quantity = quantity;

            return stock.save()
                .then((result) => res.status(200).send({
                    message: "Stock updated successfully",
                    stock: result
                }));
        })
        .catch((err) => errorHandler(err, req, res));
};

module.exports.adjustStock = (req, res) => {
    const { adjustment } = req.body;

    if (adjustment === undefined || adjustment === null || !Number.isFinite(Number(adjustment))) {
        return res.status(400).send({ message: "Valid adjustment value is required" });
    }

    return Stock.findOne({ productId: req.params.productId })
        .then((stock) => {
            if (!stock) {
                return res.status(404).send({ message: "Stock record not found" });
            }

            const newQuantity = stock.quantity + Number(adjustment);

            if (newQuantity < 0) {
                return res.status(400).send({ message: "Adjustment would result in negative stock" });
            }

            stock.quantity = newQuantity;

            return stock.save()
                .then((result) => res.status(200).send({
                    message: "Stock adjusted successfully",
                    stock: result
                }));
        })
        .catch((err) => errorHandler(err, req, res));
};

module.exports.deleteStock = (req, res) => {
    return Stock.findOne({ productId: req.params.productId })
        .then((stock) => {
            if (!stock) {
                return res.status(404).send({ message: "Stock record not found" });
            }

            return stock.deleteOne()
                .then(() => res.status(200).send({ message: "Stock record deleted successfully" }));
        })
        .catch((err) => errorHandler(err, req, res));
};