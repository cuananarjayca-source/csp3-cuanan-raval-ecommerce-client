<script setup>
import { ref, computed, onMounted } from 'vue';
import AdminSidebar from '../components/AdminSidebar.vue';
import { getAllReviews, editReviewAsAdmin, deleteReviewAsAdmin, getErrorMessage } from '../services/api.js';

// ——— State Management ———
const reviews = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const isSubmitting = ref(false);

// Modal Management
const isEditModalOpen = ref(false);
const editForm = ref({ id: '', rating: 5, comment: '' });

// Pagination
const itemsPerPage = 8;
const currentPage = ref(1);

// ——— Load System Review Streams ———
async function loadReviews() {
    isLoading.value = true;
    try {
        const response = await getAllReviews();
        // Fallback checks for payload formatting arrays
        reviews.value = response.result || response.reviews || [];
    } catch (err) {
        console.error('Failed to capture dashboard review lists:', getErrorMessage(err));
    } finally {
        isLoading.value = false;
    }
}

// ——— Administrative Force Delete ———
async function handleDeleteReview(reviewId) {
    const confirmation = confirm("CRITICAL WARNING: Are you sure you want to permanently delete this customer review? This operation cannot be undone.");
    if (!confirmation) return;

    isSubmitting.value = true;
    try {
        await deleteReviewAsAdmin(reviewId);
        await loadReviews();
    } catch (err) {
        alert(getErrorMessage(err));
    } finally {
        isSubmitting.value = false;
    }
}

// ——— Administrative Force Edit Modals ———
function openEditModal(review) {
    editForm.value = {
        id: review._id,
        rating: review.rating || 5,
        comment: review.comment || ''
    };
    isEditModalOpen.value = true;
}

function closeEditModal() {
    isEditModalOpen.value = false;
}

async function handleUpdateReview() {
    isSubmitting.value = true;
    try {
        const payload = {
            rating: Number(editForm.value.rating),
            comment: editForm.value.comment
        };
        await editReviewAsAdmin(editForm.value.id, payload);
        closeEditModal();
        await loadReviews();
    } catch (err) {
        alert(getErrorMessage(err));
    } finally {
        isSubmitting.value = false;
    }
}

// ——— Search Filters (Matches User Name, Product Details or Content text) ———
const filteredReviews = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();
    if (!query) return reviews.value;
    return reviews.value.filter(item => 
        item.comment?.toLowerCase().includes(query) ||
        item.userId?.firstName?.toLowerCase().includes(query) ||
        item.productId?.name?.toLowerCase().includes(query)
    );
});

// ——— Pagination Flow Logic ———
const totalPages = computed(() => Math.ceil(filteredReviews.value.length / itemsPerPage));
const paginatedReviews = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    return filteredReviews.value.slice(start, start + itemsPerPage);
});

function goToPage(p) { if (p >= 1 && p <= totalPages.value) currentPage.value = p; }

onMounted(async () => { await loadReviews(); });
</script>

