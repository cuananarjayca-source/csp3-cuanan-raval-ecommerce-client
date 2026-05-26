<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getCart, checkoutOrder, createPayment } from "../api.js";
import { Notyf } from "notyf";

const notyf = new Notyf({ duration: 3000, position: { x: "right", y: "top" } });
const router = useRouter();

const cart = ref(null);
const isLoading = ref(true);
const isPlacingOrder = ref(false);
const step = ref("review"); // "review" | "payment"
const selectedMethod = ref(null);

const paymentMethods = [
  { value: "credit_card",      label: "Credit Card",      icon: "bi-credit-card" },
  { value: "debit_card",       label: "Debit Card",       icon: "bi-credit-card-2-front" },
  { value: "gcash",            label: "GCash",            icon: "bi-phone" },
  { value: "paypal",           label: "PayPal",           icon: "bi-paypal" },
  { value: "cash_on_delivery", label: "Cash on Delivery", icon: "bi-cash-coin" },
];

const cartItems = computed(() => cart.value?.cartItems ?? []);
const totalPrice = computed(() => cart.value?.totalPrice ?? 0);
const itemCount = computed(() =>
  cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
);

const fetchCart = async () => {
  try {
    cart.value = await getCart();
    if (!cart.value || cart.value.cartItems.length === 0) {
      notyf.error("Your cart is empty.");
      router.push("/cart");
    }
  } catch (err) {
    notyf.error("Failed to load cart.");
    router.push("/cart");
  } finally {
    isLoading.value = false;
  }
};

const handlePlaceOrder = async () => {
  if (!selectedMethod.value) {
    notyf.error("Please select a payment method.");
    return;
  }

  isPlacingOrder.value = true;
  try {
    // Step 1: create the order (auto-confirmed on backend)
    const orderResult = await checkoutOrder();
    const orderId = orderResult.order._id;

    // Step 2: immediately pay
    try {
      const paymentResult = await createPayment(orderId, selectedMethod.value, cart.value.totalPrice);
      notyf.success("Order placed and payment submitted!");
      router.push(`/orders/${orderId}`);
    } catch (payErr) {
      // Order succeeded but payment failed — send to PaymentPage as fallback
      notyf.error("Order placed, but payment failed. Please retry payment.");
      router.push(`/payment/${orderId}`);
    }
  } catch (err) {
    const msg = err?.response?.data?.message ?? "Failed to place order.";
    notyf.error(msg);
  } finally {
    isPlacingOrder.value = false;
  }
};

onMounted(fetchCart);
</script>

