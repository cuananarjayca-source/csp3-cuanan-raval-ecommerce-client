import axios from "axios";

/** Backend: http://localhost:4000 (cors enabled). Override with VITE_API_BASE_URL in .env */
const api = axios.create({
    baseURL: import.meta.env.VITE_JOB_TRACKER_API 
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ——— Auth (user routes) ———

export async function registerUser(userData) {
    return api.post("/users/register", userData);
}

export async function loginUser(credentials) {
    return api.post("/users/login", credentials);
}

// ——— Theme helpers ———

export const DEFAULT_THEME = {
    primary: "#4B2C6D",
    secondary: "#C4A1D5",
    accent: "#B19CD9",
    background: "#F3E5F5",
    surface: "#ffffff",
    text: "#2d1b3d",
    heroText: "#ffffff",
};

export function themeToCssVars(theme = DEFAULT_THEME) {
    const t = { ...DEFAULT_THEME, ...theme };
    return {
        "--theme-primary": t.primary,
        "--theme-secondary": t.secondary || t.accent,
        "--theme-accent": t.accent || t.secondary,
        "--theme-bg": t.background,
        "--theme-surface": t.surface,
        "--theme-text": t.text,
        "--theme-hero-text": t.heroText,
    };
}

export function getErrorMessage(err, fallback = "Request failed") {
    return err?.response?.data?.message ?? fallback;
}

// ——— Products (productController) ———

export async function getActiveProducts() {
    const { data } = await api.get("/products/active");
    return Array.isArray(data) ? data : [];
}

export async function getProductById(productId) {
    const { data } = await api.get(`/products/${productId}`);
    return data;
}

export async function searchProductsByName(name) {
    const { data } = await api.post("/products/search-by-name", { name });
    return Array.isArray(data) ? data : [];
}

export async function searchProductsByPrice(minPrice, maxPrice) {
    const { data } = await api.post("/products/search-by-price", {
        minPrice: Number(minPrice),
        maxPrice: Number(maxPrice),
    });
    return Array.isArray(data) ? data : [];
}

export async function searchProductsByRating(minRating = 0) {
    const { data } = await api.get("/products/search-by-rating", { params: { minRating } });
    return data?.products ?? [];
}

export function extractCategories(products = []) {
    return [...new Set(products.map((p) => p.category).filter(Boolean))].sort();
}

const SORT_FNS = {
    newest: (a, b) => new Date(b.createdOn) - new Date(a.createdOn),
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    "name-asc": (a, b) => a.name.localeCompare(b.name),
    "name-desc": (a, b) => b.name.localeCompare(a.name),
};

export function applyClientFilters(products, { category = "", sort = "newest", featured = false } = {}) {
    let list = [...products];
    if (featured) list = list.filter((p) => p.featured);
    if (category) list = list.filter((p) => p.category === category);
    return list.sort(SORT_FNS[sort] || SORT_FNS.newest);
}

export async function loadCatalogProducts(filters = {}) {
    const name = filters.search?.trim();
    const minPrice =
        filters.minPrice !== "" && filters.minPrice != null ? Number(filters.minPrice) : null;
    const maxPrice =
        filters.maxPrice !== "" && filters.maxPrice != null ? Number(filters.maxPrice) : null;
    const minRating =
        filters.minRating !== "" && filters.minRating != null ? Number(filters.minRating) : null;

    let products = [];

    try {
        if (name) {
            products = await searchProductsByName(name);
        } else if (
            minPrice != null &&
            maxPrice != null &&
            !Number.isNaN(minPrice) &&
            !Number.isNaN(maxPrice)
        ) {
            products = await searchProductsByPrice(minPrice, maxPrice);
        } else if (minRating != null && !Number.isNaN(minRating) && minRating > 0) {
            products = await searchProductsByRating(minRating);
        } else {
            products = await getActiveProducts();
        }
    } catch (err) {
        if (err?.response?.status === 404) {
            products = [];
        } else {
            throw err;
        }
    }

    return applyClientFilters(products, filters);
}

// ——— Admin: Products ———

export async function getAllProducts() {
    const { data } = await api.get("/products/all");
    return Array.isArray(data) ? data : [];
}

export async function createProduct(productData) {
    // productData: { name, description, price }
    const { data } = await api.post("/products/", productData);
    return data;
}

export async function updateProduct(productId, productData) {
    // productData: { name?, description?, price? }
    const { data } = await api.patch(`/products/${productId}/update`, productData);
    return data;
}

export async function archiveProduct(productId) {
    const { data } = await api.patch(`/products/${productId}/archive`);
    return data;
}

export async function activateProduct(productId) {
    const { data } = await api.patch(`/products/${productId}/activate`);
    return data;
}

// ——— Admin: Stock ———

export async function createStock(productId, quantity) {
    const { data } = await api.post("/stocks/create-stock", { productId, quantity });
    return data;
}

export async function updateStock(productId, quantity) {
    const { data } = await api.put(`/stocks/update-stock/${productId}`, { quantity });
    return data;
}

export async function getAllStock() {
    const { data } = await api.get("/stocks/get-all-stocks");
    return Array.isArray(data.stocks) ? data.stocks : [];
}

export async function adjustStock(productId, adjustment) {
    const { data } = await api.patch(`/stocks/adjust-stock/${productId}`, { adjustment });
    return data;
}

// ——— Cloudinary Image Upload ———

export async function uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message ?? "Image upload failed");
    }

    return data.secure_url;
}

