<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  productId: { type: String, required: true },
  existingReview: { type: Object, default: null }, // pass for edit mode
  isSubmitting: { type: Boolean, default: false },
});

const emit = defineEmits(["submit", "cancel"]);

const rating = ref(props.existingReview?.rating ?? 0);
const comment = ref(props.existingReview?.comment ?? "");
const hovered = ref(0);

// Sync if existingReview changes (e.g. edit mode opens)
watch(() => props.existingReview, (val) => {
  rating.value = val?.rating ?? 0;
  comment.value = val?.comment ?? "";
});

const isEditMode = !!props.existingReview;

const handleSubmit = () => {
  if (rating.value === 0) return;
  emit("submit", { rating: rating.value, comment: comment.value });
};
</script>

<template>
  <div class="review-form">
    <p class="fw-semibold mb-2">{{ isEditMode ? "Edit Your Review" : "Write a Review" }}</p>

    <!-- Star selector -->
    <div class="star-selector mb-3">
      <span
        v-for="n in 5"
        :key="n"
        class="star"
        :class="{ filled: n <= (hovered || rating) }"
        @mouseover="hovered = n"
        @mouseleave="hovered = 0"
        @click="rating = n"
      >★</span>
      <small class="ms-2 text-muted">{{ rating > 0 ? `${rating} / 5` : "Select a rating" }}</small>
    </div>

    <!-- Comment -->
    <textarea
      v-model="comment"
      class="form-control mb-3"
      rows="3"
      placeholder="Share your thoughts about this product (optional)"
    ></textarea>

    <div class="d-flex gap-2">
      <button
        class="btn btn-sm text-white fw-semibold px-4"
        style="background-color: blue"
        :disabled="rating === 0 || isSubmitting"
        @click="handleSubmit"
      >
        <span v-if="isSubmitting">
          <span class="spinner-border spinner-border-sm me-1"></span>
          Saving...
        </span>
        <span v-else>{{ isEditMode ? "Save Changes" : "Submit Review" }}</span>
      </button>
      <button
        v-if="isEditMode"
        class="btn btn-sm btn-outline-secondary"
        :disabled="isSubmitting"
        @click="emit('cancel')"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<style scoped>
.star-selector {
  display: flex;
  align-items: center;
}

.star {
  font-size: 1.8rem;
  color: #d1d5db;
  cursor: pointer;
  transition: color 0.1s;
  line-height: 1;
}

.star.filled {
  color: #f59e0b;
}
</style>