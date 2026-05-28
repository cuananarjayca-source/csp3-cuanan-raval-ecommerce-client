<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from "vue-router";
import AddToCartButton from "../components/AddToCartButton.vue";
import { RouterLink } from "vue-router";
import {
    loadCatalogProducts,
    getActiveProducts,
    extractCategories,
    getErrorMessage,
} from "../api.js";

const CARDS_PER_PAGE = 8
const currentPage = ref(1)

const route = useRoute();
const router = useRouter();

// --- State ---
const products = ref([]);
const categories = ref([]);
const loading = ref(false);
const error = ref(null);
const showFilters = ref(false); // Toggle state for toolbar

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

const totalPages = computed(() =>
    Math.max(1, Math.ceil(products.value.length / CARDS_PER_PAGE))
)

const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * CARDS_PER_PAGE
    return products.value.slice(start, start + CARDS_PER_PAGE)
})

function goToPage(page) {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
}

function nextPage() {
    goToPage(currentPage.value + 1)
}

function prevPage() {
    goToPage(currentPage.value - 1)
}

function formatPrice(price) {
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(price);
}

function formatRating(product) {
    const rating = product.avgRating ?? product.rating
    if (rating == null) return null
    const reviews = product.reviewCount ?? product.reviews ?? 0
    return `${Number(rating).toFixed(1)} (${reviews})`
}

function formatSold(product) {
    const sold = product.soldCount ?? product.totalSold ?? product.sales
    if (sold == null) return null
    return `${sold} SOLD`
}

async function fetchCatalog() {
    loading.value = true;
    error.value = null;
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
    Object.assign(filters, { category: "", search: "", sort: "newest", minPrice: "", maxPrice: "", minRating: "" });
}

// Watch filters
watch(filters, async () => {
    currentPage.value = 1
    await router.replace({ query: filters });
    await fetchCatalog();
}, { deep: true });

watch(products, () => {
    if (currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value
    }
})

onMounted(async () => {
    Object.assign(filters, route.query);
    categories.value = extractCategories(await getActiveProducts());
    await fetchCatalog();
});

</script>

<template>
  <div class="product-catalog-section">
    <div class="section-background"></div>
      <video autoplay muted loop playsinline class="background-video">
        <source src="../assets/wave-animation.mp4" type="video/mp4">
      </video>

    <div class="ps-container container py-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="page-title h2 text-dark">Product Catalog</h1>
        <button class="filter-toggle-btn" @click="showFilters = !showFilters">
          <i class="bi bi-funnel-fill"></i> Filters
        </button>
      </div>

      <transition name="slide-down">
        <div v-if="showFilters" class="filter-toolbar mb-4">
          <div class="row g-3">
            <div class="col-12 col-md-4 col-lg-2">
              <input v-model="filters.search" class="form-control filter-input" placeholder="Search name..." />
            </div>
            <div class="col-6 col-md-4 col-lg-2">
              <select v-model="filters.category" class="form-select filter-input">
                <option value="">All Categories</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <div class="col-6 col-md-4 col-lg-2">
              <select v-model="filters.sort" class="form-select filter-input">
                <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
            <div class="col-4 col-md-2 col-lg-1">
              <input v-model="filters.minPrice" type="number" class="form-control filter-input" placeholder="Min ₱" />
            </div>
            <div class="col-4 col-md-2 col-lg-1">
              <input v-model="filters.maxPrice" type="number" class="form-control filter-input" placeholder="Max ₱" />
            </div>
            <div class="col-4 col-md-2 col-lg-1">
              <input v-model="filters.minRating" type="number" class="form-control filter-input" placeholder="Rating" />
            </div>
            <div class="col-12 col-lg-2">
              <button class="btn-clear w-100" @click="clearFilters">Clear</button>
            </div>
          </div>
        </div>
      </transition>

      <div v-if="loading" class="text-center py-5">Loading...</div>
      <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-else-if="!products.length" class="text-center">No products found.</div>

      <div v-else class="catalog-grid-section">
        <div class="catalog-grid">
          <article
            v-for="product in paginatedProducts"
            :key="product._id"
            class="catalog-product-card"
          >
            <div class="catalog-card-image-wrap">
              <img
                v-if="product.imageUrl"
                :src="product.imageUrl"
                :alt="product.name"
                class="catalog-card-image"
              />
            </div>

            <div class="catalog-card-body">
              <p class="catalog-card-description">
                {{ product.description || 'No description available.' }}
              </p>

              <div class="catalog-card-footer">
                <div
                  v-if="formatRating(product) || formatSold(product)"
                  class="catalog-card-meta"
                >
                  <span v-if="formatRating(product)" class="catalog-rating">
                    <i class="bi bi-star-fill catalog-star"></i>
                    {{ formatRating(product) }}
                  </span>
                  <span v-if="formatSold(product)" class="catalog-sold">{{ formatSold(product) }}</span>
                </div>

                <h2 class="catalog-card-title">{{ product.name }}</h2>

                <div class="catalog-card-actions">
                  <span class="catalog-card-price">{{ formatPrice(product.price) }}</span>
                  
                  <div class="d-flex align-items-center gap-2"> 
                    
                    <router-link 
                      :to="`/products/${product._id}`" 
                      class="btn btn-outline-secondary btn-sm"
                    >
                      Details
                    </router-link>

                    <div @click.stop class="cart-action-trigger-zone">
                      <AddToCartButton
                        :productId="product._id"
                        :price="product.price"
                        compact
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>

        <nav
          v-if="totalPages > 1"
          class="catalog-pagination"
          aria-label="Product catalog pagination"
        >
          <button
            class="pagination-btn"
            :disabled="currentPage === 1"
            @click="prevPage"
            aria-label="Previous page"
          >
            <i class="bi bi-chevron-left"></i>
          </button>

          <button
            v-for="page in totalPages"
            :key="page"
            class="pagination-btn pagination-page"
            :class="{ active: page === currentPage }"
            @click="goToPage(page)"
            :aria-label="`Page ${page}`"
            :aria-current="page === currentPage ? 'page' : undefined"
          >
            {{ page }}
          </button>

          <button
            class="pagination-btn"
            :disabled="currentPage === totalPages"
            @click="nextPage"
            aria-label="Next page"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
        </nav>
      </div>

    </div>
  </div>
