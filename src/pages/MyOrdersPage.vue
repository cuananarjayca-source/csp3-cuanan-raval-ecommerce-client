<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getUserOrders } from "../api.js";

const router = useRouter();
const orders = ref([]);
const isLoading = ref(true);
const error = ref(null);

const statusConfig = {
  Pending:   { badge: "badge-pending",   icon: "bi-clock",          label: "Pending" },
  Confirmed: { badge: "badge-confirmed", icon: "bi-check-circle",   label: "Confirmed" },
  Cancelled: { badge: "badge-cancelled", icon: "bi-x-circle",       label: "Cancelled" },
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric", month: "short", day: "numeric",
  });
};

const formatTime = (dateStr) => {
  return new Date(dateStr).toLocaleTimeString("en-PH", {
    hour: "2-digit", minute: "2-digit",
  });
};

const totalUnits = (order) =>
  order.productsOrdered.reduce((sum, item) => sum + item.quantity, 0);

onMounted(async () => {
  try {
    orders.value = await getUserOrders();
  } catch (err) {
    if (err?.response?.status === 404) {
      orders.value = [];
    } else {
      error.value = err?.response?.data?.message ?? "Failed to load orders.";
    }
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="container py-5">
    <div class="d-flex align-items-center justify-content-between mb-4">
      <h2 class="page-title mb-0 py-5">My Orders</h2>
      <router-link to="/products" class="btn btn-outline-secondary rounded-3 btn-sm">
        <i class="bi bi-bag-plus me-1"></i> Continue Shopping
      </router-link>
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
    <div v-else-if="orders.length === 0" class="text-center py-5">
      <div class="empty-icon-wrap mx-auto mb-3">
        <i class="bi bi-receipt fs-1"></i>
      </div>
      <p class="text-muted">You haven't placed any orders yet.</p>
      <router-link to="/products" class="btn text-white rounded-3" style="background-color: var(--theme-primary)">
        Start Shopping
      </router-link>
    </div>

    <!-- Orders List -->
    <div v-else class="orders-list d-flex flex-column gap-3">
      <div
        v-for="order in orders"
        :key="order._id"
        class="order-card card border-0 shadow-sm rounded-4 overflow-hidden"
        @click="router.push(`/orders/${order._id}`)"
      >
        <!-- Card Header -->
        <div class="order-card-header px-4 py-3 d-flex justify-content-between align-items-center">
          <div>
            <span class="order-id text-muted small">Order #{{ order._id.slice(-8).toUpperCase() }}</span>
            <div class="text-muted" style="font-size: 0.78rem">
              {{ formatDate(order.orderedOn) }} · {{ formatTime(order.orderedOn) }}
            </div>
          </div>
          <span
            class="badge rounded-pill px-3 py-2"
            :class="statusConfig[order.status]?.badge"
          >
            <i class="bi me-1" :class="statusConfig[order.status]?.icon"></i>
            {{ statusConfig[order.status]?.label ?? order.status }}
          </span>
        </div>

        <!-- Card Body -->
        <div class="px-4 py-3 d-flex justify-content-between align-items-center">
          <div>
            <p class="mb-1 fw-semibold" style="font-size: 0.9rem">
              {{ order.productsOrdered.length }} product{{ order.productsOrdered.length !== 1 ? "s" : "" }}
              · {{ totalUnits(order) }} unit{{ totalUnits(order) !== 1 ? "s" : "" }}
            </p>
            <p class="mb-0 text-muted" style="font-size: 0.82rem">
              {{
                order.productsOrdered
                  .slice(0, 2)
                  .map((i) => i.productId?.name ?? "Product")
                  .join(", ")
              }}
              <span v-if="order.productsOrdered.length > 2" class="text-muted">
                +{{ order.productsOrdered.length - 2 }} more
              </span>
            </p>
          </div>

          <div class="d-flex align-items-center gap-3">
            <div class="text-end">
              <div class="fw-bold fs-6" style="color: var(--theme-primary)">
                ₱{{ order.totalPrice.toLocaleString() }}
              </div>
            </div>
            <i class="bi bi-chevron-right text-muted"></i>
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

/* Order Card */
.order-card {
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(75, 44, 109, 0.12) !important;
}

.order-card-header {
  background: #f8f5fc;
  border-bottom: 1px solid #ede7f6;
}

/* Status badges */
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

/* Pay CTA bar */
.pay-cta-bar {
  background: #edf7f0;
  border-top: 1px solid #c6f0d6;
  color: #1a7a45;
  font-size: 0.8rem;
}
</style>