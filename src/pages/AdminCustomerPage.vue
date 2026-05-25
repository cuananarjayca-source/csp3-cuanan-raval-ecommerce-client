<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { getAllUsers, deactivateUserAsAdmin, activateUserAsAdmin, getErrorMessage } from '../services/api.js';
import AdminSidebar from '../components/AdminSidebar.vue';


// ——— State ———
const customers = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const isSidebarOpen = ref(true);
const isSubmitting = ref(false);

// Pagination State
const itemsPerPage = 10;
const currentPage = ref(1);

// ——— Sidebar ———
function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value;
}

// ——— Load Data ———
async function loadCustomers() {
    isLoading.value = true;
    try {
        const response = await getAllUsers();
        // Assuming your controller returns { message: "...", result: [...] }
        customers.value = response.result || [];
    } catch (err) {
        console.error('Failed to load customers:', getErrorMessage(err));
    } finally {
        isLoading.value = false;
    }
}

// ——— Status Toggles ———
async function handleToggleStatus(customer) {
    const actionText = customer.isActive ? 'deactivate' : 'reactivate';
    const confirmation = confirm(`Are you sure you want to ${actionText} ${customer.firstName}'s account?`);
    if (!confirmation) return;

    isSubmitting.value = true;
    try {
        if (customer.isActive) {
            await deactivateUserAsAdmin(customer._id);
        } else {
            await activateUserAsAdmin(customer._id);
        }
        await loadCustomers();
    } catch (err) {
        alert(getErrorMessage(err));
    } finally {
        isSubmitting.value = false;
    }
}

// ——— Search Filter (First & Last Name) ———
const filteredCustomers = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();
    if (!query) return customers.value;
    return customers.value.filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
    );
});

// ——— Pagination ———
const totalPages = computed(() => Math.ceil(filteredCustomers.value.length / itemsPerPage));

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

const paginatedCustomers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return filteredCustomers.value.slice(start, start + itemsPerPage);
});

