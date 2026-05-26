<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getUserOrders, getMyPayments, createPayment } from "../api.js";
import { Notyf } from "notyf";

const notyf = new Notyf({ duration: 3000, position: { x: "right", y: "top" } });
const router = useRouter();
const route = useRoute();

const order = ref(null);
const isLoading = ref(true);
const isSubmitting = ref(false);
const error = ref(null);
const paymentSuccess = ref(null); // holds the result on success

const selectedMethod = ref(null);

const paymentMethods = [
  { value: "credit_card",      label: "Credit Card",      icon: "bi-credit-card" },
  { value: "debit_card",       label: "Debit Card",       icon: "bi-credit-card-2-front" },
  { value: "gcash",            label: "GCash",            icon: "bi-phone" },
  { value: "paypal",           label: "PayPal",           icon: "bi-paypal" },
  { value: "cash_on_delivery", label: "Cash on Delivery", icon: "bi-cash-coin" },
];

const totalUnits = computed(() =>
  order.value?.productsOrdered.reduce((sum, i) => sum + i.quantity, 0) ?? 0
);

onMounted(async () => {
  try {
    // 1. Find the order
    const orders = await getUserOrders();
    const found = orders.find((o) => o._id === route.params.orderId);

    if (!found) {
      notyf.error("Order not found.");
      return router.push("/orders");
    }
    // REPLACE WITH:
    if (!found) {
      notyf.error("Order not found.");
      return router.push("/orders");
    }
    // No status gate — payment is available as soon as an order exists without a payment

    // 2. Check if already paid
    try {
      const payments = await getMyPayments();
      const existing = payments.find((p) => p.orderId === found._id);
      if (existing) {
        notyf.error("A payment already exists for this order.");
        return router.push(`/orders/${found._id}`);
      }
    } catch (payErr) {
      // 404 means no payments yet — that's fine, continue
      if (payErr?.response?.status !== 404) throw payErr;
    }

    order.value = found;
  } catch (err) {
    error.value = err?.response?.data?.message ?? "Failed to load order.";
  } finally {
    isLoading.value = false;
  }
});

