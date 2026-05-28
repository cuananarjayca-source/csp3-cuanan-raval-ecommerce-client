<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';

// Toggle logic stays inside the sidebar wrapper
const isSidebarOpen = ref(true);

function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value;
}

function handleResize() {
    if (window.innerWidth <= 992) {
        isSidebarOpen.value = false;
    }
}

onMounted(() => {
    if (window.innerWidth <= 992) {
        isSidebarOpen.value = false;
    }
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});
</script>

<template>
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
            <RouterLink to="/products" class="nav-item" title="Products">
                <i class="bi bi-box-seam"></i>
                <span class="nav-text">Products</span>
            </RouterLink>

            <RouterLink to="/admin/orders" class="nav-item" title="Orders">
                <i class="bi bi-receipt"></i>
                <span class="nav-text">Orders</span>
            </RouterLink>

            <RouterLink to="/admin/stock" class="nav-item" title="Stock">
                <i class="bi bi-layers"></i>
                <span class="nav-text">Stock</span>
            </RouterLink>

            <RouterLink to="/admin/payments" class="nav-item" title="Payments">
                <i class="bi bi-credit-card"></i>
                <span class="nav-text">Payments</span>
            </RouterLink>

            <RouterLink to="/admin/customers" class="nav-item" title="Customers">
                <i class="bi bi-people"></i>
                <span class="nav-text">Customers</span>
            </RouterLink>
            
            <RouterLink to="/admin/reviews" class="nav-item" title="Reviews">
                <i class="bi bi-star-fill"></i>
                <span class="nav-text">Reviews</span>
            </RouterLink>

            <RouterLink to="/logout" class="nav-item" title="Logout">
                <i class="bi bi-gear"></i>
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
</template>

<style scoped>
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

/* The fix: target Vue Router's native active class seamlessly */
.nav-item.router-link-active { 
    background: rgba(238, 128, 123, 0.15); 
    color: #ee807b; 
    font-weight: 600; 
}

.admin-sidebar.closed .nav-item { justify-content: center; padding: 0.85rem 0; }
.admin-sidebar.closed .nav-text { display: none; }
.sidebar-footer { padding: 1.5rem 1.25rem; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.admin-profile { display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; font-weight: 500; color: #e5e7eb; white-space: nowrap; }
.admin-profile i { font-size: 1.5rem; color: #ee807b; }
.admin-sidebar.closed .sidebar-footer { padding: 1.5rem 0; }
.admin-sidebar.closed .admin-profile { justify-content: center; }
.admin-sidebar.closed .profile-text { display: none; }

@media (max-width: 768px) {
    .admin-main { padding: 1.5rem; }
    .hide-mobile { display: none; }
}
</style>