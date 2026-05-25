<script setup>
import { ref } from "vue";
import { addToCart } from "../api.js";

const props = defineProps({
  productId: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  compact: {
    type: Boolean,
    default: false
  }
});

const quantity = ref(1);
const isLoading = ref(false);
const message = ref("");
const isError = ref(false);

const increment = () => {
  quantity.value++;
};

const decrement = () => {
  if (quantity.value <= 1) return;
  quantity.value--;
};

const handleAddToCart = async () => {
  isLoading.value = true;
  message.value = "";
  isError.value = false;

  try {
    await addToCart(props.productId, quantity.value);
    message.value = "Item added to cart successfully!";
    isError.value = false;
    quantity.value = 1;
  } catch (err) {
    message.value = err?.response?.data?.message ?? "Failed to add item to cart.";
    isError.value = true;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="d-flex flex-column gap-2" :class="{ 'add-to-cart-compact': compact }">

    <!-- Quantity Stepper -->
    <div v-if="!compact" class="d-flex align-items-center gap-2">
      <button
        class="btn btn-outline-secondary btn-sm"
        :disabled="quantity <= 1 || isLoading"
        @click="decrement"
      >
        <i class="bi bi-dash"></i>
      </button>
      <span class="fw-bold fs-5">{{ quantity }}</span>
      <button
        class="btn btn-outline-secondary btn-sm"
        :disabled="isLoading"
        @click="increment"
      >
        <i class="bi bi-plus"></i>
      </button>
    </div>

    <!-- Add to Cart Button -->
    <button
      class="btn text-white"
      :class="compact ? 'catalog-add-btn' : 'w-100'"
      :style="compact ? undefined : { backgroundColor: '#3d0300' }"
      :disabled="isLoading"
      @click="handleAddToCart"
    >
      <i v-if="!compact" class="bi bi-cart-plus me-2"></i>
      {{ isLoading ? "Adding..." : "Add to Cart" }}
    </button>

    <!-- Feedback Message -->
    <p
      v-if="message"
      class="small mb-0"
      :class="[
        isError ? 'text-danger' : 'text-success',
        { 'catalog-add-msg': compact },
      ]"
    >
      {{ message }}
    </p>

  </div>
</template>

<style scoped>
.add-to-cart-compact {
  gap: 0.25rem !important;
}

.catalog-add-btn {
  background: #3d0300;
  border: none;
  border-radius: 10px;
  padding: 0.45rem 0.75rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.2s ease, transform 0.2s ease;
}

.catalog-add-btn:hover:not(:disabled) {
  background: #5a1814;
  transform: translateY(-1px);
}

.catalog-add-msg {
  font-size: 0.62rem;
  line-height: 1.2;
}
</style>

