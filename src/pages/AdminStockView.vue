<script setup>
import { ref, computed, onMounted } from 'vue';
import { getAllStock, updateStock, adjustStock, getErrorMessage } from '../services/api.js';

// ——— State Management ———
const stocks = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');

// Modal Window Actions State
const isModalOpen = ref(false);
const selectedItem = ref(null);
const updateMode = ref('set'); 
const inputQuantity = ref(0);
const isSubmitting = ref(false);

// Pagination States
const itemsPerPage = 10;
const currentPage = ref(1);

// ——— Load Base Data ———
async function loadInventory() {
    isLoading.value = true;
    try {
        stocks.value = await getAllStock();
    } catch (err) {
        console.error('Failed to download inventory:', getErrorMessage(err));
    } finally {
        isLoading.value = false;
    }
}

// ——— Search Filter Logic ———
const filteredStocks = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();
    if (!query) return stocks.value;
    return stocks.value.filter(item => 
        item.productId?.name?.toLowerCase().includes(query)
    );
});

// ——— Pagination Logic ———
const totalPages = computed(() => Math.ceil(filteredStocks.value.length / itemsPerPage));

const paginatedStocks = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return filteredStocks.value.slice(start, start + itemsPerPage);
});

function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
}

// ——— Modal State Controls ———
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

// ——— Handle Database Updates ———
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
                throw new Error('Adjustment operations cannot result in negative baseline quantities.');
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

onMounted(async () => {
    await loadInventory();
});
</script>

<template>
    <div class="view-panel-wrapper">
        <header class="main-header">
            <div>
                <h1 class="page-title">Inventory Control</h1>
                <p class="page-sub">Monitor and process adjustments across active warehouse matrix listings.</p>
            </div>
        </header>

        <div class="utility-bar">
            <div class="search-box">
                <i class="bi bi-search"></i>
                <input 
                    type="text" 
                    v-model="searchQuery" 
                    placeholder="Search ledger by item variants..." 
                    @input="currentPage = 1"
                />
            </div>
            <button class="btn-ghost" @click="loadInventory" :disabled="isLoading">
                <i class="bi bi-arrow-clockwise" :class="{ 'spin-loader': isLoading }"></i> Sync Baseline
            </button>
        </div>

        <div class="content-card">
            <div class="table-responsive">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Item Definition Context</th>
                            <th class="hide-mobile">DB Object ID</th>
                            <th class="hide-mobile">Price Factor</th>
                            <th>Active Ledger Count</th>
                            <th>Critical State</th>
                            <th class="align-right">Modify</th>
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
                                    <span>{{ item.productId?.name ?? 'Discontinued Inventory Object' }}</span>
                                </div>
                            </td>
                            <td class="hide-mobile text-muted monospace-code">{{ item.productId?._id ?? 'N/A' }}</td>
                            <td class="hide-mobile fw-medium">₱{{ item.productId?.price ?? '0.00' }}</td>
                            <td class="fw-bold text-dark">{{ item.quantity }} units</td>
                            <td>
                                <span v-if="item.quantity === 0" class="stock-badge badge-out">Out of Stock</span>
                                <span v-else-if="item.quantity < 10" class="stock-badge badge-low">Critical Low</span>
                                <span v-else class="stock-badge badge-stable">Stable Inventory</span>
                            </td>
                            <td class="align-right">
                                <button 
                                    class="action-btn inventory-edit-btn" 
                                    @click="openModal(item)"
                                    title="Open Inventory Control Matrix"
                                    :disabled="!item.productId"
                                >
                                    <i class="bi bi-sliders"></i>
                                </button>
                            </td>
                        </tr>
                        <tr v-if="filteredStocks.length === 0 && !isLoading">
                            <td colspan="6" class="empty-state">
                                <i class="bi bi-layers-half"></i>
                                <p>No registered product stock configuration variants detected matching queries.</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="totalPages > 1" class="pagination">
                <button class="page-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
                    <i class="bi bi-chevron-left"></i> Previous
                </button>
                <div class="page-numbers">
                    <button 
                        v-for="page in totalPages" 
                        :key="page" 
                        class="page-num"
                        :class="{ active: page === currentPage }"
                        @click="goToPage(page)"
                    >
                        {{ page }}
                    </button>
                </div>
                <button class="page-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
                    Next <i class="bi bi-chevron-right"></i>
                </button>
            </div>
        </div>

        <div class="modal-overlay" v-if="isModalOpen" @click.self="closeModal">
            <div class="modal-window">
                <div class="modal-header-block">
                    <h3>Inventory Manipulation Window</h3>
                    <button class="close-modal-btn" @click="closeModal">&times;</button>
                </div>
                <form @submit.prevent="handleInventorySubmit" class="modal-form-body">
                    <div class="product-summary-context">
                        <span class="label">Item Reference Scope:</span>
                        <span class="value">{{ selectedItem?.productId?.name }}</span>
                    </div>

                    <div class="mode-selection-tabs">
                        <button 
                            type="button" 
                            class="mode-tab-btn" 
                            :class="{ active: updateMode === 'set' }"
                            @click="updateMode = 'set'; inputQuantity = selectedItem.quantity;"
                        >
                            Override Value
                        </button>
                        <button 
                            type="button" 
                            class="mode-tab-btn" 
                            :class="{ active: updateMode === 'adjust' }"
                            @click="updateMode = 'adjust'; inputQuantity = 0;"
                        >
                            Incremental Math
                        </button>
                    </div>
                    
                    <div class="input-group-layout">
                        <label v-if="updateMode === 'set'" for="modal-qty">Absolute Target Stock Level</label>
                        <label v-else for="modal-qty">Relative Adjustment Multiplier</label>
                        
                        <input 
                            id="modal-qty"
                            type="number" 
                            v-model.number="inputQuantity" 
                            required
                        />
                        
                        <small class="form-context-text">
                            <span v-if="updateMode === 'set'">
                                Current configuration resets active inventory database rows explicitly to <strong>{{ inputQuantity }} units</strong>.
                            </span>
                            <span v-else>
                                Modifies database baseline cleanly by tracking operations: 
                                <strong>{{ selectedItem?.quantity }}</strong> 
                                {{ inputQuantity >= 0 ? '+' : '' }} 
                                <strong>{{ inputQuantity }}</strong> = 
                                <strong>{{ selectedItem?.quantity + inputQuantity }} units</strong> remaining.
                            </span>
                        </small>
                    </div>

                    <div class="modal-action-footer">
                        <button type="button" class="btn-ghost" @click="closeModal" :disabled="isSubmitting">Cancel</button>
                        <button type="submit" class="btn-primary" :disabled="isSubmitting">
                            <span v-if="isSubmitting">Committing Configurations...</span>
                            <span v-else>Confirm Adjustments</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.view-panel-wrapper { width: 100%; display: flex; flex-direction: column; }
