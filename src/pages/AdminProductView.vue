<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import CreateProductComponent from '../components/CreateProductComponent.vue';
import UpdateProductComponent from '../components/UpdateProductComponent.vue';
import AdminSidebar from '../components/AdminSidebar.vue';
import { 
    getAllProducts, 
    archiveProduct, 
    activateProduct, 
    getAllStock, 
    getErrorMessage 
} from '../services/api.js';


// ——— Products State ———
const products = ref([]);
const activeView = ref(null);
const selectedProduct = ref(null);
const stocks = ref([]);

// Sidebar Toggle State
const isSidebarOpen = ref(true);

// Pagination States
const itemsPerPage = 10;
const currentPage = ref(1);

// ——— Helpers ———
function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value;
}

function getStockForProduct(productId) {
    const stock = stocks.value.find(s => s.productId?._id === productId);
    return stock ? stock.quantity : 0; // Returning 0 instead of 'N/A' keeps column data numeric
}

async function loadProducts() {
    try {
        [products.value, stocks.value] = await Promise.all([
            getAllProducts(),
            getAllStock()
        ]);
        currentPage.value = 1;
    } catch (err) {
        console.error('Failed to load product data:', getErrorMessage(err));
    }
}

const sortBy = ref('name'); // Default sort field
const sortOrder = ref('asc'); // Default order

function handleSort(field) {
    if (sortBy.value === field) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortBy.value = field;
        sortOrder.value = 'asc';
    }
}

const sortedProducts = computed(() => {
    const items = [...products.value];
    
    return items.sort((a, b) => {
        let modifier = sortOrder.value === 'asc' ? 1 : -1;
        
        if (sortBy.value === 'name') {
            return (a.name || '').localeCompare(b.name || '') * modifier;
        }
        
        if (sortBy.value === 'stock') {
            // Find stock records directly to avoid parsing the 'N/A' string
            const stockRecordA = stocks.value.find(s => s.productId?._id === a._id);
            const stockRecordB = stocks.value.find(s => s.productId?._id === b._id);
            
            const stockA = stockRecordA ? Number(stockRecordA.quantity) : 0;
            const stockB = stockRecordB ? Number(stockRecordB.quantity) : 0;
            
            return (stockA - stockB) * modifier;
        }
        
        if (sortBy.value === 'status') {
            const statusA = a.isActive ? 1 : 0;
            const statusB = b.isActive ? 1 : 0;
            return (statusB - statusA) * modifier;
        }
        
        return 0;
    });
});

// ——— Products Pagination Logic ———
const totalPages = computed(() => Math.ceil(products.value.length / itemsPerPage));

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

const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return sortedProducts.value.slice(start, start + itemsPerPage);
});

