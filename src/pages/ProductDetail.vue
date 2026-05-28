<script setup>
import { onMounted, ref, watch, computed } from "vue";
import { RouterLink } from "vue-router";
import { getProductById, getErrorMessage, getReviewsByProduct, createReview, editReview, deleteReview, checkStock } from "../api.js";
import AddToCartButton from "../components/AddToCartButton.vue";
import ReviewForm from "../components/ReviewForm.vue";

const props = defineProps({
  id: { type: String, required: true },
});

const product = ref(null);
const loading = ref(true);
const error = ref(null);
const stockQuantity = ref(null);
const stockLoading = ref(false);

const reviews = ref([]);
const reviewsLoading = ref(false);
const isSubmitting = ref(false);
const editingReviewId = ref(null);
const showForm = ref(false);

const isLoggedIn = computed(() => !!localStorage.getItem("token"));

const myReview = computed(() =>
  reviews.value.find((r) => r.userId?._id === getCurrentUserId())
);

function getCurrentUserId() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id;
  } catch {
    return null;
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(price);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric", month: "short", day: "numeric",
  });
}

// ── Single load() — removed the duplicate ──
async function load() {
  loading.value = true;
  error.value = null;
  try {
    product.value = await getProductById(props.id);
    await Promise.all([loadReviews(), loadStock()]);
  } catch (e) {
    product.value = null;
    error.value = getErrorMessage(e, "Product not found.");
  } finally {
    loading.value = false;
  }
}

async function loadStock() {
  stockLoading.value = true;
  try {
    const data = await checkStock(props.id);
    stockQuantity.value = data.quantity ?? 0;
  } catch {
    stockQuantity.value = 0;
  } finally {
    stockLoading.value = false;
  }
}

async function loadReviews() {
  reviewsLoading.value = true;
  try {
    const data = await getReviewsByProduct(props.id);
    reviews.value = data.reviews ?? []; // unwrap the array
  } catch (e) {
    if (e?.response?.status === 404) {
      reviews.value = [];
    }
  } finally {
    reviewsLoading.value = false;
  }
}

async function handleCreateReview({ rating, comment }) {
  isSubmitting.value = true;
  try {
    await createReview({ productId: props.id, rating, comment }); // pass as object
    showForm.value = false;
    await loadReviews();
  } catch (e) {
    alert(getErrorMessage(e, "Failed to submit review."));
  } finally {
    isSubmitting.value = false;
  }
}

async function handleEditReview({ rating, comment }) {
  isSubmitting.value = true;
  try {
    await editReview(editingReviewId.value, { rating, comment }); // pass as object
    editingReviewId.value = null;
    await loadReviews();
  } catch (e) {
    alert(getErrorMessage(e, "Failed to update review."));
  } finally {
    isSubmitting.value = false;
  }
}

async function handleDeleteReview(reviewId) {
  if (!confirm("Delete your review?")) return;
  try {
    await deleteReview(reviewId);
    await loadReviews();
  } catch (e) {
    alert(getErrorMessage(e, "Failed to delete review."));
  }
}

onMounted(load);
watch(() => props.id, load);
</script>

