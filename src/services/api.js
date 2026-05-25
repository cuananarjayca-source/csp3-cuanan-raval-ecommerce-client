export {
    default,
    DEFAULT_THEME,
    themeToCssVars,
    getErrorMessage,
    getActiveProducts,
    getProductById,
    searchProductsByName,
    searchProductsByPrice,
    searchProductsByRating,
    extractCategories,
    applyClientFilters,
    loadCatalogProducts,
    registerUser,
    loginUser,
    // ——— Admin: Products ———
    getAllProducts,
    createProduct,
    updateProduct,
    archiveProduct,
    activateProduct,
    // ——— Admin: Stock ———
    createStock,
    updateStock,
    getAllStock,
    // ——— Cloudinary ———
    uploadImage,
    // ——— Cart ———
    getCart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
} from "../api.js";