function goToPage(page) {
    if (typeof page === 'number' && page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
}
function prevPage() { goToPage(currentPage.value - 1); }
function nextPage() { goToPage(currentPage.value + 1); }

// ——— View Switching ———
function showView(view, product = null) {
    activeView.value = view;
    selectedProduct.value = product;
}

async function onDone() {
    showView(null);
    await loadProducts();
}

// ——— Archive / Activate Product ———
async function handleDisable(productId) {
    if (!confirm('Are you sure you want to disable this product?')) return;
    try {
        await archiveProduct(productId);
        await loadProducts();
    } catch (err) {
        console.error('Failed to disable product:', getErrorMessage(err));
    }
}

async function handleActivate(productId) {
    if (!confirm('Are you sure you want to activate this product?')) return;
    try {
        await activateProduct(productId);
        await loadProducts();
    } catch (err) {
        console.error('Failed to activate product:', getErrorMessage(err));
    }
}

// ——— On Mount ———
onMounted(async () => {
    if (window.innerWidth <= 992) {
        isSidebarOpen.value = false;
    }
    await loadProducts();
});
</script>

<template>
    <div class="admin-wrapper">

        <AdminSidebar />

        <main class="admin-main">
            <header class="main-header">
                <div class="header-titles">
                    <h1 class="page-title">
                        {{ activeView === null ? 'Product Management' : (activeView === 'create' ? 'Add New Product' : 'Update Product') }}
                    </h1>
                    <p class="page-sub">
                        Manage your inventory, pricing, and stock levels.
                    </p>
                </div>

                <div class="header-actions">
                    <RouterLink to="/admin/orders" class="btn-ghost">
                        <i class="bi bi-receipt"></i> View Orders
                    </RouterLink>
                    <button v-if="activeView === null" class="btn-primary" @click="showView('create')">
                        <i class="bi bi-plus-lg"></i> Add Product
                    </button>
                    <button v-else class="btn-ghost" @click="showView(null)">
                        <i class="bi bi-arrow-left"></i> Back to List
                    </button>
                </div>
            </header>

            <div>
                <div v-if="activeView === null" class="content-card">
                    <div class="table-responsive">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th @click="handleSort('name')" style="cursor: pointer; user-select: none;">
                                        Product Name 
                                        <i class="bi" :class="sortBy === 'name' ? (sortOrder === 'asc' ? 'bi-sort-alpha-down' : 'bi-sort-alpha-down-alt') : 'bi-arrow-down-up'" style="font-size: 0.8rem; margin-left: 0.25rem;"></i>
                                    </th>
                                    <th class="hide-mobile">Description</th>
                                    <th class="hide-mobile">Price</th>
                                    <th @click="handleSort('stock')" style="cursor: pointer; user-select: none;">
                                        Stock 
                                        <i class="bi" :class="sortBy === 'stock' ? (sortOrder === 'asc' ? 'bi-sort-numeric-down' : 'bi-sort-numeric-up-alt') : 'bi-arrow-down-up'" style="font-size: 0.8rem; margin-left: 0.25rem;"></i>
                                    </th>
                                    <th @click="handleSort('status')" style="cursor: pointer; user-select: none;">
                                        Status 
                                        <i class="bi" :class="sortBy === 'status' ? (sortOrder === 'asc' ? 'bi-filter-square' : 'bi-filter-square-fill') : 'bi-arrow-down-up'" style="font-size: 0.8rem; margin-left: 0.25rem;"></i>
                                    </th>
                                    <th class="align-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="product in paginatedProducts" :key="product._id">
                                    <td class="fw-semibold text-dark">
                                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                                            <div style="width: 40px; height: 40px; border-radius: 6px; overflow: hidden; background: #f3f4f6; display: flex; align-items: center; justify-content: center; border: 1px solid #e5e7eb; flex-shrink: 0;">
                                                <img 
                                                    v-if="product.imageUrl" 
                                                    :src="product.imageUrl" 
                                                    :alt="product.name"
                                                    style="width: 100%; height: 100%; object-fit: cover;"
                                                />
                                                <i v-else class="bi bi-image" style="color: #9ca3af; font-size: 1.2rem;"></i>
                                            </div>
                                            <span>{{ product.name }}</span>
                                        </div>
                                    </td>
                                    <td class="hide-mobile text-muted truncate-text" :title="product.description">
                                        {{ product.description }}
                                    </td>
                                    <td class="fw-medium">₱{{ product.price }}</td>
                                    <td>
                                        <span class="stock-indicator" :class="{ 'low-stock': getStockForProduct(product._id) < 10 }">
                                            {{ getStockForProduct(product._id) }}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="status-badge" :class="product.isActive ? 'active' : 'inactive'">
                                            {{ product.isActive ? 'Active' : 'Inactive' }}
                                        </span>
                                    </td>
                                    <td class="align-right">
                                        <div class="action-group">
                                            <button class="action-btn edit" @click="showView('update', product)" title="Edit Product">
                                                <i class="bi bi-pencil-square"></i>
                                            </button>
                                            <button v-if="product.isActive" class="action-btn disable" @click="handleDisable(product._id)" title="Disable Product">
                                                <i class="bi bi-archive"></i>
                                            </button>
                                            <button v-else class="action-btn activate" @click="handleActivate(product._id)" title="Activate Product">
                                                <i class="bi bi-check-circle"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-if="products.length === 0">
                                    <td colspan="6" class="empty-state">
                                        <i class="bi bi-box"></i>
                                        <p>No products found. Click "Add Product" to create one.</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

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

                <div v-if="activeView === 'create'" class="content-card form-wrapper">
                    <CreateProductComponent @done="onDone" />
                </div>
                <div v-if="activeView === 'update'" class="content-card form-wrapper">
                    <UpdateProductComponent
                        :product="selectedProduct"
                        :currentStock="getStockForProduct(selectedProduct._id)"
                        @done="onDone"
                    />
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
/* ==========================================================================
   LAYOUT HOUSING & ALIGNMENT FIXES
   ========================================================================== */
.admin-wrapper { 
    display: flex; 
    min-height: 100vh; /* Removed the - 90px calculation */
    background: #faf9fc; 
    font-family: 'Inter', sans-serif; 
    margin-top: 0; /* Changed from 90px to 0 to remove the gap */
    flex-direction: row; 
    width: 100%;
}

.admin-sidebar { 
    width: 260px; 
    background: #3d0300; 
    color: #ffffff; 
    display: flex; 
    flex-direction: column; 
    flex-shrink: 0; 
    position: relative; 
    min-height: 100vh; /* Removed the - 90px calculation */
    z-index: 10; 
    transition: width 0.3s ease; 
    overflow-x: hidden; 
}

.admin-main { 
    flex: 1; 
    padding: 2.5rem 3rem; 
    max-height: 100vh; /* Removed the - 90px calculation */
    overflow-y: auto; 
    transition: width 0.3s ease; 
}

/* ==========================================================================
   UNCHANGED STYLES BASED EXACTLY ON YOUR PATTERNS
   ========================================================================== */
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

.main-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
.page-title { font-family: 'Yanone Kaffeesatz', sans-serif; font-size: 2.5rem; font-weight: 700; color: #1a1a1a; margin: 0 0 0.2rem 0; }
.page-sub { font-size: 0.9rem; color: #6b7280; margin: 0; }
.header-actions { display: flex; gap: 1rem; }

/* Utility layout components inside Stock tracking views */
.utility-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; width: 100%; }
.search-box { position: relative; flex: 1; max-width: 400px; }
.search-box i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #9ca3af; }
.search-box input { width: 100%; padding: 0.65rem 1rem 0.65rem 2.5rem; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 0.9rem; outline: none; transition: all 0.2s; }
.search-box input:focus { border-color: #3d0300; box-shadow: 0 0 0 3px rgba(61, 3, 0, 0.05); }
.img-preview-box { width: 40px; height: 40px; border-radius: 8px; overflow: hidden; background: #f3f4f6; display: flex; align-items: center; justify-content: center; border: 1px solid #e5e7eb; flex-shrink: 0; }
.img-preview-box img { width: 100%; height: 100%; object-fit: cover; }
.monospace-code { font-family: monospace; background: #f1f5f9; padding: 0.15rem 0.35rem; border-radius: 4px; font-size: 0.8rem !important; }

.btn-primary { background: #3d0300; color: #ffffff; border: none; padding: 0.7rem 1.4rem; border-radius: 10px; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s ease; }
.btn-primary:hover:not(:disabled) { background: #ee807b; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(238, 128, 123, 0.3); color: #ffffff; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
.btn-ghost { background: transparent; color: #3d0300; border: 1.5px solid #d1d5db; padding: 0.7rem 1.4rem; border-radius: 10px; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s ease; }
.btn-ghost:hover:not(:disabled) { border-color: #3d0300; background: rgba(61, 3, 0, 0.04); }
.btn-ghost:disabled { opacity: 0.6; cursor: not-allowed; }

/* Spin Matrix Loader rulesets */
.spin-loader { animation: rotatingLoader 1s linear infinite; display: inline-block; }
@keyframes rotatingLoader {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.content-card { background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); padding: 0; overflow: hidden; }
.form-wrapper { padding: 2rem; }
.table-responsive { width: 100%; overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; text-align: left; }
.admin-table th { background: #ffffff; padding: 1.2rem 1.5rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; border-bottom: 2px solid #f3f4f6; }
.admin-table td { padding: 1.2rem 1.5rem; font-size: 0.9rem; color: #374151; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
.admin-table tbody tr:nth-child(even) { background-color: #f8f9fa; }
.admin-table tbody tr:hover { background-color: #f1f5f9; }
.admin-table tbody tr:last-child td { border-bottom: none; }

.truncate-text { max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.text-dark { color: #1a1a1a; }
.text-muted { color: #6b7280; }
.fw-semibold { font-weight: 600; }
.fw-medium { font-weight: 500; }
.fw-bold { font-weight: 700; }
.align-right { text-align: right; }

/* Custom Stock Configuration State Badges */
.stock-badge { display: inline-flex; align-items: center; padding: 0.35rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 600; }
.stock-badge.badge-out { background: #fee2e2; color: #dc2626; }
.stock-badge.badge-low { background: #fef3c7; color: #d97706; }
.stock-badge.badge-stable { background: #e0f2fe; color: #0369a1; }

.action-group { display: flex; gap: 0.5rem; justify-content: flex-end; }
.action-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1rem; transition: all 0.2s ease; background: #ffffff; color: #6b7280; }
.action-btn.edit:hover { background: #e0f2fe; color: #0284c7; border-color: #bae6fd; }
.action-btn.inventory-edit-btn:hover { background: #faf5ff; color: #9333ea; border-color: #e9d5ff; }

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

/* ── MODAL FLOATING UX PATTERNS ── */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.4); z-index: 9999; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(2px); }
.modal-window { background: #ffffff; width: 100%; max-width: 460px; border-radius: 16px; box-shadow: 0 12px 36px rgba(0, 0, 0, 0.15); overflow: hidden; animation: animatePanelUp 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes animatePanelUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.modal-header-block { background: #3d0300; color: #ffffff; padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center; }
.modal-header-block h3 { margin: 0; font-size: 1.15rem; font-weight: 600; }
.close-modal-btn { background: none; border: none; color: #ffffff; font-size: 1.75rem; cursor: pointer; opacity: 0.8; line-height: 1; }
.close-modal-btn:hover { opacity: 1; }
.modal-form-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; text-align: left; }
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

@media (max-width: 768px) {
    .admin-main { padding: 1.5rem; }
    .hide-mobile { display: none; }
}

</style>