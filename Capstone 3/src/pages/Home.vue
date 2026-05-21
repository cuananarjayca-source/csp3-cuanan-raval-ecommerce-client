<script setup>
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { getActiveProducts, extractCategories, applyClientFilters } from "../api.js";

const featuredProducts = ref([]);
const products = ref([]);
const categories = ref([]);
const loading = ref(true);
const error = ref(null);

function productImage(product) {
    return product?.images?.[0] || null;
}

function formatPrice(price) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

onMounted(async () => {
    try {
        const active = await getActiveProducts();
        featuredProducts.value = applyClientFilters(active, { featured: true, sort: "newest" });
        products.value = applyClientFilters(active, { sort: "newest" }).slice(0, 8);
        categories.value = extractCategories(active);
    } catch (e) {
        error.value = "Could not load products. Is the API running on port 4000?";
        console.error(e);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="container py-4">
        <div class="p-4 mb-4 bg-light rounded border">
            <h1 class="display-6">Taro606</h1>
            <p class="lead mb-3">Premium canned milk teas and lattes.</p>
            <RouterLink to="/products" class="btn btn-primary">Browse products</RouterLink>
        </div>

        <section class="mb-4">
            <h2 class="h4">Featured products</h2>
            <div v-if="loading" class="text-center py-4">
                <div class="spinner-border text-primary" role="status"></div>
            </div>
            <div v-else-if="error" class="alert alert-warning">{{ error }}</div>
            <div v-else-if="!featuredProducts.length" class="alert alert-info">No featured products.</div>
            <div v-else class="row g-3">
                <div v-for="product in featuredProducts" :key="product._id" class="col-md-4">
                    <div class="card h-100">
                        <img
                            v-if="productImage(product)"
                            :src="productImage(product)"
                            :alt="product.name"
                            class="card-img-top"
                        />
                        <div class="card-body">
                            <h3 class="card-title h6">{{ product.name }}</h3>
                            <p class="card-text small">{{ product.description }}</p>
                            <p class="fw-bold">{{ formatPrice(product.price) }}</p>
                            <RouterLink :to="`/products/${product._id}`" class="btn btn-sm btn-primary">Details</RouterLink>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="mb-4">
            <h2 class="h4">Products</h2>
            <div v-if="!loading && products.length" class="row g-3">
                <div v-for="product in products" :key="product._id" class="col-md-3">
                    <div class="card h-100">
                        <div class="card-body">
                            <h3 class="h6">{{ product.name }}</h3>
                            <p class="small text-muted">{{ product.category }}</p>
                            <RouterLink :to="`/products/${product._id}`" class="btn btn-sm btn-outline-primary">View</RouterLink>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section>
            <h2 class="h4">Categories</h2>
            <div class="list-group">
                <RouterLink
                    v-for="cat in categories"
                    :key="cat"
                    :to="{ path: '/products', query: { category: cat } }"
                    class="list-group-item list-group-item-action"
                >
                    {{ cat }}
                </RouterLink>
            </div>
        </section>
    </div>
</template>