// ——— Cart ———

export async function getCart() {
    const { data } = await api.get("/cart/get-cart");
    return data?.cart ?? null;
}

export async function addToCart(productId, quantity) {
    const { data } = await api.post("/cart/add-to-cart", { productId, quantity });
    return data;
}

export async function updateCartQuantity(productId, newQuantity) {
    const { data } = await api.patch("/cart/update-cart-quantity", { productId, newQuantity });
    return data;
}

export async function removeFromCart(productId) {
    const { data } = await api.patch(`/cart/${productId}/remove-from-cart`);
    return data;
}

export async function clearCart() {
    const { data } = await api.put("/cart/clear-cart");
    return data;
}

// ——— Admin Orders ———
export async function getAllOrders() {
    const { data } = await api.get("/orders/all-orders");
    return Array.isArray(data.orders) ? data.orders : [];
}

export async function updateOrderStatus(orderId, status) {
    const { data } = await api.patch(`/orders/change-status/${orderId}`, { status });
    return data;
}

// ——— Admin Payments ———

export const getAllPayments = async () => {
    try {
        // FIXED: Changed from '/payments' to match backend route
        const response = await api.get('/payment/get-all-payments');
        
        // Note: Ensure your backend returns the data array directly, 
        // or map it here if it's nested (e.g., response.data.payments)
        return response.data; 
    } catch (error) {
        throw error;
    }
};

export const updatePaymentStatus = async (paymentId, status) => {
    try {
        // FIXED: Changed from PUT to PATCH and fixed the path string
        const response = await api.patch(`/payment/update-payment-status/${paymentId}`, { status });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAllUsers = async () => {
    try {
        const response = await api.get('/users/show-all-users');
        return response.data; // Passes { message, result } directly to Vue component
    } catch (error) {
        throw error;
    }
};

export const promoteUserToAdmin = async (userId) => {
    try {
        const response = await api.patch(`/users/${userId}/promote-admin`);
        return response.data; // Contains { message, user }
    } catch (error) {
        throw error;
    }
};

export const demoteUserFromAdmin = async (userId) => {
    try {
        const response = await api.patch(`/users/${userId}/demote-admin`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateProfileAsAdmin = async (userId, profileData) => {
    try {
        // profileData parameter layout: { firstName, lastName, mobileNo, email }
        const response = await api.put(`/users/update-profile-admin/${userId}`, profileData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deactivateUserAsAdmin = async (userId) => {
    try {
        const response = await api.put(`/users/${userId}/deactivate`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const activateUserAsAdmin = async (userId) => {
    try {
        const response = await api.put(`/users/${userId}/activate`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// ——— Admin Reviews ———

export const getAllReviews = async () => {
    try {
        // FIXED: Changed from '/reviews' to match backend route
        const response = await api.get('/review/get-all-reviews');
        return response.data; 
    } catch (error) {
        throw error;
    }
};

export const getReviewById = async (reviewId) => {
    try {
        const response = await api.get(`/review/get-review/${reviewId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getReviewsByUser = async (userId) => {
    try {
        const response = await api.get(`/review/user/${userId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const editReviewAsAdmin = async (reviewId, updateData) => {
    try {
        // FIXED: Changed from PUT to PATCH and corrected the endpoint structure
        const response = await api.patch(`/review/admin-edit-review/${reviewId}`, updateData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteReviewAsAdmin = async (reviewId) => {
    try {
        // FIXED: Corrected the endpoint path string
        const response = await api.delete(`/review/admin-delete-review/${reviewId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getReviewsByProduct = async (productId) => {
    try {
        const response = await api.get(`/review/product/${productId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createReview = async (reviewData) => {
    try {
        // reviewData layout example: { productId, rating, comment }
        const response = await api.post('/review/create-review', reviewData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMyReviews = async () => {
    try {
        const response = await api.get('/review/my-reviews');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const editReview = async (reviewId, updateData) => {
    try {
        // updateData layout example: { rating?, comment? }
        const response = await api.patch(`/review/edit-review/${reviewId}`, updateData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteReview = async (reviewId) => {
    try {
        const response = await api.delete(`/review/delete-review/${reviewId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export async function checkoutOrder() {
    const { data } = await api.post("/orders/checkout");
    return data;
}
 
export async function getUserOrders() {
    const { data } = await api.get("/orders/my-orders");
    return Array.isArray(data.orders) ? data.orders : [];
}

export async function createPayment(orderId, paymentMethod, amount) {
    const { data } = await api.post("/payment/create-payment", { orderId, paymentMethod, amount });
    return data;
}
 
export async function getMyPayments() {
    const { data } = await api.get("/payment/my-payments");
    return Array.isArray(data.payments) ? data.payments : [];
}

// ——— Stock (user) ———
export async function checkStock(productId) {
    const { data } = await api.get(`/stocks/check-stock/${productId}`);
    return data; // { message, quantity }
}


export default api;