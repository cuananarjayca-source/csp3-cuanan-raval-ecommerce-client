<script setup>
import { onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { getProductById, getErrorMessage } from "../api.js";

const props = defineProps({
    id: { type: String, required: true },
});

const product = ref(null);
const loading = ref(true);
const error = ref(null);

function formatPrice(price) {
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(price);
}

async function load() {
    loading.value = true;
    error.value = null;
    try {
        product.value = await getProductById(props.id);
    } catch (e) {
        product.value = null;
        error.value = getErrorMessage(e, "Product not found.");
    } finally {
        loading.value = false;
    }
}

onMounted(load);
watch(() => props.id, load);
</script>

<template>
    <div class="container py-4">
        <RouterLink to="/products" class="btn btn-link">&larr; Back to catalog</RouterLink>

        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
        </div>
        <div v-else-if="error" class="alert alert-warning">{{ error }}</div>
        <div v-else-if="product" class="row g-4">
            <div class="col-md-6" v-if="product.imageUrl">
                <img :src="product.imageUrl" :alt="product.name" class="img-fluid rounded border" />
            </div>
            <div class="col-md-6">
                <span class="badge text-bg-secondary">{{ product.category }}</span>
                <h1 class="h2 mt-2">{{ product.name }}</h1>
                <p class="h4 text-primary">{{ formatPrice(product.price) }}</p>
                <p>{{ product.description }}</p>
                <ul class="list-unstyled small text-muted">
                    <li>Stock: {{ product.stock ?? 0 }}</li>
                    <li v-if="product.avgRating">Rating: {{ product.avgRating }}</li>
                    <li v-if="product.featured">Featured product</li>
                </ul>
            </div>
        </div>
    </div>
</template>
