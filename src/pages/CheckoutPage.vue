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
  <div class="container py-5 checkout-page">
    
    <div class="d-flex align-items-center gap-3 mb-4 mt-2">
      <button class="btn btn-link p-0 text-decoration-none back-btn" @click="router.push('/cart')">
        <i class="bi bi-arrow-left fs-4"></i>
      </button>
      <h2 class="page-title mb-0">Order Review</h2>
    </div>

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

    <div v-if="isLoading" class="text-center py-5 my-5">
      <div class="spinner-border theme-spinner" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else class="row g-4 lg-g-5">
      
      <div class="col-lg-8">
        
        <div class="card shadow-sm border-0 rounded-4 overflow-hidden mb-4">
          <div class="card-header-custom px-4 py-3">
            <h6 class="mb-0 fw-semibold d-flex align-items-center">
              <i class="bi bi-bag me-2 fs-5"></i>
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
                    <p class="mb-1 fw-semibold product-name lh-sm">{{ item.productId.name }}</p>
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

        <div v-if="step === 'review'" class="info-note px-4 py-3 rounded-4 d-flex align-items-start gap-3">
          <i class="bi bi-info-circle-fill fs-5 mt-1 theme-text"></i>
          <p class="text-muted mb-0 small lh-base">
            Review your items carefully. Once confirmed, proceed to select your payment method to finalize and place your order.
          </p>
        </div>

        <div v-if="step === 'payment'" class="card border-0 shadow-sm rounded-4 p-4">
          <h6 class="fw-semibold mb-4 d-flex align-items-center">
            <i class="bi bi-credit-card me-2 fs-5"></i>Choose Payment Method
          </h6>
          <div class="method-grid">
            <div
              v-for="method in paymentMethods"
              :key="method.value"
              class="method-card"
              :class="{ selected: selectedMethod === method.value }"
              @click="selectedMethod = method.value"
            >
              <i class="bi fs-3 mb-2" :class="method.icon"></i>
              <span class="method-label">{{ method.label }}</span>
            </div>
          </div>
        </div>
        
      </div> <div class="col-lg-4">
        <div class="card shadow-sm border-0 rounded-4 sticky-summary">
          <div class="card-body p-4 p-lg-5">
            <h5 class="fw-bold mb-4">Order Summary</h5>

            <div class="summary-row d-flex justify-content-between mb-3">
              <span class="text-muted">Subtotal</span>
              <span class="fw-medium">₱{{ totalPrice.toLocaleString() }}</span>
            </div>
            
            <div class="summary-row d-flex justify-content-between mb-3">
              <span class="text-muted">Shipping</span>
              <span class="text-success fw-semibold">Free</span>
            </div>

            <hr class="my-4 border-secondary opacity-25" />

            <div class="d-flex justify-content-between align-items-center fw-bold fs-5 mb-4">
              <span>Total</span>
              <span class="theme-text fs-4">₱{{ totalPrice.toLocaleString() }}</span>
            </div>

            <button
              v-if="step === 'review'"
              class="btn w-100 text-white fw-semibold py-3 rounded-3 place-order-btn mb-3"
              @click="step = 'payment'"
            >
              Continue to Payment <i class="bi bi-arrow-right ms-2"></i>
            </button>

            <button
              v-else
              class="btn w-100 text-white fw-semibold py-3 rounded-3 place-order-btn mb-3"
              :disabled="isPlacingOrder || !selectedMethod"
              @click="handlePlaceOrder"
            >
              <span v-if="isPlacingOrder">
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Processing...
              </span>
              <span v-else>
                <i class="bi bi-lock-fill me-2"></i> Place Order & Pay
              </span>
            </button>

            <button
              class="btn w-100 btn-outline-secondary py-2 rounded-3 back-btn-secondary"
              :disabled="isPlacingOrder"
              @click="step === 'payment' ? step = 'review' : router.push('/cart')"
            >
              <i class="bi bi-arrow-left me-2"></i>
              {{ step === 'payment' ? 'Back to Review' : 'Back to Cart' }}
            </button>
            
          </div>
        </div>
      </div> </div>
  </div>
