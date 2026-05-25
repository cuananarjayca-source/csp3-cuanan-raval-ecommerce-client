<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import AddToCartButton from "../components/AddToCartButton.vue";
import {
    loadCatalogProducts,
    getActiveProducts,
    extractCategories,
    getErrorMessage,
} from "../api.js";

const route = useRoute();
const router = useRouter();

const products = ref([]);
const categories = ref([]);
const loading = ref(false);
const error = ref(null);

const filters = reactive({
    category: "",
    search: "",
    sort: "newest",
    minPrice: "",
    maxPrice: "",
    minRating: "",
});

const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A–Z" },
    { value: "name-desc", label: "Name: Z–A" },
];

function formatPrice(price) {
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(price);
}

function syncFiltersFromRoute() {
    filters.category = route.query.category ? String(route.query.category) : "";
    filters.search = route.query.search ? String(route.query.search) : "";
    filters.sort = route.query.sort ? String(route.query.sort) : "newest";
    filters.minPrice = route.query.minPrice != null ? String(route.query.minPrice) : "";
    filters.maxPrice = route.query.maxPrice != null ? String(route.query.maxPrice) : "";
    filters.minRating = route.query.minRating != null ? String(route.query.minRating) : "";
}

function buildRouteQuery() {
    const query = {};
    if (filters.category) query.category = filters.category;
    if (filters.search.trim()) query.search = filters.search.trim();
    if (filters.sort && filters.sort !== "newest") query.sort = filters.sort;
    if (filters.minPrice !== "") query.minPrice = filters.minPrice;
    if (filters.maxPrice !== "") query.maxPrice = filters.maxPrice;
    if (filters.minRating !== "") query.minRating = filters.minRating;
    return query;
}

async function fetchCatalog() {
    loading.value = true;
    error.value = null;

    if (
        (filters.minPrice !== "" || filters.maxPrice !== "") &&
        (filters.minPrice === "" || filters.maxPrice === "")
    ) {
        error.value = "Price search requires both min and max.";
        loading.value = false;
        return;
    }

    try {
        products.value = await loadCatalogProducts({ ...filters });
    } catch (e) {
        error.value = getErrorMessage(e, "Failed to load products.");
        products.value = [];
    } finally {
        loading.value = false;
    }
}

function clearFilters() {
    filters.category = "";
    filters.search = "";
    filters.sort = "newest";
    filters.minPrice = "";
    filters.maxPrice = "";
    filters.minRating = "";
}

let fetchDebounce;
watch(
    () => ({ ...filters }),
    async () => {
        clearTimeout(fetchDebounce);
        fetchDebounce = setTimeout(async () => {
            await router.replace({ query: buildRouteQuery() });
            await fetchCatalog();
        }, 300);
    },
    { deep: true }
);

onMounted(async () => {
    syncFiltersFromRoute();
    try {
        categories.value = extractCategories(await getActiveProducts());
    } catch (e) {
        console.error(e);
    }
    await fetchCatalog();
});
</script>

<template>
    <div class="container py-4">
        <h1 class="h2 mb-4">Product catalog</h1>

        <div class="row g-4">
            <aside class="col-lg-3">
                <div class="card">
                    <div class="card-body">
                        <h2 class="h6 card-title">Filters</h2>

                        <label class="form-label">Search name</label>
                        <input v-model="filters.search" type="search" class="form-control mb-3" />

                        <label class="form-label">Category</label>
                        <select v-model="filters.category" class="form-select mb-3">
                            <option value="">All</option>
                            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                        </select>

                        <label class="form-label">Min price</label>
                        <input v-model="filters.minPrice" type="number" min="0" step="0.01" class="form-control mb-2" />

                        <label class="form-label">Max price</label>
                        <input v-model="filters.maxPrice" type="number" min="0" step="0.01" class="form-control mb-3" />

                        <label class="form-label">Min rating</label>
                        <input v-model="filters.minRating" type="number" min="0" max="5" step="0.5" class="form-control mb-3" />

                        <label class="form-label">Sort</label>
                        <select v-model="filters.sort" class="form-select mb-3">
                            <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                        </select>

                        <button type="button" class="btn btn-secondary w-100" @click="clearFilters">Clear</button>
                    </div>
                </div>
            </aside>

            <section class="col-lg-9">
                <div v-if="loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status"></div>
                </div>
                <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
                <div v-else-if="!products.length" class="alert alert-secondary">No products found.</div>
                <div v-else class="row g-3">
                    <div v-for="product in products" :key="product._id" class="col-md-6 col-xl-4">
                        <div class="card h-100">
                            <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" class="card-img-top" style="height: 200px; object-fit: cover;" />
                            <div class="card-body">
                                <span class="badge text-bg-secondary mb-2">{{ product.category }}</span>
                                <h2 class="h6 card-title">{{ product.name }}</h2>
                                <p class="card-text small">{{ product.description }}</p>
                                <p class="fw-bold">{{ formatPrice(product.price) }}</p>
                                <RouterLink :to="`/products/${product._id}`" class="btn btn-primary btn-sm">Details</RouterLink>
                                <div class="card-body">
                                    <span class="badge text-bg-secondary mb-2">{{ product.category }}</span>
                                    <h2 class="h6 card-title">{{ product.name }}</h2>
                                    <p class="card-text small">{{ product.description }}</p>
                                    <p class="fw-bold">{{ formatPrice(product.price) }}</p>
                                    <RouterLink :to="`/products/${product._id}`" class="btn btn-primary btn-sm">Details</RouterLink>
                                    
                                    <div class="mt-2">
                                        <AddToCartButton
                                            :productId="product._id"
                                            :price="product.price"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>