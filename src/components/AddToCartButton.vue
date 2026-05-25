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
  <div class="d-flex flex-column gap-2">

    <!-- Quantity Stepper -->
    <div class="d-flex align-items-center gap-2">
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
      class="btn text-white w-100"
      style="background-color: #3d0300;"
      :disabled="isLoading"
      @click="handleAddToCart"
    >
      <i class="bi bi-cart-plus me-2"></i>
      {{ isLoading ? "Adding..." : "Add to Cart" }}
    </button>

    <!-- Feedback Message -->
    <p v-if="message" :class="isError ? 'text-danger' : 'text-success'" class="small mb-0">
      {{ message }}
    </p>

  </div>
</template>