<template>
  <div class="container py-5 product-page">
    
    <div class="mb-4 py-5">
      <RouterLink to="/products" class="btn btn-link p-0 text-decoration-none back-btn">
        <i class="bi bi-arrow-left me-2 fs-5"></i> Back to catalog
      </RouterLink>
    </div>

    <div v-if="loading" class="text-center py-5 my-5">
      <div class="spinner-border theme-spinner" role="status"></div>
    </div>
    <div v-else-if="error" class="alert alert-warning border-0 shadow-sm rounded-4">{{ error }}</div>

    <div v-else-if="product" class="row g-5 align-items-center mb-5">
      
      <div class="col-lg-6 mb-4 mb-lg-0" v-if="product.imageUrl">
        <div class="product-image-wrap shadow-sm">
          <img :src="product.imageUrl" :alt="product.name" class="img-fluid product-image" />
        </div>
      </div>
      
      <div class="col-lg-6">
        <div class="product-details-content">
          <span class="category-tag">{{ product.category }}</span>
          <h1 class="product-title mt-2 mb-3">{{ product.name }}</h1>
          <p class="product-price mb-4">{{ formatPrice(product.price) }}</p>
          
          <p class="product-description text-muted mb-4">{{ product.description }}</p>
          
          <div class="product-meta-specs d-flex flex-wrap gap-3 mb-5">
            <div class="spec-badge">
              <i class="bi bi-box-seam me-2 text-muted"></i>
              Stock: <span class="fw-semibold ms-1">{{ stockQuantity ?? 0 }}</span>
            </div>
            
            <div v-if="product.avgRating" class="spec-badge">
              <span class="text-warning me-1">★</span>
              <span class="fw-semibold">{{ product.avgRating }}</span>
              <span class="text-muted ms-1">({{ product.totalReviews }} reviews)</span>
            </div>
            
            <div v-if="product.featured" class="spec-badge featured-badge">
              <i class="bi bi-star-fill me-1"></i> Featured
            </div>
          </div>
          
          <div class="action-wrapper">
            <AddToCartButton :productId="product._id" :price="product.price" :stock="stockQuantity" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="product" class="reviews-section mt-5 pt-5">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <h4 class="fw-bold mb-0 d-flex align-items-center">
          Customer Reviews
          <span class="badge rounded-pill ms-3 review-count-badge">{{ reviews.length }}</span>
        </h4>

        <button
          v-if="isLoggedIn && !myReview && !showForm"
          class="btn write-review-btn rounded-pill px-4"
          @click="showForm = true"
        >
          <i class="bi bi-pencil-square me-2"></i> Write a Review
        </button>
      </div>

      <transition name="fade">
        <div v-if="isLoggedIn && showForm && !myReview" class="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <ReviewForm
            :productId="props.id"
            :isSubmitting="isSubmitting"
            @submit="handleCreateReview"
            @cancel="showForm = false"
          />
        </div>
      </transition>

      <div v-if="!isLoggedIn" class="info-note rounded-4 px-4 py-3 mb-4 d-flex align-items-center gap-3">
        <i class="bi bi-info-circle-fill fs-5 theme-text"></i>
        <p class="mb-0 text-muted small">
          Please <RouterLink to="/login" class="fw-semibold text-decoration-none theme-text">Log in</RouterLink> to leave a review for this product.
        </p>
      </div>

      <div v-if="reviewsLoading" class="text-center py-5">
        <div class="spinner-border spinner-border-sm theme-spinner" role="status"></div>
      </div>

      <div v-else-if="reviews.length === 0" class="text-center py-5 text-muted empty-state-box rounded-4">
        <i class="bi bi-chat-left-heart fs-1 d-block mb-3 opacity-50"></i>
        <h5 class="fw-semibold">No reviews yet</h5>
        <p class="small mb-0">Be the first to share your thoughts on this product!</p>
      </div>

      <div v-else class="row g-4">
        <div
          v-for="review in reviews"
          :key="review._id"
          class="col-12 col-md-6"
        >
          <div class="review-card card border-0 shadow-sm rounded-4 p-4 h-100">
            <div v-if="editingReviewId === review._id">
              <ReviewForm
                :productId="props.id"
                :existingReview="review"
                :isSubmitting="isSubmitting"
                @submit="handleEditReview"
                @cancel="editingReviewId = null"
              />
            </div>

            <div v-else class="d-flex flex-column h-100">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <div class="stars mb-1">
                    <span
                      v-for="n in 5"
                      :key="n"
                      class="star-display"
                      :class="{ filled: n <= review.rating }"
                    >★</span>
                  </div>
                  <h6 class="mb-0 fw-bold text-dark">
                    {{ review.userId?.firstName ?? "Anonymous" }} {{ review.userId?.lastName ?? "" }}
                  </h6>
                  <small class="text-muted" style="font-size: 0.75rem;">{{ formatDate(review.createdAt) }}</small>
                </div>

                <div v-if="review.userId?._id === getCurrentUserId()" class="d-flex gap-2">
                  <button class="btn btn-sm btn-light rounded-circle action-icon-btn" @click="editingReviewId = review._id" aria-label="Edit Review">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-light rounded-circle action-icon-btn text-danger" @click="handleDeleteReview(review._id)" aria-label="Delete Review">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>

              <p v-if="review.comment" class="review-comment text-secondary mb-0 flex-grow-1">
                "{{ review.comment }}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── BASE TYPOGRAPHY & COLORS ── */
.product-page {
  color: #2c2416;
}

.theme-text {
  color: var(--theme-primary, #4B2C6D);
}

.theme-spinner {
  color: var(--theme-primary, #4B2C6D);
}

.back-btn {
  color: #6b7280;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
}

.back-btn:hover {
  color: var(--theme-primary, #4B2C6D);
}

/* ── PRODUCT IMAGES ── */
.product-image-wrap {
  background-color: #fbf9f6; /* Warm, clean background standard */
  border-radius: 28px;
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.product-image {
  max-height: 450px;
  object-fit: contain;
  filter: drop-shadow(0px 20px 40px rgba(0, 0, 0, 0.08));
  transition: transform 0.4s ease;
}

.product-image-wrap:hover .product-image {
  transform: scale(1.03);
}

/* ── PRODUCT DETAILS CONTENT ── */
.category-tag {
  font-family: 'League Spartan', sans-serif;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #8c8275;
  background-color: #f4f0ea;
  padding: 6px 14px;
  border-radius: 20px;
  display: inline-block;
}

.product-title {
  font-family: 'Sunday', 'Canva-Sunday', serif;
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  line-height: 1.1;
  color: #2c2416;
}

.product-price {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 1.75rem;
  color: var(--theme-primary, #4B2C6D);
}

.product-description {
  font-size: 1rem;
  line-height: 1.7;
}

/* Specs/Metadata badges */
.spec-badge {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
}

.featured-badge {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.2);
  color: #d97706;
}

/* ── REVIEWS SECTION ── */
.reviews-section {
  border-top: 1px solid #eae5df;
}

.review-count-badge {
  background-color: rgba(75, 44, 109, 0.1);
  color: var(--theme-primary, #4B2C6D);
  font-size: 0.9rem;
}

.write-review-btn {
  background-color: var(--theme-primary, #4B2C6D);
  color: white;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.write-review-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(75, 44, 109, 0.2);
  color: white;
}

.info-note {
  background: #fbf9f6;
  border: 1px solid #eae5df;
}

.empty-state-box {
  background-color: #fbf9f6;
  border: 1px dashed #d1d5db;
}

/* Review Cards */
.review-card {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  background-color: #ffffff;
}

.review-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.04) !important;
}

.star-display {
  font-size: 1rem;
  color: #e5e7eb;
}

.star-display.filled {
  color: #f59e0b;
}

.review-comment {
  font-size: 0.95rem;
  line-height: 1.6;
  font-style: italic;
}

.action-icon-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>