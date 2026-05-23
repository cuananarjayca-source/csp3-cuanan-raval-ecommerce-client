const Product = require("../models/Product");
const { errorHandler } = require("../auth");


// USER AND ADMIN LEVEL ACCESS

module.exports.getActiveProduct = (req, res) => {
    return Product.find({ isActive: true })
        .then((result) => res.status(200).send(result))
        .catch((err) => errorHandler(err, req, res));
};

module.exports.getProductById = (req, res) => {
    return Product.findOne({ _id: req.params.productId, isActive: true })
        .then((result) => {
            if (!result) {
                return res.status(404).send({ message: "Product not found or is inactive" });
            }
            return res.status(200).send(result);
        })
        .catch((err) => errorHandler(err, req, res));
};

module.exports.searchProductByName = (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).send({ message: "Please provide a product name to search." });
    }
    return Product.find({
        name: { $regex: name, $options: "i" },
        isActive: true
    })
        .then((result) => {
            if (result.length === 0) {
                return res.status(404).send({ message: "No products match your search." });
            }
            return res.status(200).send(result);
        })
        .catch((err) => errorHandler(err, req, res));
};

module.exports.searchProductByPriceRange = (req, res) => {
    const { minPrice, maxPrice } = req.body;

    if (minPrice === undefined || minPrice === null) {
        return res.status(400).send({ message: "minPrice is required" });
    }
    if (maxPrice === undefined || maxPrice === null) {
        return res.status(400).send({ message: "maxPrice is required" });
    }
    if (typeof minPrice !== "number" || typeof maxPrice !== "number") {
        return res.status(400).send({ message: "minPrice and maxPrice must be numbers" });
    }
    if (minPrice < 0 || maxPrice < 0) {
        return res.status(400).send({ message: "Price values must not be negative" });
    }
    if (minPrice > maxPrice) {
        return res.status(400).send({ message: "minPrice must not be greater than maxPrice" });
    }

    return Product.find({
        price: { $gte: minPrice, $lte: maxPrice },
        isActive: true
    })
        .then((result) => {
            if (!result.length) {
                return res.status(404).send({ message: "No products found in that price range" });
            }
            return res.status(200).send(result);
        })
        .catch((err) => errorHandler(err, req, res));
};

module.exports.searchProductByRating = (req, res) => {
    const minRating = Number(req.query.minRating) || 0;

    return Product.find({ 
        avgRating: { $gte: minRating }, 
        isActive: true 
    })
    .then(products => {
        if (products.length === 0) {
            return res.status(404).send({ message: "No products found with this rating." });
        }
        return res.status(200).send({ products });
    })
    .catch(err => errorHandler(err, req, res));
};


// ADMIN LEVEL ACCESS

module.exports.createProduct = (req, res) => {
    const { name, description, price, imageUrl } = req.body;

    if (!name) {
        return res.status(400).send({ message: "Product name is required" });
    }
    if (!description) {
        return res.status(400).send({ message: "Product description is required" });
    }
    if (!price) {
        return res.status(400).send({ message: "Product price is required" });
    }

    const product = new Product({
        name,
        description,
        price,
        imageUrl: imageUrl || null
    });

    return product.save()
        .then((result) => res.status(201).send({
            message: "Product created successfully",
            product: result
        }))
        .catch((err) => errorHandler(err, req, res));
};

module.exports.getAllProduct = (req, res) => {
    return Product.find()
        .then((result) => res.status(200).send(result))
        .catch((err) => errorHandler(err, req, res));
};

module.exports.updateProduct = (req, res) => {
    const { name, description, price, imageUrl } = req.body;
    
    return Product.findById(req.params.productId)
        .then((result) => {
            if (!result) {
                return res.status(404).send({ message: "Product not found" });
            }
            if (!result.isActive) {
                return res.status(400).send({ message: "Cannot update an archived product" });
            }

            result.name = name ?? result.name;
            result.description = description ?? result.description;
            result.price = price ?? result.price;
            result.imageUrl = imageUrl ?? result.imageUrl;

            return result.save()
                .then((updated) => res.status(200).send({
                    message: "Product updated successfully",
                    updatedProduct: updated
                }));
        })
        .catch((err) => errorHandler(err, req, res));
};

module.exports.archiveProduct = (req, res) => {
    return Product.findById(req.params.productId)
        .then((result) => {
            if (!result) {
                return res.status(404).send({ message: "Product not found" });
            }
            if (!result.isActive) {
                return res.status(400).send({ message: "Product is already archived" });
            }

            result.isActive = false;

            return result.save()
                .then((updated) => res.status(200).send({
                    message: "Product archived successfully",
                    result: updated
                }));
        })
        .catch((err) => errorHandler(err, req, res));
};

module.exports.activateProduct = (req, res) => {
    return Product.findById(req.params.productId)
        .then((result) => {
            if (!result) {
                return res.status(404).send({ message: "Product not found" });
            }
            if (result.isActive) {
                return res.status(400).send({ message: "Product is already active" });
            }

            result.isActive = true;

            return result.save()
                .then((updated) => res.status(200).send({
                    message: "Product activated successfully",
                    result: updated
                }));
        })
        .catch((err) => errorHandler(err, req, res));
};