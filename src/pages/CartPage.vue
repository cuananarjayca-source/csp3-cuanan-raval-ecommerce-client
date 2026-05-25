<script setup>
import CartItemComponent from "../components/CartItemComponent.vue";
import AddToCartButton from "../components/AddToCartButton.vue";
</script>


<template>
  <div class="container py-5">
    <h2 class="mb-4 fw-bold">My Cart</h2>

    <!-- Cart Items -->
    <div class="row g-4">
      <div class="col-lg-8">
        <CartItemComponent
          v-for="item in cartItems"
          :key="item.productId._id"
          :item="item"
        />
      </div>

      <!-- Order Summary -->
      <div class="col-lg-4">
        <div class="card shadow-sm p-4">
          <h5 class="fw-bold mb-3">Order Summary</h5>

          <div class="d-flex justify-content-between mb-2">
            <span>Subtotal</span>
            <span>₱{{ totalPrice }}</span>
          </div>

          <hr />

          <div class="d-flex justify-content-between fw-bold fs-5 mb-4">
            <span>Total</span>
            <span>₱{{ totalPrice }}</span>
          </div>

          <button class="btn w-100 text-white" style="background-color: var(--theme-primary);">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

