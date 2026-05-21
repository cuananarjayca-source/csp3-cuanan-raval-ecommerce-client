const Product = require("../models/Product");
const { errorHandler } = require("../auth");

/**
 * Maps Vue catalog sort values (?sort=) to Mongoose .sort() objects.
 * Frontend ProductCatalog.vue -> api.js sort param -> req.query.sort
 */
const SORT_MAP = {
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    "name-asc": { name: 1 },
    "name-desc": { name: -1 },
    newest: { createdOn: -1 },
};

/**
 * Builds a MongoDB filter from Express req.query.
 *
 * Query param contract (mirrors Capstone 3/src/api.js buildProductQuery):
 *   category  -> exact match on category field
 *   search    -> $text search on name + description (text index)
 *   featured  -> "true" limits to featured products (Home.vue hero section)
 *   minPrice  -> price >= number
 *   maxPrice  -> price <= number
 */
function buildFilter(query) {
    const filter = { isActive: true };

    if (query.category) {
        filter.category = query.category;
    }

    if (query.featured === "true") {
        filter.featured = true;
    }

    const minPrice = query.minPrice !== undefined ? Number(query.minPrice) : null;
    const maxPrice = query.maxPrice !== undefined ? Number(query.maxPrice) : null;

    if (minPrice !== null && !Number.isNaN(minPrice)) {
        filter.price = { ...filter.price, $gte: minPrice };
    }
    if (maxPrice !== null && !Number.isNaN(maxPrice)) {
        filter.price = { ...filter.price, $lte: maxPrice };
    }

    if (query.search && String(query.search).trim()) {
        filter.$text = { $search: String(query.search).trim() };
    }

    return filter;
}

function buildSort(query) {
    const sortKey = query.sort || "newest";
    return SORT_MAP[sortKey] || SORT_MAP.newest;
}

/**
 * GET /api/products
 * Public catalog endpoint — supports ?category= & ?search= & ?sort= & price range & ?featured=
 */
module.exports.listProducts = async (req, res) => {
    try {
        const filter = buildFilter(req.query);
        const sort = buildSort(req.query);

        const products = await Product.find(filter).sort(sort).lean();

        return res.status(200).json({
            success: true,
            count: products.length,
            products,
        });
    } catch (err) {
        return errorHandler(err, req, res);
    }
};

/**
 * GET /api/products/:id
 * Single product detail — Vue ProductDetail.vue uses api.getProductById(id)
 */
module.exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            isActive: true,
        }).lean();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        return res.status(200).json({
            success: true,
            product,
        });
    } catch (err) {
        return errorHandler(err, req, res);
    }
};

/**
 * GET /api/products/meta/categories
 * Distinct category labels for Home.vue category grid
 */
module.exports.getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct("category", { isActive: true });
        return res.status(200).json({
            success: true,
            categories: categories.filter(Boolean).sort(),
        });
    } catch (err) {
        return errorHandler(err, req, res);
    }
};