const handleSubmit = async () => {
  if (!selectedMethod.value) {
    notyf.error("Please select a payment method.");
    return;
  }

  isSubmitting.value = true;
  try {
    const result = await createPayment(order.value._id, selectedMethod.value, order.value.totalPrice);
    paymentSuccess.value = result;
  } catch (err) {
    const msg = err?.response?.data?.message ?? "Payment failed. Please try again.";
    notyf.error(msg);
  } finally {
    isSubmitting.value = false;
  }
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
</script>

<template>
  <div class="container py-5">

    <!-- Header -->
    <div class="d-flex align-items-center gap-3 mb-4">
      <button class="btn btn-link p-0 text-decoration-none back-btn" @click="router.push(`/orders/${route.params.orderId}`)">
        <i class="bi bi-arrow-left fs-5"></i>
      </button>
      <h2 class="page-title mb-0">Payment</h2>
    </div>

    <!-- Step Indicator -->
    <div class="checkout-steps mb-5">
      <div class="step completed">
        <div class="step-dot"><i class="bi bi-check"></i></div>
        <span>Cart</span>
      </div>
      <div class="step-line completed"></div>
      <div class="step completed">
        <div class="step-dot"><i class="bi bi-check"></i></div>
        <span>Review</span>
      </div>
      <div class="step-line completed"></div>
      <div class="step active">
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

    <!-- Error -->
    <div v-else-if="error" class="alert alert-danger rounded-4">
      <i class="bi bi-exclamation-circle me-2"></i>{{ error }}
    </div>

    <!-- ✅ Success State -->
    <div v-else-if="paymentSuccess" class="row justify-content-center">
      <div class="col-lg-6">
        <div class="success-card card border-0 shadow-sm rounded-4 text-center p-5">
          <div class="success-icon-wrap mx-auto mb-4">
            <i class="bi bi-check-lg fs-2 text-white"></i>
          </div>
          <h4 class="fw-bold mb-1">Payment Submitted!</h4>
          <p class="text-muted mb-4">Your payment is under review. You'll be notified once it's confirmed.</p>

          <div class="transaction-box rounded-3 px-4 py-3 mb-4">
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted small">Transaction ID</span>
              <span class="fw-semibold small font-monospace">{{ paymentSuccess.transactionId }}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted small">Amount</span>
              <span class="fw-bold" style="color: var(--theme-primary)">
                ₱{{ order.totalPrice.toLocaleString() }}
              </span>
            </div>
            <div class="d-flex justify-content-between">
              <span class="text-muted small">Status</span>
              <span class="badge badge-pending rounded-pill px-3">
                <i class="bi bi-clock me-1"></i>Pending Review
              </span>
            </div>
          </div>

          <div class="d-flex flex-column gap-2">
            <button
              class="btn text-white fw-semibold rounded-3 py-2"
              style="background-color: var(--theme-primary)"
              @click="router.push('/my-payments')"
            >
              <i class="bi bi-receipt me-2"></i>View My Payments
            </button>
            <button class="btn btn-outline-secondary rounded-3" @click="router.push('/orders')">
              <i class="bi bi-bag me-2"></i>Back to Orders
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Form -->
    <div v-else-if="order" class="row g-4">

      <!-- Left: Order Summary -->
      <div class="col-lg-5">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div class="card-header-custom px-4 py-3">
            <h6 class="mb-0 fw-semibold">
              <i class="bi bi-bag me-2"></i>
              Order #{{ order._id.slice(-8).toUpperCase() }}
            </h6>
          </div>
          <div class="card-body p-0">
            <div
              v-for="(item, index) in order.productsOrdered"
              :key="item.productId._id ?? item.productId"
              class="order-item px-4 py-3 d-flex justify-content-between align-items-center"
              :class="{ 'border-top': index > 0 }"
            >
              <div class="d-flex align-items-center gap-3">
                <div class="product-icon-wrap">
                  <i class="bi bi-box-seam"></i>
                </div>
                <div>
                  <p class="mb-0 fw-semibold" style="font-size: 0.9rem">
                    {{ item.productId?.name ?? "Product" }}
                  </p>
                  <small class="text-muted">qty {{ item.quantity }}</small>
                </div>
              </div>
              <span class="fw-semibold small" style="color: var(--theme-primary)">
                ₱{{ item.subtotal.toLocaleString() }}
              </span>
            </div>
          </div>
          <div class="px-4 py-3 border-top d-flex justify-content-between fw-bold">
            <span>Total</span>
            <span style="color: var(--theme-primary)">₱{{ order.totalPrice.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- Right: Payment Form -->
      <div class="col-lg-7">
        <div class="card border-0 shadow-sm rounded-4 p-4">
          <h5 class="fw-bold mb-1">Choose Payment Method</h5>
          <p class="text-muted small mb-4">Select how you'd like to pay for this order.</p>

          <!-- Method Selector -->
          <div class="method-grid mb-4">
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

          <!-- Amount (read-only) -->
          <div class="mb-4">
            <label class="form-label fw-semibold small text-muted text-uppercase" style="letter-spacing: .06em">
              Amount to Pay
            </label>
            <div class="amount-display rounded-3 px-4 py-3 d-flex justify-content-between align-items-center">
              <span class="text-muted small">Order Total</span>
              <span class="fw-bold fs-5" style="color: var(--theme-primary)">
                ₱{{ order.totalPrice.toLocaleString() }}
              </span>
            </div>
            <small class="text-muted">Amount is fixed to the order total and cannot be changed.</small>
          </div>

          <!-- Submit -->
          <button
            class="btn w-100 text-white fw-semibold py-2 rounded-3 submit-btn"
            :disabled="isSubmitting || !selectedMethod"
            @click="handleSubmit"
          >
            <span v-if="isSubmitting">
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              Processing...
            </span>
            <span v-else>
              <i class="bi bi-lock me-2"></i>Confirm Payment · ₱{{ order.totalPrice.toLocaleString() }}
            </span>
          </button>

          <p class="text-muted text-center mt-3" style="font-size: 0.78rem">
            <i class="bi bi-shield-check me-1"></i>
            Your payment details are secure. Payment status will be reviewed by our team.
          </p>
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

.back-btn { color: var(--theme-primary); }

/* Steps — same as CheckoutPage */
.checkout-steps {
  display: flex;
  align-items: center;
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

.step.active  { color: var(--theme-primary); font-weight: 600; }
.step.completed { color: #28a745; }

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

.step.active .step-dot    { border-color: var(--theme-primary); background: var(--theme-primary); color: white; }
.step.completed .step-dot { border-color: #28a745; background: #28a745; color: white; }

.step-line          { flex: 1; height: 2px; background: #ddd; margin-bottom: 18px; }
.step-line.completed { background: #28a745; }

/* Card header */
.card-header-custom {
  background: #f8f5fc;
  border-bottom: 1px solid #e8dff5;
}

/* Order items */
.order-item { transition: background 0.15s; }
.order-item:hover { background: #faf8fd; }

.product-icon-wrap {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #ede7f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--theme-primary);
  flex-shrink: 0;
}

/* Payment method grid */
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

/* Amount display */
.amount-display {
  background: #f8f5fc;
  border: 1px solid #e8dff5;
}

/* Submit */
.submit-btn {
  background-color: var(--theme-primary);
  transition: opacity 0.2s;
}
.submit-btn:hover:not(:disabled) { opacity: 0.88; }
.submit-btn:disabled { background-color: var(--theme-primary); opacity: 0.55; }

/* Success state */
.success-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #16a34a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.transaction-box {
  background: #f8f5fc;
  border: 1px solid #e8dff5;
  text-align: left;
}

/* Badges */
.badge-pending {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffc107;
}
</style>