.main-header { margin-bottom: 2rem; }
.page-title { font-family: 'Yanone Kaffeesatz', sans-serif; font-size: 2.5rem; font-weight: 700; color: #1a1a1a; margin: 0 0 0.2rem 0; }
.page-sub { font-size: 0.9rem; color: #6b7280; margin: 0; }
.utility-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
.search-box { position: relative; flex: 1; max-width: 400px; }
.search-box i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #9ca3af; }
.search-box input { width: 100%; padding: 0.65rem 1rem 0.65rem 2.5rem; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 0.9rem; outline: none; transition: all 0.2s; }
.search-box input:focus { border-color: #3d0300; box-shadow: 0 0 0 3px rgba(61, 3, 0, 0.05); }
.img-preview-box { width: 36px; height: 36px; border-radius: 6px; overflow: hidden; background: #f3f4f6; display: flex; align-items: center; justify-content: center; border: 1px solid #e5e7eb; flex-shrink: 0; }
.img-preview-box img { width: 100%; height: 100%; object-fit: cover; }
.monospace-code { font-family: monospace; background: #f1f5f9; padding: 0.15rem 0.35rem; border-radius: 4px; font-size: 0.8rem !important; }
.fw-bold { font-weight: 700; }
.stock-badge { display: inline-flex; align-items: center; padding: 0.35rem 0.65rem; border-radius: 50px; font-size: 0.75rem; font-weight: 600; }
.stock-badge.badge-out { background: #fee2e2; color: #dc2626; }
.stock-badge.badge-low { background: #fef3c7; color: #d97706; }
.stock-badge.badge-stable { background: #e0f2fe; color: #0369a1; }
.action-btn.inventory-edit-btn:hover { background: #faf5ff; color: #9333ea; border-color: #e9d5ff; }
.spin-loader { animation: rotatingLoader 1s linear infinite; }
@keyframes rotatingLoader { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
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
</style>