</template>

<style scoped>
/* ── BASE & TYPOGRAPHY ── */
.checkout-page {
  margin-top: 1rem;
  color: #2c2416;
}

.page-title {
  font-family: "Sunday", "Canva-Sunday", serif;
  font-size: clamp(2rem, 4vw, 2.5rem);
  color: #1a1a1a;
  letter-spacing: 0.5px;
}

.theme-text, .back-btn {
  color: var(--theme-primary, #4B2C6D);
}

.theme-spinner {
  color: var(--theme-primary, #4B2C6D);
}

/* ── PROGRESS STEPS BREADCRUMB ── */
.checkout-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 600px;
  gap: 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #9ca3af;
  min-width: 70px;
}

.step.active {
  color: var(--theme-primary, #4B2C6D);
  font-weight: 700;
}

.step.completed {
  color: #10b981; /* Green standard */
}

.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 600;
  background: white;
  color: #9ca3af;
  transition: all 0.3s ease;
}

.step.active .step-dot {
  border-color: var(--theme-primary, #4B2C6D);
  background: var(--theme-primary, #4B2C6D);
  color: white;
}

.step.completed .step-dot {
  border-color: #10b981;
  background: #10b981;
  color: white;
}

.step-line {
  flex: 1;
  height: 2px;
  background: #e5e7eb;
  margin-bottom: 22px;
  transition: background 0.3s ease;
}

.step-line.completed {
  background: #10b981;
}

/* ── LAYOUT CARDS ── */
.card-header-custom {
  background: #fbf9f6; /* Soft warm standard tone */
  border-bottom: 1px solid #eae5df;
}

.checkout-item {
  transition: background 0.2s ease;
}

.checkout-item:hover {
  background: #fbf9f6;
}

.product-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(75, 44, 109, 0.08); /* Faded primary */
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--theme-primary, #4B2C6D);
  font-size: 1.25rem;
  flex-shrink: 0;
}

.product-name {
  font-size: 1rem;
}

.subtotal {
  color: var(--theme-primary, #4B2C6D);
}

.info-note {
  background: #fbf9f6;
  border-left: 4px solid var(--theme-primary, #4B2C6D);
}

.sticky-summary {
  position: sticky;
  top: 100px; /* Gives clearance from fixed navbars */
}

/* ── BUTTONS ── */
.place-order-btn {
  background-color: var(--theme-primary, #4B2C6D) !important;
  color: #ffffff !important;
  transition: transform 0.2s, box-shadow 0.2s;
  border: none;
}

.place-order-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(75, 44, 109, 0.2);
}

.place-order-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.back-btn-secondary {
  color: #4b5563 !important;
  border-color: #d1d5db !important;
  transition: all 0.2s;
}

.back-btn-secondary:hover:not(:disabled) {
  background-color: #f3f4f6 !important;
  color: #111827 !important;
}

/* ── PAYMENT GRID (RESPONSIVE FIXES) ── */
.method-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.method-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 20px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
  background: white;
}

.method-card:hover {
  border-color: #d1d5db;
  background: #fbf9f6;
}

.method-card.selected {
  border-color: var(--theme-primary, #4B2C6D);
  background: rgba(75, 44, 109, 0.04);
  color: var(--theme-primary, #4B2C6D);
}

.method-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
}

/* ── RESPONSIVE BREAKPOINTS ── */
@media (max-width: 991.98px) {
  .sticky-summary {
    position: relative;
    top: 0;
    margin-top: 1rem;
  }
}

@media (max-width: 575.98px) {
  .method-grid {
    grid-template-columns: 1fr; /* Stack payment methods vertically on mobile */
  }
  
  .method-card {
    flex-direction: row;
    justify-content: flex-start;
    padding: 16px 20px;
    gap: 16px;
  }

  .method-card i {
    margin-bottom: 0 !important;
  }
  
  .method-label {
    font-size: 0.95rem;
  }
  
  .checkout-steps {
    max-width: 100%;
  }
}
</style>