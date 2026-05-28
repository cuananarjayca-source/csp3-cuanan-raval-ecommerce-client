<script setup>
import { ref, computed, onMounted } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { getCart, removeFromCart, clearCart } from "../api.js";
import CartItemComponent from "../components/CartItemComponent.vue";
import AddToCartButton from "../components/AddToCartButton.vue";

const router = useRouter();

const cart = ref(null);
const isLoading = ref(false);
const isInitialLoading = ref(false);

const cartItems = computed(() => cart.value?.cartItems ?? []);
const totalPrice = computed(() => cart.value?.totalPrice ?? 0);

const fetchCart = async (showSpinner = false) => {
  if (showSpinner) isInitialLoading.value = true;
  try {
    cart.value = await getCart();
  } catch (err) {
    console.error("Failed to fetch cart:", err);
  } finally {
    isInitialLoading.value = false;
  }
};

const handleRemove = async (productId) => {
  try {
    await removeFromCart(productId);
    await fetchCart();
  } catch (err) {
    console.error("Failed to remove item:", err);
  }
};

const handleClearCart = async () => {
  try {
    await clearCart();
    await fetchCart();
  } catch (err) {
    console.error("Failed to clear cart:", err);
  }
};

const handleCheckout = () => {
  router.push("/checkout");
};

onMounted(() => {
  fetchCart(true);
});
</script>

<template>
  <div class="container py-5">
    <h2 class="title-primary mb-4 py-5 fw-bold">My Cart</h2>

    <!-- Loading State -->
    <div v-if="isInitialLoading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Empty Cart -->
    <div v-else-if="!isLoading && cartItems.length === 0" class="text-center py-5">
      <i class="bi bi-cart-x fs-1 text-muted"></i>
      <p class="text-muted mt-3">Your cart is empty.</p>
      <RouterLink to="/products" class="btn text-white" style="background-color: var(--theme-primary);">
        Browse Products
      </RouterLink>
    </div>

    <!-- Cart Items + Summary -->
    <div v-else class="row g-4">
      <!-- Cart Items -->
      <div class="col-lg-8">
        <CartItemComponent
          v-for="item in cartItems"
          :key="item.productId._id"
          :item="item"
          @updated="fetchCart"
          @remove="handleRemove"
        />
      </div>

      <!-- Order Summary -->
      <div class="col-lg-4">
        <div class="card shadow-sm p-4">
          <h5 class="fw-bold mb-3">Order Summary</h5>
          <div class="d-flex justify-content-between mb-2">
            <span>Items ({{ cartItems.length }})</span>
            <span>₱{{ totalPrice.toLocaleString() }}</span>
          </div>
          <hr />
          <div class="d-flex justify-content-between fw-bold fs-5 mb-4">
            <span>Total</span>
            <span>₱{{ totalPrice.toLocaleString() }}</span>
          </div>
          <button
            class="btn btn-outline-danger w-100 mb-2"
            @click="handleClearCart"
          >
            <i class="bi bi-trash me-2"></i>
            Clear Cart
          </button>
          <button
            class="btn w-100 text-white"
            style="background-color: #0d6efd;"
            @click="handleCheckout"
          >
            <i class="bi bi-arrow-right me-2"></i>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.title-primary {
  font-family: "Canva-Sunday", serif;
  font-size: 2.5rem;
  color: #1a1a1a;
}
</style>