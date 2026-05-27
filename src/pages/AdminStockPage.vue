<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { getAllStock, updateStock, adjustStock, getErrorMessage } from '../services/api.js';
import AdminSidebar from '../components/AdminSidebar.vue';

// ——— State ———
const stocks = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const isSidebarOpen = ref(true);

// Modal State
const isModalOpen = ref(false);
const selectedItem = ref(null);
const updateMode = ref('set');
const inputQuantity = ref(0);
const isSubmitting = ref(false);

// Pagination State
const itemsPerPage = 10;
const currentPage = ref(1);

// ——— Sidebar ———
function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value;
}

// ——— Load Data ———
async function loadInventory() {
    isLoading.value = true;
    try {
        stocks.value = await getAllStock();
    } catch (err) {
        console.error('Failed to load inventory:', getErrorMessage(err));
    } finally {
        isLoading.value = false;
    }
}

// ——— Search Filter ———
const filteredStocks = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();
    if (!query) return stocks.value;
    return stocks.value.filter(item =>
        item.productId?.name?.toLowerCase().includes(query)
    );
});

// ——— Pagination ———
const totalPages = computed(() => Math.ceil(filteredStocks.value.length / itemsPerPage));

const visiblePages = computed(() => {
    const total = totalPages.value;
    const current = currentPage.value;

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

const paginatedStocks = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return filteredStocks.value.slice(start, start + itemsPerPage);
});