<template>
  <div class="container py-5">
    <!-- Header -->
    <div class="d-flex align-items-center gap-3 mb-4">
      <button class="btn btn-link p-0 text-decoration-none back-btn" @click="router.push('/cart')">
        <i class="bi bi-arrow-left fs-5"></i>
      </button>
      <h2 class="page-title mb-0">Order Review</h2>
    </div>

    <!-- Progress Breadcrumb -->
    <div class="checkout-steps mb-5">
      <div class="step completed">
        <div class="step-dot"><i class="bi bi-check"></i></div>
        <span>Cart</span>
      </div>
      <div class="step-line completed"></div>
      <div class="step" :class="step === 'review' ? 'active' : 'completed'">
        <div class="step-dot">
          <i v-if="step !== 'review'" class="bi bi-check"></i>
          <span v-else>2</span>
        </div>
        <span>Review</span>
      </div>
      <div class="step-line" :class="{ completed: step === 'payment' }"></div>
      <div class="step" :class="{ active: step === 'payment' }">
        <div class="step-dot">3</div>
        <span>Payment</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border" role="status" style="color: var(--theme-primary)">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Content -->
    <div v-else class="row g-4">
      <!-- Items List -->
      <div class="col-lg-8">
        <div class="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div class="card-header-custom px-4 py-3">
            <h6 class="mb-0 fw-semibold">
              <i class="bi bi-bag me-2"></i>
              Items to Order ({{ cartItems.length }} product{{ cartItems.length !== 1 ? "s" : "" }}, {{ itemCount }} unit{{ itemCount !== 1 ? "s" : "" }})
            </h6>
          </div>
          <div class="card-body p-0">
            <div
              v-for="(item, index) in cartItems"
              :key="item.productId._id"
              class="checkout-item px-4 py-3"
              :class="{ 'border-top': index > 0 }"
            >
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-3">
                  <div class="product-icon-wrap">
                    <i class="bi bi-box-seam"></i>
                  </div>
                  <div>
                    <p class="mb-0 fw-semibold product-name">{{ item.productId.name }}</p>
                    <small class="text-muted">
                      ₱{{ item.productId.price.toLocaleString() }} × {{ item.quantity }}
                    </small>
                  </div>
                </div>
                <span class="fw-bold subtotal">₱{{ item.subtotal.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Note -->
        <!-- Note (review step only) -->
        <div v-if="step === 'review'" class="info-note mt-3 px-3 py-2 rounded-3 d-flex align-items-start gap-2">
          <i class="bi bi-info-circle-fill mt-1" style="color: var(--theme-primary)"></i>
          <small class="text-muted">
            Review your items, then proceed to select a payment method and place your order.
          </small>
        </div>

        <!-- Payment Method (payment step only) -->
        <div v-if="step === 'payment'" class="card border-0 shadow-sm rounded-4 p-4 mt-3">
          <h6 class="fw-semibold mb-3"><i class="bi bi-credit-card me-2"></i>Choose Payment Method</h6>
          <div class="method-grid">
            <div
              v-for="method in paymentMethods"
              :key="method.value"
              class="method-card"
              :class="{ selected: selectedMethod === method.value }"
              @click="selectedMethod = method.value"
            >
              <i class="bi fs-4 mb-1" :class="method.icon"></i>
              <span class="method-label">{{ method.label }}</span>
            </div>
          </div>
        </div>
        </div>  <!-- closes payment method card -->

      </div>  <!-- closes col-lg-8 -->

      <!-- Summary -->
      <div class="col-lg-4">

      <!-- Summary -->
      <div class="col-lg-4">
        <div class="card shadow-sm border-0 rounded-4 sticky-top" style="top: 1.5rem">
          <div class="card-body p-4">
            <h5 class="fw-bold mb-4">Order Summary</h5>

            <div class="summary-row d-flex justify-content-between mb-2">
              <span class="text-muted">Subtotal</span>
              <span>₱{{ totalPrice.toLocaleString() }}</span>
            </div>
            <div class="summary-row d-flex justify-content-between mb-2">
              <span class="text-muted">Shipping</span>
              <span class="text-success fw-semibold">Free</span>
            </div>

            <hr class="my-3" />

            <div class="d-flex justify-content-between fw-bold fs-5 mb-4">
              <span>Total</span>
              <span style="color: var(--theme-primary)">₱{{ totalPrice.toLocaleString() }}</span>
            </div>

            <!-- Review step: continue to payment -->
            <button
              v-if="step === 'review'"
              class="btn w-100 text-white fw-semibold py-2 rounded-3 place-order-btn"
              @click="step = 'payment'"
            >
              <i class="bi bi-arrow-right me-2"></i>Continue to Payment
            </button>

            <!-- Payment step: place order & pay -->
            <button
              v-else
              class="btn w-100 text-white fw-semibold py-2 rounded-3 place-order-btn"
              :disabled="isPlacingOrder || !selectedMethod"
              @click="handlePlaceOrder"
            >
              <span v-if="isPlacingOrder">
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Processing...
              </span>
              <span v-else>
                <i class="bi bi-lock me-2"></i>Place Order & Pay
              </span>
            </button>

            <button
              class="btn w-100 btn-outline-secondary mt-2 rounded-3 back-btn-secondary"
              :disabled="isPlacingOrder"
              @click="step === 'payment' ? step = 'review' : router.push('/cart')"
            >
              <i class="bi bi-arrow-left me-2"></i>
              {{ step === 'payment' ? 'Back to Review' : 'Back to Cart' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  font-family: "Canva-Sunday", serif;
  font-size: 2rem;
  color: #1a1a1a;
}

.back-btn {
  color: var(--theme-primary);
}

/* Steps */
.checkout-steps {
  display: flex;
  align-items: center;
  gap: 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #aaa;
  min-width: 60px;
}

.step.active {
  color: var(--theme-primary);
  font-weight: 600;
}

.step.completed {
  color: #28a745;
}

.step-dot {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  background: white;
  color: #aaa;
}

.step.active .step-dot {
  border-color: var(--theme-primary);
  background: var(--theme-primary);
  color: white;
}

.step.completed .step-dot {
  border-color: #28a745;
  background: #28a745;
  color: white;
}

.step-line {
  flex: 1;
  height: 2px;
  background: #ddd;
  margin-bottom: 18px;
}

.step-line.completed {
  background: #28a745;
}

/* Card */
.card-header-custom {
  background: #f8f5fc;
  border-bottom: 1px solid #e8dff5;
}

.checkout-item {
  transition: background 0.15s;
}

.checkout-item:hover {
  background: #faf8fd;
}

.product-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #ede7f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--theme-primary);
  font-size: 1.1rem;
  flex-shrink: 0;
}

.product-name {
  font-size: 0.95rem;
}

.subtotal {
  color: var(--theme-primary);
}

.info-note {
  background: #f0ebf8;
  border-left: 3px solid var(--theme-primary);
}

.place-order-btn {
  background-color: var(--theme-primary);
  transition: opacity 0.2s;
}

.place-order-btn:hover:not(:disabled) {
  opacity: 0.88;
}

.place-order-btn:disabled {
  background-color: var(--theme-primary);
  opacity: 0.65;
}

.method-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.method-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 14px 8px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  color: #555;
}

.method-card:hover {
  border-color: var(--theme-secondary);
  background: #faf8fd;
}

.method-card.selected {
  border-color: var(--theme-primary);
  background: #f0ebf8;
  color: var(--theme-primary);
}

.method-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
}

/* Fix 1: ensure place order button text is always visible */
.place-order-btn {
  background-color: #4B2C6D !important;
  color: #ffffff !important;
}

/* Fix 2: ensure back button text is always visible */
.back-btn-secondary {
  color: #333 !important;
  border-color: #aaa !important;
}
</style>