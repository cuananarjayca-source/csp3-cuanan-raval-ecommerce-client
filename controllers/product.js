const Product = require("../models/Product");
const { errorHandler } = require("../auth");
const jwt = require("jsonwebtoken"); 

// USER AND ADMIN LEVEL ACCESS

// Retrieve all active products
module.exports.getActiveProduct = (req, res) => {
    return Product.find({ isActive: true })
        .then((result) => res.status(200).send(result))
        .catch((err) => errorHandler(err, req, res));
};

// Retrieve product by ID (only if active)
module.exports.getProductById = (req, res) => {
    return Product.findOne({ _id: req.params.productId, isActive: true })
        .then((result) => {
            if (!result) {
                return res.status(404).send({ message: "Product not found or is inactive" });
            } else {
                return res.status(200).send(result);
            }
        })
        .catch((err) => errorHandler(err, req, res));
};


// ADMIN LEVEL ACCESS

// Create Product
module.exports.createProduct = (req, res) => {
    if (!req.body.name) {
        return res.status(400).send({ message: "Product name is required" });
    }
    if (!req.body.description) {
        return res.status(400).send({ message: "Product description is required" });
    }
    if (!req.body.price) {
        return res.status(400).send({ message: "Product price is required" });
    }

    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    });

    return product.save()
        .then((result) => res.status(201).send({
            message: "Product created successfully",
            product: result
        }))
        .catch((err) => errorHandler(err, req, res));
};

// Retrieve all products
module.exports.getAllProduct = (req, res) => {
    return Product.find()
        .then((result) => res.status(200).send(result))
        .catch((err) => errorHandler(err, req, res));
};

// Update Product Info
module.exports.updateProduct = (req, res) => {
    return Product.findByIdAndUpdate(
        req.params.productId,
        { $set: req.body },
        { new: true }
    )
        .then((result) => {
            if (!result) {
                return res.status(404).send({ message: "Product not found" });
            }
            return res.status(200).send({ success: true, message: "Product updated successfully" });
        })
        .catch((err) => errorHandler(err, req, res));
};

// Archive Product (set isActive to false) check if product is already archived
module.exports.archiveProduct = (req, res) => {
    return Product.findById(req.params.productId)
        .then((result) => {
            if (!result) {
                return res.status(404).send({ message: "Product not found" });
            }
            if (!result.isActive) {
                return res.status(200).send({ message: "Product is already archived", archiveProduct: result });
            }
            return Product.findByIdAndUpdate(
                req.params.productId,
                { isActive: false },
                { new: true }
            )
                .then((updatedResult) => {
                    return res.status(200).send({ success: true, message: "Product archived successfully" });
                })
                .catch((err) => errorHandler(err, req, res));
        })
        .catch((err) => errorHandler(err, req, res));
};

// Activate Product (set isActive to true) check if product is already active
module.exports.activateProduct = (req, res) => {
    return Product.findById(req.params.productId)
        .then((result) => {
            if (!result) {
                return res.status(404).send({ message: "Product not found" });
            }
            if (result.isActive) {
                return res.status(200).send({ message: "Product is already active", activateProduct: result });
            }
            return Product.findByIdAndUpdate(
                req.params.productId,
                { isActive: true },
                { new: true }
            )
                .then((updatedResult) => {
                    return res.status(200).send({ success: true, message: "Product activated successfully" });
                })
                .catch((err) => errorHandler(err, req, res));
        })
        .catch((err) => errorHandler(err, req, res));
};
