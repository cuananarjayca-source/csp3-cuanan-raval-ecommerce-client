<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getMyPayments } from "../api.js";

const router = useRouter();
const payments = ref([]);
const isLoading = ref(true);
const error = ref(null);

const statusConfig = {
  pending:  { badge: "badge-pending",   icon: "bi-clock",          label: "Pending Review" },
  paid:     { badge: "badge-paid",      icon: "bi-check-circle",   label: "Paid" },
  failed:   { badge: "badge-failed",    icon: "bi-x-circle",       label: "Failed" },
  refunded: { badge: "badge-refunded",  icon: "bi-arrow-counterclockwise", label: "Refunded" },
  cancelled:{ badge: "badge-cancelled", icon: "bi-slash-circle",   label: "Cancelled" },
};

const methodLabels = {
  credit_card:      { label: "Credit Card",      icon: "bi-credit-card" },
  debit_card:       { label: "Debit Card",        icon: "bi-credit-card-2-front" },
  gcash:            { label: "GCash",             icon: "bi-phone" },
  paypal:           { label: "PayPal",            icon: "bi-paypal" },
  cash_on_delivery: { label: "Cash on Delivery",  icon: "bi-cash-coin" },
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

onMounted(async () => {
  try {
    payments.value = await getMyPayments();
  } catch (err) {
    if (err?.response?.status === 404) {
      payments.value = [];
    } else {
      error.value = err?.response?.data?.message ?? "Failed to load payments.";
    }
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="container py-5">
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h2 class="page-title mb-0">My Payments</h2>
      <button class="btn btn-outline-secondary btn-sm rounded-3" @click="router.push('/orders')">
        <i class="bi bi-bag me-1"></i> My Orders
      </button>
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

    <!-- Empty -->
    <div v-else-if="payments.length === 0" class="text-center py-5">
      <div class="empty-icon-wrap mx-auto mb-3">
        <i class="bi bi-receipt fs-1"></i>
      </div>
      <p class="text-muted">No payments found.</p>
      <button
        class="btn text-white rounded-3"
        style="background-color: var(--theme-primary)"
        @click="router.push('/orders')"
      >
        View Orders
      </button>
    </div>

    <!-- Payments List -->
    <div v-else class="d-flex flex-column gap-3">
      <div
        v-for="payment in payments"
        :key="payment._id"
        class="payment-card card border-0 shadow-sm rounded-4 overflow-hidden"
      >
        <!-- Header -->
        <div class="card-header-custom px-4 py-3 d-flex justify-content-between align-items-center">
          <div>
            <span class="text-muted small">Transaction ID</span>
            <div class="fw-semibold font-monospace" style="font-size: 0.88rem">
              {{ payment.transactionId }}
            </div>
          </div>
          <span
            class="badge rounded-pill px-3 py-2"
            :class="statusConfig[payment.status]?.badge"
          >
            <i class="bi me-1" :class="statusConfig[payment.status]?.icon"></i>
            {{ statusConfig[payment.status]?.label ?? payment.status }}
          </span>
        </div>

        <!-- Body -->
        <div class="px-4 py-3">
          <div class="row g-3">
            <div class="col-sm-4">
              <div class="text-muted small mb-1">Payment Method</div>
              <div class="d-flex align-items-center gap-2 fw-semibold" style="font-size: 0.9rem">
                <i class="bi" :class="methodLabels[payment.paymentMethod]?.icon"></i>
                {{ methodLabels[payment.paymentMethod]?.label ?? payment.paymentMethod }}
              </div>
            </div>
            <div class="col-sm-4">
              <div class="text-muted small mb-1">Amount</div>
              <div class="fw-bold" style="color: var(--theme-primary); font-size: 1rem">
                ₱{{ payment.amount.toLocaleString() }}
              </div>
            </div>
            <div class="col-sm-4">
              <div class="text-muted small mb-1">
                {{ payment.status === "paid" ? "Paid On" : "Submitted On" }}
              </div>
              <div style="font-size: 0.88rem">
                {{ formatDate(payment.status === "paid" ? payment.paidAt : payment.createdAt) }}
              </div>
            </div>
          </div>

          <!-- Order link -->
          <div class="mt-3 pt-3 border-top d-flex justify-content-between align-items-center">
            <span class="text-muted small">
              Order #{{ payment.orderId?.toString().slice(-8).toUpperCase() }}
            </span>
            <button
              class="btn btn-sm btn-outline-secondary rounded-3"
              @click="router.push(`/orders/${payment.orderId}`)"
            >
              View Order <i class="bi bi-arrow-right ms-1"></i>
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
  font-size: 2.2rem;
  color: #1a1a1a;
}

.empty-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #ede7f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--theme-primary);
}

.card-header-custom {
  background: #f8f5fc;
  border-bottom: 1px solid #e8dff5;
}

.payment-card {
  transition: box-shadow 0.15s;
}

.payment-card:hover {
  box-shadow: 0 6px 24px rgba(75, 44, 109, 0.1) !important;
}

/* Status badges */
.badge-pending   { background: #fff3cd; color: #856404;  border: 1px solid #ffc107; }
.badge-paid      { background: #d1fae5; color: #065f46;  border: 1px solid #10b981; }
.badge-failed    { background: #fee2e2; color: #991b1b;  border: 1px solid #f87171; }
.badge-refunded  { background: #dbeafe; color: #1e40af;  border: 1px solid #60a5fa; }
.badge-cancelled { background: #f3f4f6; color: #374151;  border: 1px solid #9ca3af; }
</style>