</template>

<style scoped>

/* 1. Parent container must establish a new positioning context */
.product-catalog-section {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  padding: 4rem 0;
}

/* 2. Background container acts as a bounding box frame */
.section-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0; /* Keeps it behind content layers */
}

/* 3. Forces your video clip to stretch and cover the entire grid context */
.background-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 4. Forces your search filters, titles, and product cards above the video track */
.ps-container {
  position: relative;
  z-index: 1; /* Floats perfectly above z-index: 0 background */
}


/* 3. Typography */
.page-title {
  font-family: "Canva-Sunday", serif;
  color: #3d0300; /* Darkened to match your brand palette */
}

/* 4. Toolbar styling */
.filter-toggle-btn {
  background: #3d0300;
  color: #faf9fc;
  border-radius: 14px;
  padding: 0.8rem 1.4rem;
  border: none;
  transition: all 0.3s ease;
  font-weight: 500;
}
.filter-toggle-btn:hover { background: #ee807b; transform: translateY(-2px); }

.filter-toolbar {
  background: rgba(255, 255, 255, 0.7);
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 5px 15px rgba(0,0,0,0.03);
}

.filter-input { 
  height: 48px; 
  border-radius: 12px; 
  border: 1px solid rgba(0,0,0,0.1); 
}

.btn-clear { 
  background: #3d0300; 
  color: #fff; 
  border: none; 
  height: 48px; 
  border-radius: 12px; 
  transition: background 0.3s ease;
}
.btn-clear:hover { background: #ee807b; }

/* 5. Product grid & cards */
.catalog-grid-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem 1.25rem;
}

.catalog-product-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4.5rem 1.25rem 1.25rem;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.42);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06);
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
  min-height: 100%;
}

.catalog-product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(61, 3, 0, 0.15);
}

.catalog-card-image-wrap {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: -6.5rem;
  margin-bottom: 1rem;
  min-height: 160px;
  pointer-events: none;
  z-index: 1;
}

.catalog-card-image {
  width: 160px;
  height: auto;
  object-fit: contain;
  transform: rotate(20deg);
  filter: drop-shadow(0 16px 24px rgba(0, 0, 0, 0.2));
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.4s ease;
}

.catalog-product-card:hover .catalog-card-image {
  transform: translateY(-12px) rotate(10deg) scale(1.1);
  filter: drop-shadow(0 24px 32px rgba(0, 0, 0, 0.3));
}

.catalog-card-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  gap: 0.85rem;
}

.catalog-card-description {
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  font-style: italic;
  color: #4b5563;
  text-align: center;
  line-height: 1.55;
  margin: 0;
  padding: 0 0.35rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.catalog-card-footer {
  background: rgba(250, 249, 252, 0.92);
  border-radius: 18px;
  padding: 0.85rem 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin-top: auto;
}

.catalog-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.62rem;
  font-weight: 600;
  color: #4b5563;
}

.catalog-rating {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.catalog-star {
  color: #f5c518;
  font-size: 0.7rem;
}

.catalog-sold {
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.catalog-card-title {
  font-family: 'Canva-Sunday', serif;
  font-size: 1.05rem;
  font-weight: 700;
  font-style: italic;
  color: #3d0300;
  text-align: center;
  margin: 0;
  line-height: 1.2;
}

.catalog-card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.catalog-card-price {
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #3d0300;
}

.catalog-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pagination-btn {
  min-width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(61, 3, 0, 0.15);
  background: rgba(255, 255, 255, 0.7);
  color: #3d0300;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #3d0300;
  color: #faf9fc;
  border-color: #3d0300;
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-page.active {
  background: #3d0300;
  color: #faf9fc;
  border-color: #3d0300;
}

@media (max-width: 1199.98px) {
  .catalog-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 575.98px) {
  .catalog-grid {
    grid-template-columns: 1fr;
  }

  .catalog-product-card {
    max-width: 320px;
    margin: 0 auto;
  }
}

/* Transitions */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }
</style>

