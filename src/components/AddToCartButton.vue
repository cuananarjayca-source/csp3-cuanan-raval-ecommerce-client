<template>
  <div class="d-flex flex-column gap-2">

    <!-- Quantity Stepper -->
    <div class="d-flex align-items-center gap-2">
      <button class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-dash"></i>
      </button>
      <span class="fw-bold fs-5">{{ quantity }}</span>
      <button class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-plus"></i>
      </button>
    </div>

    <!-- Add to Cart Button -->
    <button
      class="btn text-white w-100"
      style="background-color: var(--theme-primary);"
    >
      <i class="bi bi-cart-plus me-2"></i>
      Add to Cart
    </button>

    <!-- Feedback Message -->
    <p v-if="message" :class="isError ? 'text-danger' : 'text-success'" class="small mb-0">
      {{ message }}
    </p>

  </div>
</template>

<script setup>
defineProps({
  productId: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
});
</script>