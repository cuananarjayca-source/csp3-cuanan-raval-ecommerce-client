<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getUserOrders, getMyPayments } from "../api.js";

const router = useRouter();
const route = useRoute();

const payments = ref([]);
const order = ref(null);
const isLoading = ref(true);
const error = ref(null);

const statusConfig = {
  Pending:   { badge: "badge-pending",   icon: "bi-clock",        label: "Pending",   desc: "Waiting for admin confirmation." },
  Confirmed: { badge: "badge-confirmed", icon: "bi-check-circle", label: "Confirmed", desc: "Your order is confirmed. You may now proceed to payment." },
  Cancelled: { badge: "badge-cancelled", icon: "bi-x-circle",     label: "Cancelled", desc: "This order has been cancelled." },
};

const orderHasPayment = computed(() =>
  payments.value.some((p) => p.orderId === order.value?._id)
);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const totalUnits = computed(() =>
  order.value?.productsOrdered.reduce((sum, i) => sum + i.quantity, 0) ?? 0
);

onMounted(async () => {
  try {
    const orders = await getUserOrders();
    order.value = orders.find((o) => o._id === route.params.id) ?? null;
    payments.value = await getMyPayments();
    if (!order.value) error.value = "Order not found.";
  } catch (err) {
    error.value = err?.response?.data?.message ?? "Failed to load order.";
    payments.value = [];
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="container py-5">
    <!-- Back -->
    <div class="d-flex align-items-center gap-3 mb-4">
      <button class="btn btn-link p-0 text-decoration-none back-btn" @click="router.push('/orders')">
        <i class="bi bi-arrow-left fs-5"></i>
      </button>
      <h2 class="page-title mb-0 py-5">Order Details</h2>
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

    <!-- Content -->
    <div v-else-if="order" class="row g-4">
      <!-- Left: Items -->
      <div class="col-lg-8">

        <!-- Status Banner -->
        <div
          class="status-banner rounded-4 px-4 py-3 mb-3 d-flex align-items-center gap-3"
          :class="`banner-${order.status.toLowerCase()}`"
        >
          <i class="bi fs-4" :class="statusConfig[order.status]?.icon"></i>
          <div>
            <div class="fw-bold">{{ statusConfig[order.status]?.label }}</div>
            <small>{{ statusConfig[order.status]?.desc }}</small>
          </div>
        </div>

        <!-- Items Card -->
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div class="card-header-custom px-4 py-3">
            <h6 class="mb-0 fw-semibold">
              <i class="bi bi-bag me-2"></i>
              {{ order.productsOrdered.length }} Product{{ order.productsOrdered.length !== 1 ? "s" : "" }}
              · {{ totalUnits }} Unit{{ totalUnits !== 1 ? "s" : "" }}
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
                  <p class="mb-0 fw-semibold" style="font-size: 0.95rem">
                    {{ item.productId?.name ?? "Product" }}
                  </p>
                  <small class="text-muted">
                    ₱{{ (item.productId?.price ?? 0).toLocaleString() }} × {{ item.quantity }}
                  </small>
                </div>
              </div>
              <span class="fw-bold" style="color: var(--theme-primary)">
                ₱{{ item.subtotal.toLocaleString() }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Summary + Actions -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm rounded-4 sticky-top" style="top: 1.5rem">
          <div class="card-body p-4">

            <!-- Order Meta -->
            <h6 class="fw-bold text-muted text-uppercase mb-3" style="font-size: 0.72rem; letter-spacing: .08em">
              Order Info
            </h6>
            <div class="meta-row d-flex justify-content-between mb-2">
              <span class="text-muted small">Order ID</span>
              <span class="small fw-semibold">#{{ order._id.slice(-8).toUpperCase() }}</span>
            </div>
            <div class="meta-row d-flex justify-content-between mb-2">
              <span class="text-muted small">Date</span>
              <span class="small">{{ formatDate(order.orderedOn) }}</span>
            </div>
            <div class="meta-row d-flex justify-content-between mb-3">
              <span class="text-muted small">Status</span>
              <span
                class="badge rounded-pill px-2"
                :class="statusConfig[order.status]?.badge"
              >
                {{ statusConfig[order.status]?.label }}
              </span>
            </div>

            <hr class="my-3" />

            <!-- Price -->
            <h6 class="fw-bold text-muted text-uppercase mb-3" style="font-size: 0.72rem; letter-spacing: .08em">
              Summary
            </h6>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted small">Subtotal</span>
              <span class="small">₱{{ order.totalPrice.toLocaleString() }}</span>
            </div>
            <div class="d-flex justify-content-between mb-3">
              <span class="text-muted small">Shipping</span>
              <span class="small text-success fw-semibold">Free</span>
            </div>
            <div class="d-flex justify-content-between fw-bold fs-5 mb-4">
              <span>Total</span>
              <span style="color: var(--theme-primary)">₱{{ order.totalPrice.toLocaleString() }}</span>
            </div>

            <!-- REPLACE the three v-if blocks for pay/pending/cancelled with this: -->

            <div v-if="!orderHasPayment">
              <button
                class="btn w-100 text-white fw-semibold py-2 rounded-3 pay-btn"
                @click="router.push(`/payment/${order._id}`)"
              >
                <i class="bi bi-credit-card me-2"></i>Pay Now
              </button>
            </div>

            <div v-else class="paid-note rounded-3 px-3 py-2 text-center">
              <i class="bi bi-check-circle me-1"></i>
              <small>A payment has already been submitted for this order.</small>
            </div>

            <router-link to="/orders" class="btn w-100 btn-outline-secondary mt-2 rounded-3">
              <i class="bi bi-arrow-left me-2"></i>Back to Orders
            </router-link>
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

/* Status banners */
.status-banner {
  font-size: 0.88rem;
}

.banner-pending {
  background: #fffbeb;
  border: 1px solid #fcd34d;
  color: #92400e;
}

.banner-confirmed {
  background: #ecfdf5;
  border: 1px solid #6ee7b7;
  color: #065f46;
}

.banner-cancelled {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #991b1b;
}

/* Item rows */
.card-header-custom {
  background: #f8f5fc;
  border-bottom: 1px solid #e8dff5;
}

.order-item {
  transition: background 0.15s;
}

.order-item:hover {
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

/* Badges */
.badge-pending {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffc107;
}

.badge-confirmed {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}

.badge-cancelled {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #f87171;
}

/* Action notes */
.pending-note {
  background: #fffbeb;
  border: 1px solid #fcd34d;
  color: #92400e;
  font-size: 0.82rem;
}

.cancelled-note {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #991b1b;
  font-size: 0.82rem;
}

/* Pay button */
.pay-btn {
  background-color: #16a34a;
  transition: opacity 0.2s;
}

.pay-btn:hover {
  opacity: 0.88;
  background-color: #16a34a;
}

.paid-note {
  background: #d1fae5;
  border: 1px solid #6ee7b7;
  color: #065f46;
  font-size: 0.82rem;
}
</style>