function goToPage(page) {
    if (typeof page === 'number' && page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
}
function prevPage() { goToPage(currentPage.value - 1); }
function nextPage() { goToPage(currentPage.value + 1); }

// ——— Modal Controls ———
function openModal(stockItem) {
    selectedItem.value = stockItem;
    updateMode.value = 'set';
    inputQuantity.value = stockItem.quantity;
    isModalOpen.value = true;
}

function closeModal() {
    isModalOpen.value = false;
    selectedItem.value = null;
    inputQuantity.value = 0;
}

// ——— Submit Update ———
async function handleInventorySubmit() {
    if (!selectedItem.value || !selectedItem.value.productId) return;
    const productId = selectedItem.value.productId._id;

    isSubmitting.value = true;
    try {
        if (updateMode.value === 'set') {
            if (inputQuantity.value < 0) throw new Error('Quantity cannot be negative.');
            await updateStock(productId, inputQuantity.value);
        } else {
            if (inputQuantity.value === 0) throw new Error('Adjustment value cannot be zero.');
            if (selectedItem.value.quantity + inputQuantity.value < 0) {
                throw new Error('Adjustment would result in negative stock.');
            }
            await adjustStock(productId, inputQuantity.value);
        }
        await loadInventory();
        closeModal();
    } catch (err) {
        alert(getErrorMessage(err));
    } finally {
        isSubmitting.value = false;
    }
}

// ——— On Mount ———
onMounted(async () => {
    if (window.innerWidth <= 992) {
        isSidebarOpen.value = false;
    }
    await loadInventory();
});
</script>

<template>
    <div class="admin-wrapper">

       <AdminSidebar />

        <!-- ── MAIN CONTENT ── -->
        <main class="admin-main">

            <header class="main-header">
                <div class="header-titles">
                    <h1 class="page-title">Inventory Control</h1>
                    <p class="page-sub">Monitor and adjust stock levels across all products.</p>
                </div>
                <div class="header-actions">
                    <RouterLink to="/products" class="btn-ghost">
                        <i class="bi bi-box-seam"></i> View Products
                    </RouterLink>
                </div>
            </header>

            <!-- Utility Bar -->
            <div class="utility-bar">
                <div class="search-box">
                    <i class="bi bi-search"></i>
                    <input
                        type="text"
                        v-model="searchQuery"
                        placeholder="Search by product name..."
                        @input="currentPage = 1"
                    />
                </div>
                <button class="btn-ghost" @click="loadInventory" :disabled="isLoading">
                    <i class="bi bi-arrow-clockwise" :class="{ 'spin-loader': isLoading }"></i> Refresh
                </button>
            </div>

            <!-- Stock Table -->
            <div class="content-card">
                <div class="table-responsive">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th class="hide-mobile">Product ID</th>
                                <th class="hide-mobile">Price</th>
                                <th>Quantity</th>
                                <th>Status</th>
                                <th class="align-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in paginatedStocks" :key="item._id">
                                <td class="fw-semibold text-dark">
                                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                                        <div class="img-preview-box">
                                            <img
                                                v-if="item.productId?.imageUrl"
                                                :src="item.productId.imageUrl"
                                                :alt="item.productId?.name"
                                            />
                                            <i v-else class="bi bi-boxes" style="color: #9ca3af; font-size: 1.1rem;"></i>
                                        </div>
                                        <span>{{ item.productId?.name ?? 'Unknown Product' }}</span>
                                    </div>
                                </td>
                                <td class="hide-mobile text-muted monospace-code">
                                    {{ item.productId?._id ?? 'N/A' }}
                                </td>
                                <td class="hide-mobile fw-medium">
                                    ₱{{ item.productId?.price ?? '0.00' }}
                                </td>
                                <td class="fw-bold text-dark">{{ item.quantity }} units</td>
                                <td>
                                    <span v-if="item.quantity === 0" class="stock-badge badge-out">Out of Stock</span>
                                    <span v-else-if="item.quantity < 10" class="stock-badge badge-low">Low Stock</span>
                                    <span v-else class="stock-badge badge-stable">Stable</span>
                                </td>
                                <td class="align-right">
                                    <button
                                        class="action-btn inventory-edit-btn"
                                        @click="openModal(item)"
                                        title="Adjust Stock"
                                        :disabled="!item.productId"
                                    >
                                        <i class="bi bi-sliders"></i>
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="filteredStocks.length === 0 && !isLoading">
                                <td colspan="6" class="empty-state">
                                    <i class="bi bi-layers-half"></i>
                                    <p>No stock records found.</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div v-if="totalPages > 1" class="pagination">
                    <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">
                        <i class="bi bi-chevron-left"></i> Previous
                    </button>
                    <div class="page-numbers">
                        <template v-for="(page, index) in visiblePages" :key="index">
                            <span v-if="page === '...'" class="page-ellipsis">…</span>
                            <button
                                v-else
                                class="page-num"
                                :class="{ active: page === currentPage }"
                                @click="goToPage(page)"
                            >
                                {{ page }}
                            </button>
                        </template>
                    </div>
                    <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">
                        Next <i class="bi bi-chevron-right"></i>
                    </button>
                </div>
            </div>
        </main>
    </div>

    <!-- ── MODAL ── -->
    <div class="modal-overlay" v-if="isModalOpen" @click.self="closeModal">
        <div class="modal-window">
            <div class="modal-header-block">
                <h3>Adjust Stock</h3>
                <button class="close-modal-btn" @click="closeModal">&times;</button>
            </div>
            <form @submit.prevent="handleInventorySubmit" class="modal-form-body">
                <div class="product-summary-context">
                    <span class="label">Product:</span>
                    <span class="value">{{ selectedItem?.productId?.name }}</span>
                </div>

                <div class="mode-selection-tabs">
                    <button
                        type="button"
                        class="mode-tab-btn"
                        :class="{ active: updateMode === 'set' }"
                        @click="updateMode = 'set'; inputQuantity = selectedItem.quantity;"
                    >
                        Set Value
                    </button>
                    <button
                        type="button"
                        class="mode-tab-btn"
                        :class="{ active: updateMode === 'adjust' }"
                        @click="updateMode = 'adjust'; inputQuantity = 0;"
                    >
                        Adjust
                    </button>
                </div>

                <div class="input-group-layout">
                    <label v-if="updateMode === 'set'" for="modal-qty">Set Quantity To</label>
                    <label v-else for="modal-qty">Adjustment Amount</label>

                    <input
                        id="modal-qty"
                        type="number"
                        v-model.number="inputQuantity"
                        required
                    />

                    <small class="form-context-text">
                        <span v-if="updateMode === 'set'">
                            Stock will be set to <strong>{{ inputQuantity }} units</strong>.
                        </span>
                        <span v-else>
                            <strong>{{ selectedItem?.quantity }}</strong>
                            {{ inputQuantity >= 0 ? '+' : '' }}
                            <strong>{{ inputQuantity }}</strong> =
                            <strong>{{ (selectedItem?.quantity ?? 0) + inputQuantity }} units</strong> remaining.
                        </span>
                    </small>
                </div>

                <div class="modal-action-footer">
                    <button type="button" class="btn-ghost" @click="closeModal" :disabled="isSubmitting">
                        Cancel
                    </button>
                    <button type="submit" class="btn-primary" :disabled="isSubmitting">
                        <span v-if="isSubmitting">Saving...</span>
                        <span v-else>Confirm</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
/* ── LAYOUT ── */
.admin-wrapper { display: flex; min-height: 100vh; background: #faf9fc; font-family: 'Inter', sans-serif; flex-direction: row; }

/* ── SIDEBAR ── */
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

/* ── MAIN ── */
.admin-main { flex: 1; padding: 2.5rem 3rem; overflow-y: auto; transition: width 0.3s ease; }
.main-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
.page-title { font-family: 'Yanone Kaffeesatz', sans-serif; font-size: 2.5rem; font-weight: 700; color: #1a1a1a; margin: 0 0 0.2rem 0; }
.page-sub { font-size: 0.9rem; color: #6b7280; margin: 0; }
.header-actions { display: flex; gap: 1rem; }

/* ── UTILITY BAR ── */
.utility-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
.search-box { position: relative; flex: 1; max-width: 400px; }
.search-box i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #9ca3af; }
.search-box input { width: 100%; padding: 0.65rem 1rem 0.65rem 2.5rem; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 0.9rem; outline: none; transition: all 0.2s; }
.search-box input:focus { border-color: #3d0300; box-shadow: 0 0 0 3px rgba(61, 3, 0, 0.05); }

/* ── BUTTONS ── */
.btn-primary { background: #3d0300; color: #ffffff; border: none; padding: 0.7rem 1.4rem; border-radius: 10px; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s ease; }
.btn-primary:hover:not(:disabled) { background: #ee807b; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(238, 128, 123, 0.3); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-ghost { background: transparent; color: #3d0300; border: 1.5px solid #d1d5db; padding: 0.7rem 1.4rem; border-radius: 10px; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; text-decoration: none; transition: all 0.2s ease; }
.btn-ghost:hover:not(:disabled) { border-color: #3d0300; background: rgba(61, 3, 0, 0.04); }
.btn-ghost:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── TABLE ── */
.content-card { background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); padding: 0; overflow: hidden; }
.table-responsive { width: 100%; overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; text-align: left; }
.admin-table th { background: #ffffff; padding: 1.2rem 1.5rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; border-bottom: 2px solid #f3f4f6; }
.admin-table td { padding: 1.2rem 1.5rem; font-size: 0.9rem; color: #374151; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
.admin-table tbody tr:nth-child(even) { background-color: #f8f9fa; }
.admin-table tbody tr:hover { background-color: #f1f5f9; }
.admin-table tbody tr:last-child td { border-bottom: none; }

/* ── TYPOGRAPHY UTILITIES ── */
.text-dark { color: #1a1a1a; }
.text-muted { color: #6b7280; }
.fw-semibold { font-weight: 600; }
.fw-medium { font-weight: 500; }
.fw-bold { font-weight: 700; }
.align-right { text-align: right; }
.hide-mobile { display: table-cell; }
.img-preview-box { width: 36px; height: 36px; border-radius: 6px; overflow: hidden; background: #f3f4f6; display: flex; align-items: center; justify-content: center; border: 1px solid #e5e7eb; flex-shrink: 0; }
.img-preview-box img { width: 100%; height: 100%; object-fit: cover; }
.monospace-code { font-family: monospace; background: #f1f5f9; padding: 0.15rem 0.35rem; border-radius: 4px; font-size: 0.8rem !important; }

/* ── STOCK BADGES ── */
.stock-badge { display: inline-flex; align-items: center; padding: 0.35rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 600; }
.stock-badge.badge-out { background: #fee2e2; color: #dc2626; }
.stock-badge.badge-low { background: #fef3c7; color: #d97706; }
.stock-badge.badge-stable { background: #e0f2fe; color: #0369a1; }

/* ── ACTION BUTTONS ── */
.action-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1rem; transition: all 0.2s ease; background: #ffffff; color: #6b7280; }
.action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.action-btn.inventory-edit-btn:hover:not(:disabled) { background: #faf5ff; color: #9333ea; border-color: #e9d5ff; }

/* ── EMPTY STATE ── */
.empty-state { text-align: center; padding: 4rem 2rem !important; color: #9ca3af; background: #ffffff !important; }
.empty-state i { font-size: 3rem; color: #e5e7eb; margin-bottom: 1rem; display: block; }

/* ── PAGINATION ── */
.pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 1.25rem 1.5rem; border-top: 1px solid #f3f4f6; background: #ffffff; }
.page-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 500; color: #3d0300; background: #ffffff; border: 1.5px solid #d1d5db; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; }
.page-btn:hover:not(:disabled) { border-color: #3d0300; background: rgba(61, 3, 0, 0.04); }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-numbers { display: flex; gap: 0.35rem; }
.page-num { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 500; color: #374151; background: #ffffff; border: 1.5px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; }
.page-num:hover { border-color: #3d0300; color: #3d0300; }
.page-num.active { background: #3d0300; color: #ffffff; border-color: #3d0300; }
.page-ellipsis { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; color: #9ca3af; }

/* ── SPIN LOADER ── */
.spin-loader { animation: rotatingLoader 1s linear infinite; display: inline-block; }
@keyframes rotatingLoader { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* ── MODAL ── */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.4); z-index: 9999; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(2px); }
.modal-window { background: #ffffff; width: 100%; max-width: 460px; border-radius: 16px; box-shadow: 0 12px 36px rgba(0, 0, 0, 0.15); overflow: hidden; animation: animatePanelUp 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes animatePanelUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.modal-header-block { background: #3d0300; color: #ffffff; padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center; }
.modal-header-block h3 { margin: 0; font-size: 1.15rem; font-weight: 600; }
.close-modal-btn { background: none; border: none; color: #ffffff; font-size: 1.75rem; cursor: pointer; opacity: 0.8; line-height: 1; }
.close-modal-btn:hover { opacity: 1; }
.modal-form-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
.product-summary-context { background: #faf9fc; border: 1px dashed #d1d5db; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.9rem; }
.product-summary-context .label { color: #6b7280; margin-right: 0.5rem; font-weight: 500; }
.product-summary-context .value { color: #1a1a1a; font-weight: 600; }
.mode-selection-tabs { display: flex; background: #f3f4f6; padding: 0.25rem; border-radius: 8px; gap: 0.25rem; }
.mode-tab-btn { flex: 1; padding: 0.5rem; border: none; font-size: 0.85rem; font-weight: 600; border-radius: 6px; cursor: pointer; color: #4b5563; background: transparent; transition: all 0.15s; }
.mode-tab-btn.active { background: #ffffff; color: #3d0300; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
.input-group-layout { display: flex; flex-direction: column; gap: 0.4rem; }
.input-group-layout label { font-size: 0.85rem; font-weight: 600; color: #374151; }
.input-group-layout input { padding: 0.65rem 1rem; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 1rem; outline: none; transition: border 0.2s; }
.input-group-layout input:focus { border-color: #3d0300; }
.form-context-text { font-size: 0.75rem; color: #6b7280; line-height: 1.4; }
.modal-action-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
    .admin-main { padding: 1.5rem; }
    .hide-mobile { display: none; }
}
</style>