<template>
    <div class="admin-wrapper">
        <AdminSidebar />

        <main class="admin-main">
            <header class="main-header">
                <div class="header-titles">
                    <h1 class="page-title">Product Reviews Audit</h1>
                    <p class="page-sub">Monitor user sentiments, filter flag words, and manage rating scores across products.</p>
                </div>
            </header>

            <div class="utility-bar">
                <div class="search-box">
                    <i class="bi bi-search"></i>
                    <input type="text" v-model="searchQuery" placeholder="Filter reviews by text contents, products or users..." @input="currentPage = 1" />
                </div>
                <button class="btn-ghost" @click="loadReviews" :disabled="isLoading">
                    <i class="bi bi-arrow-clockwise" :class="{ 'spin-loader': isLoading }"></i> Refresh
                </button>
            </div>

            <div v-if="filteredReviews.length === 0 && !isLoading" class="empty-state-card">
                <i class="bi bi-chat-left-quote"></i>
                <p>No customer product reviews match your searching requirements.</p>
            </div>

            <div v-else class="reviews-grid">
                <div v-for="review in paginatedReviews" :key="review._id" class="review-item-card" :class="{ 'alert-negative': review.rating <= 2 }">
                    <header class="card-meta-header">
                        <div class="user-profile-meta">
                            <div class="avatar">
                                {{ review.userId?.firstName?.charAt(0).toUpperCase() || 'U' }}
                            </div>
                            <div>
                                <h4 class="username">{{ review.userId?.firstName }} {{ review.userId?.lastName || 'Customer' }}</h4>
                                <span class="product-tag">Product: <strong>{{ review.productId?.name || 'Unknown Item' }}</strong></span>
                            </div>
                        </div>
                        <div class="stars-badge">
                            <i class="bi bi-star-fill" v-for="n in review.rating" :key="'fill-'+n"></i>
                            <i class="bi bi-star" v-for="n in (5 - review.rating)" :key="'empty-'+n"></i>
                        </div>
                    </header>

                    <p class="comment-body-text">
                        "{{ review.comment || 'No text comments left for this rating parameter.' }}"
                    </p>

                    <footer class="card-action-footer">
                        <span class="negative-warning-label" v-if="review.rating <= 2">
                            <i class="bi bi-exclamation-triangle"></i> Low Score Alert
                        </span>
                        <div class="button-actions-cluster">
                            <button class="action-mini-btn edit" @click="openEditModal(review)" title="Modify Comment Body">
                                <i class="bi bi-pencil"></i> Edit
                            </button>
                            <button class="action-mini-btn delete" @click="handleDeleteReview(review._id)" title="Purge Review From Data Store">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </div>
                    </footer>
                </div>
            </div>

            <footer v-if="totalPages > 1" class="pagination-nav-footer">
                <button class="page-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">Previous</button>
                <span class="tracker">Page {{ currentPage }} of {{ totalPages }}</span>
                <button class="page-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">Next</button>
            </footer>
        </main>

        <div v-if="isEditModalOpen" class="modal-backdrop-overlay">
            <div class="modal-surface-card">
                <header class="modal-header-block">
                    <h3>Override Customer Comment</h3>
                    <button class="modal-close-btn" @click="closeEditModal">&times;</button>
                </header>
                <form @submit.prevent="handleUpdateReview" class="modal-form">
                    <div class="input-field-group">
                        <label>Override Rating Index Score</label>
                        <select v-model="editForm.rating" class="modal-select-input">
                            <option v-for="star in 5" :key="star" :value="star">{{ star }} Stars</option>
                        </select>
                    </div>
                    <div class="input-field-group">
                        <label>Sanatize / Edit Comment Context</label>
                        <textarea v-model="editForm.comment" rows="5" class="modal-textarea-input" required placeholder="Rewrite custom review contents values..."></textarea>
                    </div>
                    <footer class="modal-footer-actions">
                        <button type="button" class="btn-cancel" @click="closeEditModal">Dismiss</button>
                        <button type="submit" class="btn-submit" :disabled="isSubmitting">Override Changes</button>
                    </footer>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.admin-wrapper { display: flex; min-height: 100vh; background: #faf9fc; font-family: 'Inter', sans-serif; }
.admin-main { flex: 1; padding: 2.5rem 3rem; overflow-y: auto; min-width: 0; }
.main-header { display: flex; flex-direction: column; margin-bottom: 2rem; }
.page-title { font-family: 'Yanone Kaffeesatz', sans-serif; font-size: 2.5rem; font-weight: 700; color: #1a1a1a; margin: 0 0 0.2rem 0; }
.page-sub { font-size: 0.9rem; color: #6b7280; margin: 0; }

.utility-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; gap: 1rem; }
.search-box { position: relative; flex: 1; max-width: 460px; }
.search-box i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #9ca3af; }
.search-box input { width: 100%; padding: 0.65rem 1rem 0.65rem 2.5rem; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 0.9rem; outline: none; }
.search-box input:focus { border-color: #3d0300; }

.btn-ghost { background: transparent; color: #3d0300; border: 1.5px solid #d1d5db; padding: 0.65rem 1.2rem; border-radius: 10px; font-size: 0.9rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }

/* ── REVIEWS DISPLAY CARDS MATRIX ── */
.reviews-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.review-item-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.01); transition: all 0.2s; }
.review-item-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.04); }
.review-item-card.alert-negative { border-left: 4px solid #ef4444; background: #fffbfb; }

.card-meta-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 1rem; }
.user-profile-meta { display: flex; align-items: center; gap: 0.75rem; }
.user-profile-meta .avatar { width: 38px; height: 38px; background: #ebdcdb; color: #3d0300; border-radius: 50px; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
.user-profile-meta .username { margin: 0 0 0.15rem 0; font-size: 0.95rem; color: #1a1a1a; font-weight: 600; }
.user-profile-meta .product-tag { font-size: 0.78rem; color: #6b7280; display: block; }

.stars-badge { color: #f59e0b; font-size: 0.85rem; word-spacing: -2px; }
.comment-body-text { font-size: 0.9rem; line-height: 1.5; color: #4b5563; margin: 0 0 1.25rem 0; font-style: italic; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }

.card-action-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f3f4f6; padding-top: 0.85rem; margin-top: auto; }
.negative-warning-label { font-size: 0.75rem; color: #ef4444; font-weight: 600; display: flex; align-items: center; gap: 0.3rem; }
.button-actions-cluster { display: flex; gap: 0.4rem; margin-left: auto; }

.action-mini-btn { padding: 0.35rem 0.65rem; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.3rem; border: 1px solid #e5e7eb; background: #ffffff; color: #4b5563; transition: all 0.15s; }
.action-mini-btn.edit:hover { background: #fef8ee; color: #d97706; border-color: #fde68a; }
.action-mini-btn.delete:hover { background: #fff5f5; color: #dc2626; border-color: #fecdd3; }

/* ── MODAL INTERFACES ── */
.modal-backdrop-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-surface-card { background: #ffffff; border-radius: 14px; width: 100%; max-width: 480px; box-shadow: 0 10px 25px rgba(0,0,0,0.12); overflow: hidden; }
.modal-header-block { display: flex; justify-content: space-between; align-items: center; padding: 1.2rem 1.5rem; background: #faf9fc; border-bottom: 1px solid #e5e7eb; }
.modal-header-block h3 { margin: 0; font-size: 1.15rem; font-weight: 600; color: #1a1a1a; }
.modal-close-btn { background: none; border: none; font-size: 1.4rem; cursor: pointer; color: #9ca3af; }
.modal-form { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.2rem; }
.input-field-group { display: flex; flex-direction: column; gap: 0.4rem; }
.input-field-group label { font-size: 0.85rem; font-weight: 600; color: #4b5563; }
.modal-select-input, .modal-textarea-input { padding: 0.6rem 0.75rem; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 0.92rem; outline: none; font-family: inherit; }
.modal-select-input:focus, .modal-textarea-input:focus { border-color: #3d0300; }

.modal-footer-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }
.btn-cancel { padding: 0.6rem 1.1rem; border: 1.5px solid #d1d5db; background: transparent; border-radius: 8px; font-weight: 500; cursor: pointer; font-size: 0.88rem; }
.btn-submit { padding: 0.6rem 1.3rem; border: none; background: #3d0300; color: #ffffff; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.88rem; }

.pagination-nav-footer { display: flex; justify-content: center; align-items: center; gap: 1.5rem; padding: 1rem 0; margin-top: 1rem; }
.pagination-nav-footer .tracker { font-size: 0.88rem; color: #6b7280; font-weight: 500; }
.page-btn { padding: 0.45rem 1rem; font-size: 0.85rem; border-radius: 6px; border: 1px solid #d1d5db; background: #ffffff; font-weight: 500; cursor: pointer; color: #374151; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.empty-state-card { text-align: center; padding: 5rem 2rem; background: #ffffff; border-radius: 14px; border: 1px dashed #e5e7eb; color: #9ca3af; }
.empty-state-card i { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; color: #d1d5db; }

.spin-loader { animation: rotation 1s linear infinite; display: inline-block; }
@keyframes rotation { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

@media (max-width: 768px) {
    .utility-bar { flex-direction: column; align-items: stretch; }
    .reviews-grid { grid-template-columns: 1fr; }
}
</style>