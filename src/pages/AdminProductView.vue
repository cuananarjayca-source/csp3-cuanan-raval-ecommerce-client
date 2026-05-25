<script setup>
import { ref, computed, onMounted } from 'vue';
import CreateProductComponent from '../components/CreateProductComponent.vue';
import UpdateProductComponent from '../components/UpdateProductComponent.vue';
import { getAllProducts, archiveProduct, activateProduct, getAllStock, getErrorMessage } from '../services/api.js';
import { RouterLink } from 'vue-router';

// ——— State ———
const products = ref([]);
const activeView = ref(null);
const selectedProduct = ref(null);
const stocks = ref([]);

// Sidebar Toggle State
const isSidebarOpen = ref(true);

// Pagination State
const currentPage = ref(1);
const itemsPerPage = 10;

// ——— Helpers ———
function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value;
}

function getStockForProduct(productId) {
    const stock = stocks.value.find(s => s.productId._id === productId);
    return stock ? stock.quantity : 'N/A';
}

async function loadProducts() {
    try {
        [products.value, stocks.value] = await Promise.all([
            getAllProducts(),
            getAllStock()
        ]);
        currentPage.value = 1;
    } catch (err) {
        console.error('Failed to load data:', getErrorMessage(err));
    }
}

// ——— Pagination ———
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
    return products.value.slice(start, start + itemsPerPage);
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

// ——— Archive / Activate ———
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

        <!-- ── SIDEBAR ── -->
        <aside class="admin-sidebar" :class="{ 'closed': !isSidebarOpen }">

            <div class="sidebar-header">
                <div class="sidebar-brand" v-if="isSidebarOpen">
                    <span class="brand-p">TARO</span><span class="brand-s">&nbsp;606</span>
                </div>
                <button class="toggle-btn" @click="toggleSidebar" aria-label="Toggle Sidebar">
                    <i class="bi bi-list"></i>
                </button>
            </div>

            <nav class="sidebar-nav">
                <a href="#" class="nav-item active" title="Products">
                    <i class="bi bi-box-seam"></i>
                    <span class="nav-text">Products</span>
                </a>
                <a href="#" class="nav-item" title="Orders">
                    <i class="bi bi-receipt"></i>
                    <span class="nav-text">Orders</span>
                </a>
                <a href="#" class="nav-item" title="Customers">
                    <i class="bi bi-people"></i>
                    <span class="nav-text">Customers</span>
                </a>
                <a href="#" class="nav-item" title="Settings">
                    <i class="bi bi-gear"></i>
                    <span class="nav-text">Settings</span>
                </a>
                
                <RouterLink  
                    to="/logout" 
                    class="nav-item logout-item" 
                    title="Logout"
                    @click="closeOffcanvas"
                >
                    <i class="bi bi-box-arrow-right"></i>
                    <span class="nav-text">Logout</span>
                </RouterLink>
            </nav>

            <div class="sidebar-footer">
                <div class="admin-profile" title="Admin User">
                    <i class="bi bi-person-circle"></i>
                    <span class="profile-text">Admin User</span>
                </div>
            </div>
        </aside>

        <!-- ── MAIN CONTENT ── -->
        <main class="admin-main">

            <header class="main-header">
                <div class="header-titles">
                    <h1 class="page-title">
                        {{ activeView === null ? 'Product Management' : (activeView === 'create' ? 'Add New Product' : 'Update Product') }}
                    </h1>
                    <p class="page-sub">Manage your inventory, pricing, and stock levels.</p>
                </div>

                <div v-if="activeView === null" class="header-actions">
                    <button class="btn-ghost">
                        <i class="bi bi-receipt"></i> View Orders
                    </button>
                    <button class="btn-primary" @click="showView('create')">
                        <i class="bi bi-plus-lg"></i> Add Product
                    </button>
                </div>
                <div v-else class="header-actions">
                    <button class="btn-ghost" @click="showView(null)">
                        <i class="bi bi-arrow-left"></i> Back to List
                    </button>
                </div>
            </header>

            <!-- Table View -->
            <div v-if="activeView === null" class="content-card">
                <div class="table-responsive">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th class="hide-mobile">Description</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th class="align-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="product in paginatedProducts" :key="product._id">
                                <td class="fw-semibold text-dark">{{ product.name }}</td>
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
                                            Update
                                        </button>
                                        <button v-if="product.isActive" class="action-btn disable" @click="handleDisable(product._id)" title="Disable Product">
                                            Disable
                                        </button>
                                        <button v-else class="action-btn activate" @click="handleActivate(product._id)" title="Activate Product">
                                            Activate
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

            <!-- Create / Update Component Wrappers -->
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

        </main>
    </div>