function goToPage(page) {
    if (typeof page === 'number' && page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
}
function prevPage() { goToPage(currentPage.value - 1); }
function nextPage() { goToPage(currentPage.value + 1); }

// ——— On Mount ———
onMounted(async () => {
    if (window.innerWidth <= 992) {
        isSidebarOpen.value = false;
    }
    await loadCustomers();
});
</script>

<template>
    <main class="admin-main">
        <header class="main-header">
            <div class="header-titles">
                <h1 class="page-title">Customer Directory</h1>
                <p class="page-sub">Manage user profiles, account flags, and administrative privileges.</p>
            </div>
        </header>

        <div class="utility-bar">
            <div class="search-box">
                <i class="bi bi-search"></i>
                <input
                    type="text"
                    v-model="searchQuery"
                    placeholder="Search by name or email..."
                    @input="currentPage = 1"
                />
            </div>
            <button class="btn-ghost" @click="loadCustomers" :disabled="isLoading">
                <i class="bi bi-arrow-clockwise" :class="{ 'spin-loader': isLoading }"></i> Refresh
            </button>
        </div>

        <div class="content-card">
            <div class="table-responsive">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Customer Name</th>
                            <th>Email Address</th>
                            <th class="hide-mobile">Mobile No.</th>
                            <th class="hide-mobile">Role</th>
                            <th>Status</th>
                            <th class="align-right">Account Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in paginatedCustomers" :key="user._id">
                            <td class="fw-semibold text-dark">
                                <div class="customer-profile-cell">
                                    <div class="avatar-fallback-box">
                                        {{ user.firstName?.charAt(0).toUpperCase() }}{{ user.lastName?.charAt(0).toUpperCase() }}
                                    </div>
                                    <span>{{ user.firstName }} {{ user.lastName }}</span>
                                </div>
                            </td>
                            <td class="fw-medium text-dark">
                                {{ user.email }}
                            </td>
                            <td class="hide-mobile text-muted monospace-code">
                                {{ user.mobileNo || 'N/A' }}
                            </td>
                            <td class="hide-mobile">
                                <span v-if="user.isAdmin" class="role-badge admin-role">Admin</span>
                                <span v-else class="role-badge user-role">User</span>
                            </td>
                            <td>
                                <span v-if="user.isActive" class="status-badge active">Active</span>
                                <span v-else class="status-badge inactive">Deactivated</span>
                            </td>
                            <td class="align-right">
                                <button
                                    class="action-btn status-toggle-btn"
                                    :class="user.isActive ? 'deactivate-action' : 'activate-action'"
                                    @click="handleToggleStatus(user)"
                                    :title="user.isActive ? 'Deactivate Account' : 'Activate Account'"
                                    :disabled="isSubmitting"
                                >
                                    <i :class="user.isActive ? 'bi bi-person-dash' : 'bi bi-person-check'"></i>
                                </button>
                            </td>
                        </tr>
                        <tr v-if="filteredCustomers.length === 0 && !isLoading">
                            <td colspan="6" class="empty-state">
                                <i class="bi bi-people-inverse"></i>
                                <p>No customer profiles matched your criteria.</p>
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
    </main>
</template>

<style scoped>
/* ── MAIN CONTENT WORKSPACE ── */
.admin-main { flex: 1; padding: 2.5rem 3rem; overflow-y: auto; background: #faf9fc; font-family: 'Inter', sans-serif; }
.main-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
.page-title { font-family: 'Yanone Kaffeesatz', sans-serif; font-size: 2.5rem; font-weight: 700; color: #1a1a1a; margin: 0 0 0.2rem 0; }
.page-sub { font-size: 0.9rem; color: #6b7280; margin: 0; }

/* ── UTILITY TOOLS BAR ── */
.utility-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
.search-box { position: relative; flex: 1; max-width: 400px; }
.search-box i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #9ca3af; }
.search-box input { width: 100%; padding: 0.65rem 1rem 0.65rem 2.5rem; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 0.9rem; outline: none; transition: all 0.2s; }
.search-box input:focus { border-color: #3d0300; box-shadow: 0 0 0 3px rgba(61, 3, 0, 0.05); }
.btn-ghost { background: transparent; color: #3d0300; border: 1.5px solid #d1d5db; padding: 0.7rem 1.4rem; border-radius: 10px; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; text-decoration: none; transition: all 0.2s ease; }
.btn-ghost:hover:not(:disabled) { border-color: #3d0300; background: rgba(61, 3, 0, 0.04); }
.btn-ghost:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── TABLE CONTAINER STRUCTURE ── */
.content-card { background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); padding: 0; overflow: hidden; border: 1px solid #f3f4f6; }
.table-responsive { width: 100%; overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; text-align: left; }
.admin-table th { background: #ffffff; padding: 1.2rem 1.5rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; border-bottom: 2px solid #f3f4f6; }
.admin-table td { padding: 1.2rem 1.5rem; font-size: 0.9rem; color: #374151; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
.admin-table tbody tr:nth-child(even) { background-color: #f8f9fa; }
.admin-table tbody tr:hover { background-color: #f1f5f9; }
.admin-table tbody tr:last-child td { border-bottom: none; }

/* ── DIRECTORY DATA BLOCKS ── */
.customer-profile-cell { display: flex; align-items: center; gap: 0.75rem; }
.avatar-fallback-box { width: 36px; height: 36px; border-radius: 50px; background: #f3e8ff; color: #6b21a8; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 1px solid #e9d5ff; flex-shrink: 0; }
.monospace-code { font-family: monospace; background: #f1f5f9; padding: 0.15rem 0.35rem; border-radius: 4px; font-size: 0.85rem !important; }

/* ── ACCOUNT PRIVILEGE BADGES ── */
.role-badge { display: inline-flex; padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
.role-badge.admin-role { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.role-badge.user-role { background: #f9fafb; color: #4b5563; border: 1px solid #e5e7eb; }

/* ── UNIFIED STATUS PILL SYSTEM ── */
.status-badge { display: inline-flex; align-items: center; padding: 0.35rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
.status-badge.active { background: #dcfce7; color: #16a34a; }
.status-badge.inactive { background: #fee2e2; color: #dc2626; }

/* ── CONTROL MODIFIERS ── */
.action-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.1rem; transition: all 0.2s ease; background: #ffffff; color: #6b7280; }
.action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.action-btn.deactivate-action:hover:not(:disabled) { background: #fff5f5; color: #e11d48; border-color: #fecdd3; }
.action-btn.activate-action:hover:not(:disabled) { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }

/* ── FILTER DATA EMPTY STATE ── */
.empty-state { text-align: center; padding: 4rem 2rem !important; color: #9ca3af; background: #ffffff !important; }
.empty-state i { font-size: 3rem; color: #e5e7eb; margin-bottom: 1rem; display: block; }

/* ── FOOTER DATA PAGINATION ── */
.pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 1.25rem 1.5rem; border-top: 1px solid #f3f4f6; background: #ffffff; }
.page-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 500; color: #3d0300; background: #ffffff; border: 1.5px solid #d1d5db; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; }
.page-btn:hover:not(:disabled) { border-color: #3d0300; background: rgba(61, 3, 0, 0.04); }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-numbers { display: flex; gap: 0.35rem; }
.page-num { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 500; color: #374151; background: #ffffff; border: 1.5px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; }
.page-num:hover { border-color: #3d0300; color: #3d0300; }
.page-num.active { background: #3d0300; color: #ffffff; border-color: #3d0300; }
.page-ellipsis { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; color: #9ca3af; }

/* ── GRAPHIC HELPER CLAASES ── */
.text-dark { color: #1a1a1a; }
.text-muted { color: #6b7280; }
.fw-semibold { font-weight: 600; }
.fw-medium { font-weight: 500; }
.align-right { text-align: right; }
.hide-mobile { display: table-cell; }

/* ── SPIN REFRESH LOADER ── */
.spin-loader { animation: rotatingLoader 1s linear infinite; display: inline-block; }
@keyframes rotatingLoader { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* ── MEDIA RESPONSIVE FLUID LAYOUT ── */
@media (max-width: 992px) {
    .admin-main { padding: 1.5rem; }
}
@media (max-width: 768px) {
    .hide-mobile { display: none; }
}
</style>