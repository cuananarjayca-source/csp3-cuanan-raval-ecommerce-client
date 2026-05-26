<script setup>
import { onMounted, ref, watch, computed } from "vue";
import { RouterLink } from "vue-router";
import { getProductById, getErrorMessage, getReviewsByProduct, createReview, editReview, deleteReview } from "../api.js";
import AddToCartButton from "../components/AddToCartButton.vue";
import ReviewForm from "../components/ReviewForm.vue";

const props = defineProps({
  id: { type: String, required: true },
});

const product = ref(null);
const loading = ref(true);
const error = ref(null);

// Reviews state
const reviews = ref([]);
const reviewsLoading = ref(false);
const isSubmitting = ref(false);
const editingReviewId = ref(null); // which review is being edited
const showForm = ref(false);

// Check if logged in
const isLoggedIn = computed(() => !!localStorage.getItem("token"));

// Find current user's existing review
const myReview = computed(() =>
  reviews.value.find((r) => r.userId?._id === getCurrentUserId())
);

// Decode user id from JWT token
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

async function load() {
  loading.value = true;
  error.value = null;
  try {
    product.value = await getProductById(props.id);
    await loadReviews();
  } catch (e) {
    product.value = null;
    error.value = getErrorMessage(e, "Product not found.");
  } finally {
    loading.value = false;
  }
}

async function loadReviews() {
  reviewsLoading.value = true;
  try {
    reviews.value = await getReviewsByProduct(props.id);
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
    await createReview(props.id, rating, comment);
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
    await editReview(editingReviewId.value, rating, comment);
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
  <div class="container py-4">
    <RouterLink to="/products" class="btn btn-link">&larr; Back to catalog</RouterLink>

    <!-- Loading / Error -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    <div v-else-if="error" class="alert alert-warning">{{ error }}</div>

    <!-- Product Info -->
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
          <li v-if="product.avgRating">
            Rating: {{ product.avgRating }}
            <span class="text-warning">★</span>
            <span class="text-muted">({{ product.totalReviews }})</span>
          </li>
          <li v-if="product.featured">Featured product</li>
        </ul>
        <AddToCartButton :productId="product._id" :price="product.price" />
      </div>
    </div>

    <!-- ——— Reviews Section ——— -->
    <div v-if="product" class="reviews-section mt-5">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h4 class="fw-bold mb-0">
          Customer Reviews
          <span class="text-muted fw-normal fs-6 ms-2">({{ reviews.length }})</span>
        </h4>

        <!-- Write review button: logged in, no existing review, form not open -->
        <button
          v-if="isLoggedIn && !myReview && !showForm"
          class="btn btn-sm text-white"
          style="background-color: var(--theme-primary)"
          @click="showForm = true"
        >
          <i class="bi bi-pencil me-1"></i> Write a Review
        </button>
      </div>

      <!-- Write Review Form -->
      <div v-if="isLoggedIn && showForm && !myReview" class="card border-0 shadow-sm rounded-4 p-4 mb-4">
        <ReviewForm
          :productId="props.id"
          :isSubmitting="isSubmitting"
          @submit="handleCreateReview"
          @cancel="showForm = false"
        />
      </div>

      <!-- Not logged in prompt -->
      <div v-if="!isLoggedIn" class="info-note rounded-3 px-4 py-3 mb-4 d-flex align-items-center gap-2">
        <i class="bi bi-info-circle" style="color: var(--theme-primary)"></i>
        <small>
          <RouterLink to="/login" class="fw-semibold" style="color: var(--theme-primary)">Log in</RouterLink>
          to leave a review.
        </small>
      </div>

      <!-- Reviews Loading -->
      <div v-if="reviewsLoading" class="text-center py-3">
        <div class="spinner-border spinner-border-sm" style="color: var(--theme-primary)"></div>
      </div>

      <!-- Empty Reviews -->
      <div v-else-if="reviews.length === 0" class="text-center py-4 text-muted">
        <i class="bi bi-chat-square-text fs-2 d-block mb-2"></i>
        No reviews yet. Be the first to review this product!
      </div>

      <!-- Review List -->
      <div v-else class="d-flex flex-column gap-3">
        <div
          v-for="review in reviews"
          :key="review._id"
          class="review-card card border-0 shadow-sm rounded-4 p-4"
        >
          <!-- Edit mode -->
          <div v-if="editingReviewId === review._id">
            <ReviewForm
              :productId="props.id"
              :existingReview="review"
              :isSubmitting="isSubmitting"
              @submit="handleEditReview"
              @cancel="editingReviewId = null"
            />
          </div>

          <!-- Display mode -->
          <div v-else>
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="stars mb-1">
                  <span
                    v-for="n in 5"
                    :key="n"
                    class="star-display"
                    :class="{ filled: n <= review.rating }"
                  >★</span>
                  <span class="ms-1 text-muted" style="font-size: 0.8rem">{{ review.rating }}/5</span>
                </div>
                <p class="mb-1 fw-semibold" style="font-size: 0.9rem">
                  {{ review.userId?.firstName ?? "Anonymous" }} {{ review.userId?.lastName ?? "" }}
                </p>
                <p class="mb-0 text-muted" style="font-size: 0.78rem">{{ formatDate(review.createdAt) }}</p>
              </div>

              <!-- Edit/Delete: only for own review -->
              <div v-if="review.userId?._id === getCurrentUserId()" class="d-flex gap-2">
                <button
                  class="btn btn-sm btn-outline-secondary rounded-3"
                  @click="editingReviewId = review._id"
                >
                  <i class="bi bi-pencil"></i>
                </button>
                <button
                  class="btn btn-sm btn-outline-danger rounded-3"
                  @click="handleDeleteReview(review._id)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>

            <p v-if="review.comment" class="mt-3 mb-0" style="font-size: 0.9rem">
              {{ review.comment }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reviews-section {
  border-top: 2px solid #f0ebf8;
  padding-top: 2rem;
}

.info-note {
  background: #f0ebf8;
  border-left: 3px solid var(--theme-primary);
}

.review-card {
  transition: box-shadow 0.15s;
}

.review-card:hover {
  box-shadow: 0 4px 16px rgba(75, 44, 109, 0.1) !important;
}

.star-display {
  font-size: 1.1rem;
  color: #d1d5db;
}

.star-display.filled {
  color: #f59e0b;
}
</style>