</template>

<style scoped>
/* ── LAYOUT ── */
.admin-wrapper {
    display: flex;
    min-height: 100vh;
    background: #faf9fc;
    font-family: 'Inter', sans-serif;
    flex-direction: row;
}
/* ── SIDEBAR ── */
.admin-sidebar {
    width: 260px;
    background: #3d0300;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    position: relative;
    min-height: 100vh;
    z-index: 10;
    transition: width 0.3s ease;
    overflow-x: hidden;
}
.admin-sidebar.closed { width: 80px; }
.sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 1.25rem;
    height: 80px;
}
.admin-sidebar.closed .sidebar-header { justify-content: center; }
.sidebar-brand {
    font-family: 'Yanone Kaffeesatz', sans-serif;
    font-size: 2.2rem;
    font-weight: 700;
    letter-spacing: 1px;
    line-height: 1;
    white-space: nowrap;
}
.brand-p { color: #ffffff; }
.brand-s { color: #ee807b; }
.toggle-btn {
    background: transparent;
    border: none;
    color: #ffffff;
    font-size: 1.8rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}
.toggle-btn:hover { color: #ee807b; }
.sidebar-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0 1rem;
}
.admin-sidebar.closed .sidebar-nav { padding: 0 0.5rem; }
.nav-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.85rem 1rem;
    color: #d1d5db;
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 500;
    border-radius: 8px;
    transition: all 0.2s ease;
    white-space: nowrap;
}
.nav-item i { font-size: 1.3rem; min-width: 24px; text-align: center; }
.nav-item:hover { background: rgba(255, 255, 255, 0.08); color: #ffffff; }
.nav-item.active { background: rgba(238, 128, 123, 0.15); color: #ee807b; font-weight: 600; }
.admin-sidebar.closed .nav-item { justify-content: center; padding: 0.85rem 0; }
.admin-sidebar.closed .nav-text { display: none; }
.sidebar-footer {
    padding: 1.5rem 1.25rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.admin-profile {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.9rem;
    font-weight: 500;
    color: #e5e7eb;
    white-space: nowrap;
}
.admin-profile i { font-size: 1.5rem; color: #ee807b; }
.admin-sidebar.closed .sidebar-footer { padding: 1.5rem 0; }
.admin-sidebar.closed .admin-profile { justify-content: center; }
.admin-sidebar.closed .profile-text { display: none; }
/* ── MAIN CONTENT ── */
.admin-main {
    flex: 1;
    padding: 2.5rem 3rem;
    overflow-y: auto;
    transition: width 0.3s ease;
}
.main-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}
.page-title {
    font-family: 'Yanone Kaffeesatz', sans-serif;
    font-size: 2.5rem;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 0.2rem 0;
}
.page-sub { font-size: 0.9rem; color: #6b7280; margin: 0; }
.header-actions { display: flex; gap: 1rem; }
/* ── BUTTONS ── */
.btn-primary {
    background: #3d0300;
    color: #ffffff;
    border: none;
    padding: 0.7rem 1.4rem;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
}
.btn-primary:hover {
    background: #ee807b;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(238, 128, 123, 0.3);
}
.btn-ghost {
    background: transparent;
    color: #3d0300;
    border: 1.5px solid #d1d5db;
    padding: 0.7rem 1.4rem;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
}
.btn-ghost:hover { border-color: #3d0300; background: rgba(61, 3, 0, 0.04); }
/* ── CARDS & TABLES ── */
.content-card {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    padding: 0;
    overflow: hidden;
}
.form-wrapper { padding: 2rem; }
.table-responsive { width: 100%; overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; text-align: left; }
.admin-table th {
    background: #ffffff;
    padding: 1.2rem 1.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
    border-bottom: 2px solid #f3f4f6;
}
.admin-table td {
    padding: 1.2rem 1.5rem;
    font-size: 0.9rem;
    color: #374151;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: middle;
}
.admin-table tbody tr:nth-child(even) { background-color: #f8f9fa; }
.admin-table tbody tr:hover { background-color: #f1f5f9; }
.admin-table tbody tr:last-child td { border-bottom: none; }
.truncate-text {
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.text-dark { color: #1a1a1a; }
.text-muted { color: #6b7280; }
.fw-semibold { font-weight: 600; }
.fw-medium { font-weight: 500; }
.align-right { text-align: right; }
/* ── STATUS & STOCK ── */
.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.35rem 0.75rem;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 600;
}
.status-badge.active { background: #d1fae5; color: #059669; }
.status-badge.inactive { background: #fee2e2; color: #dc2626; }
.stock-indicator { font-weight: 600; }
.stock-indicator.low-stock { color: #ef4444; }
/* ── ACTION BUTTONS ── */
.action-group { display: flex; gap: 0.5rem; justify-content: flex-end; }
.action-btn {
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
    border-radius: 8px;
    border: 1.5px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;
}
.action-btn.edit:hover { background: #e0f2fe; color: #0284c7; border-color: #bae6fd; }
.action-btn.disable:hover { background: #fee2e2; color: #ef4444; border-color: #fecaca; }
.action-btn.activate:hover { background: #dcfce7; color: #16a34a; border-color: #bbf7d0; }
/* ── EMPTY STATE ── */
.empty-state {
    text-align: center;
    padding: 4rem 2rem !important;
    color: #9ca3af;
    background: #ffffff !important;
}
.empty-state i { font-size: 3rem; color: #e5e7eb; margin-bottom: 1rem; display: block; }
/* ── PAGINATION ── */
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    border-top: 1px solid #f3f4f6;
    background: #ffffff;
}
.page-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    font-weight: 500;
    color: #3d0300;
    background: #ffffff;
    border: 1.5px solid #d1d5db;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}
.page-btn:hover:not(:disabled) { border-color: #3d0300; background: rgba(61, 3, 0, 0.04); }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-numbers { display: flex; gap: 0.35rem; }
.page-num {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-weight: 500;
    color: #374151;
    background: #ffffff;
    border: 1.5px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}
.page-num:hover { border-color: #3d0300; color: #3d0300; }
.page-num.active { background: #3d0300; color: #ffffff; border-color: #3d0300; }
.page-ellipsis {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    color: #9ca3af;
    user-select: none;
}
/* ── RESPONSIVENESS ── */
@media (max-width: 992px) {
    .admin-wrapper { padding-top: 80px; flex-direction: row; }
    .admin-sidebar { position: relative; }
    .admin-sidebar.closed { width: 80px; }
}
@media (max-width: 768px) {
    .hide-mobile { display: none; }
    .main-header { flex-direction: column; align-items: flex-start; }
    .header-actions { width: 100%; justify-content: space-between; }
}
@media (max-width: 576px) {
    .pagination { flex-wrap: wrap; gap: 0.75rem; }
    .page-numbers { order: -1; width: 100%; justify-content: center; }
    .admin-main { padding: 1.5rem 1rem; }
}
</style>