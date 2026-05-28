<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { getAllOrders, updateOrderStatus, getErrorMessage } from '../services/api.js';
import AdminSidebar from '../components/AdminSidebar.vue';

// ——— Orders State ———
const orders = ref([]);
const isSidebarOpen = ref(true);

// Pagination States
const itemsPerPage = 10;
const currentOrderPage = ref(1);

function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value;
}

async function loadOrders() {
    try {
        orders.value = await getAllOrders();
    } catch (err) {
        console.error('Failed to load orders:', getErrorMessage(err));
    }
}

// ——— Orders Management Actions ———
async function handleUpdateStatus(orderId, nextStatus) {
    if (!confirm(`Are you sure you want to change order status to "${nextStatus}"?`)) return;
    try {
        await updateOrderStatus(orderId, nextStatus);
        await loadOrders();
    } catch (err) {
        console.error('Failed to update order status:', getErrorMessage(err));
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ——— Orders Pagination Logic ───
const totalOrderPages = computed(() => Math.ceil(orders.value.length / itemsPerPage));

const visibleOrderPages = computed(() => {
    const total = totalOrderPages.value;
    const current = currentOrderPage.value;

    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = [];
    pages.push(1);

    if (current > 4) pages.push('...');

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
    }

    if (current < total - 3) pages.push('...');
    if (!pages.includes(total)) pages.push(total);

    return pages;
});

const paginatedOrders = computed(() => {
    const start = (currentOrderPage.value - 1) * itemsPerPage;
    return orders.value.slice(start, start + itemsPerPage);
});

function goToOrderPage(page) {
    if (typeof page === 'number' && page >= 1 && page <= totalOrderPages.value) {
        currentOrderPage.value = page;
    }
}
function prevOrderPage() { goToOrderPage(currentOrderPage.value - 1); }
function nextOrderPage() { goToOrderPage(currentOrderPage.value + 1); }

onMounted(async () => {
    if (window.innerWidth <= 992) {
        isSidebarOpen.value = false;
    }
    await loadOrders();
});
</script>

<template>
    <div class="admin-wrapper">

        <AdminSidebar />

        <main class="admin-main">
            <header class="main-header">
                <div class="header-titles">
                    <h1 class="page-title">Order Management</h1>
                    <p class="page-sub">Track, update status, and manage client orders.</p>
                </div>

                <div class="header-actions">
                    <RouterLink to="/products" class="btn-ghost">
                        <i class="bi bi-box-seam"></i> View Products
                    </RouterLink>
                </div>
            </header>

            <div class="content-card">
                <div class="table-responsive">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date Placed</th> 
                                <th>Items Ordered</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th class="align-right">Status Actions</th> 
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="order in paginatedOrders" :key="order._id">
                                <td class="fw-semibold text-dark" :title="order._id">
                                    #{{ order._id.substring(order._id.length - 8).toUpperCase() }}
                                </td>
                                
                                <td class="text-muted fw-medium" style="font-size: 0.85rem; white-space: nowrap;">
                                    {{ formatDate(order.orderedOn) }}
                                </td>

                                <td>
                                    <div v-for="item in order.productsOrdered" :key="item._id" class="text-muted" style="font-size: 0.85rem; margin-bottom: 0.2rem;">
                                        • {{ item.productId?.name ?? 'Unknown Item' }} <strong class="text-dark">x{{ item.quantity }}</strong>
                                    </div>
                                </td>
                                <td class="fw-medium">₱{{ order.totalPrice }}</td>
                                <td>
                                    <span 
                                        class="status-badge" 
                                        :class="{
                                            'active': order.status === 'Confirmed',
                                            'inactive': order.status === 'Cancelled'
                                        }"
                                        :style="order.status === 'Pending' ? 'background: #fef3c7; color: #d97706;' : ''"
                                    >
                                        {{ order.status }}
                                    </span>
                                </td>
                                <td class="align-right">
                                    <div class="action-group">
                                        <button 
                                            v-if="order.status === 'Pending'"
                                            class="action-btn activate" 
                                            @click="handleUpdateStatus(order._id, 'Confirmed')" 
                                            title="Confirm Order"
                                        >
                                            <i class="bi bi-check-lg"></i>
                                        </button>
                                        <button 
                                            v-if="order.status === 'Pending'"
                                            class="action-btn disable" 
                                            @click="handleUpdateStatus(order._id, 'Cancelled')" 
                                            title="Cancel Order"
                                        >
                                            <i class="bi bi-x-lg"></i>
                                        </button>
                                        <span v-else class="text-muted" style="font-size: 0.8rem; padding-right: 0.5rem;">Settled</span>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="orders.length === 0">
                                <td colspan="6" class="empty-state"> 
                                    <i class="bi bi-receipt"></i>
                                    <p>No customer orders found.</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="totalOrderPages > 1" class="pagination">
                    <button class="page-btn" :disabled="currentOrderPage === 1" @click="prevOrderPage">
                        <i class="bi bi-chevron-left"></i> Previous
                    </button>

                    <div class="page-numbers">
                        <template v-for="(page, index) in visibleOrderPages" :key="index">
                            <span v-if="page === '...'" class="page-ellipsis">…</span>
                            <button
                                v-else
                                class="page-num"
                                :class="{ active: page === currentOrderPage }"
                                @click="goToOrderPage(page)"
                            >
                                {{ page }}
                            </button>
                        </template>
                    </div>

                    <button class="page-btn" :disabled="currentOrderPage === totalOrderPages" @click="nextOrderPage">
                        Next <i class="bi bi-chevron-right"></i>
                    </button>
                </div>
            </div>
        </main>
    </div>
</template>



<style scoped>
/* Scoped copy of dashboard design system token alignment styles */
.admin-wrapper { display: flex; min-height: 100vh; background: #faf9fc; font-family: 'Inter', sans-serif; flex-direction: row; }
.admin-sidebar { width: 260px; background: #3d0300; color: #ffffff; display: flex; flex-direction: column; flex-shrink: 0; position: relative; min-height: 100vh; z-index: 10; transition: width 0.3s ease; overflow-x: hidden; }
.admin-sidebar.closed { width: 80px; }
.sidebar-header { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem 1.25rem; height: 80px; }
.admin-sidebar.closed .sidebar-header { justify-content: center; }
.sidebar-brand { font-family: 'Yanone Kaffeesatz', sans-serif; font-size: 2.2rem; font-weight: 700; letter-spacing: 1px; line-height: 1; white-space: nowrap; }
.brand-p { color: #ffffff; }
.brand-s { color: #ee807b; }
.toggle-btn { background: transparent; border: none; color: #ffffff; font-size: 1.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0; }
.toggle-btn:hover { color: #ee807b; }
.sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; padding: 0 1rem; }
.admin-sidebar.closed .sidebar-nav { padding: 0 0.5rem; }
.nav-item { display: flex; align-items: center; gap: 1rem; padding: 0.85rem 1rem; color: #d1d5db; text-decoration: none; font-size: 0.95rem; font-weight: 500; border-radius: 8px; transition: all 0.2s ease; white-space: nowrap; }
.nav-item i { font-size: 1.3rem; min-width: 24px; text-align: center; }
.nav-item:hover { background: rgba(255, 255, 255, 0.08); color: #ffffff; }
.nav-item.active { background: rgba(238, 128, 123, 0.15); color: #ee807b; font-weight: 600; }
.admin-sidebar.closed .nav-item { justify-content: center; padding: 0.85rem 0; }
.admin-sidebar.closed .nav-text { display: none; }
.sidebar-footer { padding: 1.5rem 1.25rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.admin-profile { display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; font-weight: 500; color: #e5e7eb; white-space: nowrap; }
.admin-profile i { font-size: 1.5rem; color: #ee807b; }
.admin-sidebar.closed .sidebar-footer { padding: 1.5rem 0; }
.admin-sidebar.closed .admin-profile { justify-content: center; }
.admin-sidebar.closed .profile-text { display: none; }
.admin-main { flex: 1; padding: 2.5rem 3rem; overflow-y: auto; transition: width 0.3s ease; }
.main-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
.page-title { font-family: 'Yanone Kaffeesatz', sans-serif; font-size: 2.5rem; font-weight: 700; color: #1a1a1a; margin: 0 0 0.2rem 0; }
.page-sub { font-size: 0.9rem; color: #6b7280; margin: 0; }
.header-actions { display: flex; gap: 1rem; }
.btn-ghost { background: transparent; color: #3d0300; border: 1.5px solid #d1d5db; padding: 0.7rem 1.4rem; border-radius: 10px; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s ease; }
.btn-ghost:hover { border-color: #3d0300; background: rgba(61, 3, 0, 0.04); }
.content-card { background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); padding: 0; overflow: hidden; }
.table-responsive { width: 100%; overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; text-align: left; }
.admin-table th { background: #ffffff; padding: 1.2rem 1.5rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; border-bottom: 2px solid #f3f4f6; }
.admin-table td { padding: 1.2rem 1.5rem; font-size: 0.9rem; color: #374151; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
.admin-table tbody tr:nth-child(even) { background-color: #f8f9fa; }
.admin-table tbody tr:hover { background-color: #f1f5f9; }
.admin-table tbody tr:last-child td { border-bottom: none; }
.text-dark { color: #1a1a1a; }
.text-muted { color: #6b7280; }
.fw-semibold { font-weight: 600; }
.fw-medium { font-weight: 500; }
.align-right { text-align: right; }
.status-badge { display: inline-flex; align-items: center; padding: 0.35rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 600; }
.status-badge.active { background: #d1fae5; color: #059669; }
.status-badge.inactive { background: #fee2e2; color: #dc2626; }
.action-group { display: flex; gap: 0.5rem; justify-content: flex-end; }
.action-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1rem; transition: all 0.2s ease; background: #ffffff; color: #6b7280; }
.action-btn.activate:hover { background: #dcfce7; color: #16a34a; border-color: #bbf7d0; }
.action-btn.disable:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; }
.empty-state { text-align: center; padding: 4rem 2rem !important; color: #9ca3af; background: #ffffff !important; }
.empty-state i { font-size: 3rem; color: #e5e7eb; margin-bottom: 1rem; display: block; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 1.25rem 1.5rem; border-top: 1px solid #f3f4f6; background: #ffffff; }
.page-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 500; color: #3d0300; background: #ffffff; border: 1.5px solid #d1d5db; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; }
.page-btn:hover:not(:disabled) { border-color: #3d0300; background: rgba(61, 3, 0, 0.04); }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-numbers { display: flex; gap: 0.35rem; }
.page-num { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 500; color: #374151; background: #ffffff; border: 1.5px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; }
.page-num:hover { border-color: #3d0300; color: #3d0300; }
.page-num.active { background: #3d0300; color: #ffffff; border-color: #3d0300; }
.page-ellipsis { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; color: #9ca3af; }

@media (max-width: 992px) {
    .admin-main { padding: 1.5rem; }
}
</style>