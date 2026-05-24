<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useGlobalStore } from "../stores/global.js";

const globalStore = useGlobalStore();
const { user } = storeToRefs(globalStore);
const isAuthenticated = computed(() => Boolean(user.value?.token));
const router = useRouter();

const isScrolled = ref(false);
const offcanvasOpen = ref(false);
const profileDropdownOpen = ref(false);
const profileBtnRef = ref(null);

const handleScroll = () => {
    isScrolled.value = window.scrollY > 30;
};

const handleClickOutside = (e) => {
    if (profileBtnRef.value && !profileBtnRef.value.contains(e.target)) {
        profileDropdownOpen.value = false;
    }
};

onMounted(() => {
    const token = localStorage.getItem("token");
    if (token && !user.value?.email) {
        globalStore.getUserDetails(token);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
    document.removeEventListener("click", handleClickOutside);
});

const toggleOffcanvas = () => {
    offcanvasOpen.value = !offcanvasOpen.value;
};

const closeOffcanvas = () => {
    offcanvasOpen.value = false;
};

const toggleProfileDropdown = () => {
    if (!isAuthenticated.value) {
        router.push("/login");
        return;
    }
    profileDropdownOpen.value = !profileDropdownOpen.value;
};

const closeDropdown = () => {
    profileDropdownOpen.value = false;
};
</script>

<template>
    <!-- Offcanvas Backdrop -->
    <div
        v-if="offcanvasOpen"
        class="offcanvas-backdrop"
        @click="closeOffcanvas"
    ></div>

    <!-- Offcanvas Menu (Mobile) -->
    <div :class="['offcanvas-menu', { open: offcanvasOpen }]">
        <div class="offcanvas-header">
            <span class="offcanvas-brand">
                <span class="brand-primary">TARO</span>
                <span class="brand-secondary">&nbsp;606</span>
            </span>
            <button class="offcanvas-close" @click="closeOffcanvas" aria-label="Close menu">
                <i class="bi bi-x-lg"></i>
            </button>
        </div>
        <ul class="offcanvas-nav">
            <li><RouterLink to="/" @click="closeOffcanvas">Home</RouterLink></li>
            <li><RouterLink to="/products" @click="closeOffcanvas">Products</RouterLink></li>
            <li><a href="#" @click="closeOffcanvas">Our Story</a></li>
            <li><a href="#" @click="closeOffcanvas">Review</a></li>
            <li><a href="#" @click="closeOffcanvas">Contact Us</a></li>
            <li v-if="!isAuthenticated">
                <RouterLink to="/login" @click="closeOffcanvas">Login</RouterLink>
            </li>
            <li v-if="!isAuthenticated">
                <RouterLink to="/register" @click="closeOffcanvas">Register</RouterLink>
            </li>
            <li v-if="isAuthenticated">
                <RouterLink to="/logout" @click="closeOffcanvas">Logout</RouterLink>
            </li>
            <li v-if="user?.isAdmin">
              <RouterLink to="/admin/dashboard" @click="closeOffcanvas">Admin Dashboard</RouterLink>
            </li>
        </ul>
    </div>

    <!-- Main Navbar -->
    <nav :class="['global-navbar', { scrolled: isScrolled }]">
        <div class="navbar-inner">

            <!-- LEFT: Nav Links (desktop) -->
            <div class="nav-left">
                <!-- Desktop Links -->
                <ul class="nav-links d-none d-lg-flex">
                    <li><RouterLink to="/">Home</RouterLink></li>
                    <li><RouterLink to="/products">Products</RouterLink></li>
                    <li><a href="#">Our Story</a></li>
                    <li><a href="#">Review</a></li>
                    <li><a href="#">Contact Us</a></li>
                </ul>

                <!-- Mobile Hamburger -->
                <button
                    class="hamburger-btn d-flex d-lg-none"
                    @click="toggleOffcanvas"
                    aria-label="Open menu"
                >
                    <i class="bi bi-list"></i>
                </button>
            </div>

            <!-- CENTER: Brand -->
            <div class="nav-center">
                <RouterLink to="/" class="navbar-brand-link">
                    <span class="brand-primary">TARO</span>
                    <span class="brand-secondary">&nbsp;606</span>
                </RouterLink>
            </div>

            <!-- RIGHT: Cart + Auth Links / Profile -->
            <div class="nav-right">
                <!-- Cart Icon -->
                <a href="#" class="icon-btn" aria-label="Cart">
                    <i class="bi bi-cart-fill"></i>
                </a>

                <!-- Unauthenticated: Login + Register styled links -->
                <template v-if="!isAuthenticated">
                    <RouterLink to="/login" class="auth-link">Login</RouterLink>
                    <RouterLink to="/register" class="auth-link auth-link--register">Register</RouterLink>
                </template>

                <!-- Authenticated: Profile icon + dropdown -->
                <template v-else>
                    <div class="profile-wrapper" ref="profileBtnRef">
                        <button
                            class="icon-btn"
                            :class="{ active: profileDropdownOpen }"
                            @click.stop="toggleProfileDropdown"
                            aria-label="Profile menu"
                            :aria-expanded="profileDropdownOpen"
                        >
                            <i class="bi bi-person-circle"></i>
                        </button>

                        <!-- Dropdown Menu -->
                        <Transition name="dropdown">
                            <div v-if="profileDropdownOpen" class="profile-dropdown">
                                <!-- User greeting -->
                                <div class="dropdown-header">
                                    <i class="bi bi-person-circle dropdown-avatar"></i>
                                    <div>
                                        <div class="dropdown-name">{{ user?.name || user?.email?.split('@')[0] || 'My Account' }}</div>
                                        <div class="dropdown-email">{{ user?.email || '' }}</div>
                                    </div>
                                </div>

                                <div class="dropdown-divider"></div>

                               <a href="#" class="dropdown-item" @click="closeDropdown">
                                   <i class="bi bi-person"></i>
                                   View Profile
                               </a>
                               <a href="#" class="dropdown-item" @click="closeDropdown">
                                   <i class="bi bi-shield-lock"></i>
                                   Account Security Settings
                               </a>
                                <RouterLink
                                  v-if="user?.isAdmin"
                                  to="/admin/dashboard"
                                  class="dropdown-item"
                                  @click="closeDropdown"
                                >
                                  <i class="bi bi-speedometer2"></i>
                                  Admin Dashboard
                                </RouterLink>
                                <a href="#" class="dropdown-item" @click="closeDropdown">
                                    <i class="bi bi-question-circle"></i>
                                    Help / FAQ
                                </a>

                                <div class="dropdown-divider"></div>

                                <RouterLink to="/logout" class="dropdown-item dropdown-item--logout" @click="closeDropdown">
                                    <i class="bi bi-box-arrow-right"></i>
                                    Logout
                                </RouterLink>
                            </div>
                        </Transition>
                    </div>
                </template>
            </div>

        </div>
    </nav>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Yanone+Kaffeesatz:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

/* ─── CSS Variables ────────────────────────────────── */
:root {
    --color-primary: #3d0300;
    --color-secondary: #ee807b;
    --color-light: #faf9fc;
    --color-cream: #f8f5ef;
}

/* ─── Navbar Base ──────────────────────────────────── */
.global-navbar {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 95%;
    z-index: 999;
    margin-top: 12px;
    border-radius: 18px;
    background: transparent;
    box-shadow: none;
    transition: background 0.4s ease, backdrop-filter 0.4s ease,
        box-shadow 0.4s ease, border 0.4s ease;
}

.global-navbar.scrolled {
    background: rgba(248, 245, 239, 0.35);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

/* ─── Inner Layout ─────────────────────────────────── */
.navbar-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.7rem 1.2rem;
    border-radius: 18px;
}

/* ─── Sections ─────────────────────────────────────── */
.nav-left,
.nav-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
}

.nav-right {
    justify-content: flex-end;
}

.nav-center {
    flex: 0 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* ─── Brand ────────────────────────────────────────── */
.navbar-brand-link {
    font-family: 'Yanone Kaffeesatz', sans-serif;
    font-size: 2.3rem;
    font-weight: 700;
    letter-spacing: 1px;
    text-decoration: none;
    line-height: 1;
    white-space: nowrap;
}

.brand-primary {
    color: #3d0300;
}

.brand-secondary {
    color: #ee807b;
}

/* ─── Desktop Nav Links ─────────────────────────────── */
.nav-links {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 0.2rem;
}

.nav-links li a {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 0.875rem;
    color: #3d0300;
    background: transparent;
    padding: 0.4rem 0.85rem;
    text-decoration: none;
    display: inline-block;
    position: relative;
    white-space: nowrap;
    transition: color 0.25s ease;
}

/* animated underline on hover / active */
.nav-links li a::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0.85rem;
    right: 0.85rem;
    height: 2px;
    background: #ee807b;
    border-radius: 2px;
    transform: scaleX(0);
    transition: transform 0.25s ease;
}

.nav-links li a:hover {
    color: #ee807b;
}

.nav-links li a:hover::after,
.nav-links li a.router-link-active::after {
    transform: scaleX(1);
}

.nav-links li a.router-link-active {
    color: #3d0300;
    font-weight: 700;
}

/* ─── Icon Buttons ─────────────────────────────────── */
.icon-btn {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: #3d0300;
    color: #faf9fc;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    text-decoration: none;
    transition: background 0.3s ease, transform 0.3s ease;
    flex-shrink: 0;
}

.icon-btn:hover {
    background: #ee807b;
    color: #faf9fc;
    transform: translateY(-2px);
}

/* ─── Hamburger ─────────────────────────────────────── */
.hamburger-btn {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: #3d0300;
    color: #faf9fc;
    border: none;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.3s ease;
}

.hamburger-btn:hover {
    background: #ee807b;
    transform: translateY(-2px);
}

/* ─── Offcanvas Backdrop ─────────────────────────────── */
.offcanvas-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(61, 3, 0, 0.4);
    backdrop-filter: blur(4px);
    z-index: 1040;
}

/* ─── Offcanvas Menu ─────────────────────────────────── */
.offcanvas-menu {
    position: fixed;
    top: 0;
    left: -300px;
    width: 280px;
    height: 100dvh;
    background: #faf9fc;
    z-index: 1050;
    padding: 1.5rem;
    transition: left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 4px 0 32px rgba(61, 3, 0, 0.12);
    display: flex;
    flex-direction: column;
}

.offcanvas-menu.open {
    left: 0;
}

.offcanvas-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(61, 3, 0, 0.1);
}

.offcanvas-brand {
    font-family: 'Yanone Kaffeesatz', sans-serif;
    font-size: 1.8rem;
    font-weight: 700;
    letter-spacing: 1px;
}

.offcanvas-close {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #3d0300;
    color: #faf9fc;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background 0.3s ease;
}

.offcanvas-close:hover {
    background: #ee807b;
}

.offcanvas-nav {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.offcanvas-nav li a {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    color: #faf9fc;
    background: #3d0300;
    border-radius: 14px;
    padding: 0.75rem 1.2rem;
    text-decoration: none;
    display: block;
    transition: background 0.3s ease, transform 0.2s ease;
}

.offcanvas-nav li a:hover,
.offcanvas-nav li a.router-link-active {
    background: #ee807b;
    transform: translateX(4px);
}

/* ─── Responsive Tweaks ─────────────────────────────── */

/* Tablet: md to lg */
@media (min-width: 768px) and (max-width: 991.98px) {
    .icon-btn {
        width: 42px;
        height: 42px;
        font-size: 1.1rem;
    }

    .navbar-brand-link {
        font-size: 2rem;
    }
}

/* Mobile: < 768px */
@media (max-width: 767.98px) {
    .global-navbar {
        width: 92%;
        margin-top: 10px;
    }

    .navbar-inner {
        padding: 0.6rem 1rem;
    }

    .navbar-brand-link {
        font-size: 1.7rem;
    }

    .icon-btn {
        width: 40px;
        height: 40px;
        font-size: 1rem;
        border-radius: 10px;
    }

    .hamburger-btn {
        width: 40px;
        height: 40px;
        font-size: 1.2rem;
        border-radius: 10px;
    }
}

/* Very small: < 360px */
@media (max-width: 359.98px) {
    .icon-btn,
    .hamburger-btn {
        width: 36px;
        height: 36px;
        font-size: 0.95rem;
    }

    .navbar-brand-link {
        font-size: 1.5rem;
    }
}

/* ─── Auth Links (unauthenticated) ──────────────────── */
.auth-link {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 0.85rem;
    color: #3d0300;
    background: transparent;
    padding: 0.4rem 0.6rem;
    text-decoration: none;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    position: relative;
    transition: color 0.25s ease;
}

.auth-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0.6rem;
    right: 0.6rem;
    height: 2px;
    background: #ee807b;
    border-radius: 2px;
    transform: scaleX(0);
    transition: transform 0.25s ease;
}

.auth-link:hover {
    color: #ee807b;
}

.auth-link:hover::after {
    transform: scaleX(1);
}

/* Register gets a subtle separator on its left */
.auth-link--register {
    color: #ee807b;
    border-left: 1.5px solid rgba(61, 3, 0, 0.2);
    padding-left: 0.8rem;
    margin-left: 0.2rem;
}

.auth-link--register::after {
    background: #3d0300;
}

.auth-link--register:hover {
    color: #3d0300;
}

/* ─── Profile Wrapper & Dropdown ────────────────────── */
.profile-wrapper {
    position: relative;
}

.icon-btn.active {
    background: #ee807b;
}

.profile-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    min-width: 230px;
    background: #faf9fc;
    border-radius: 16px;
    box-shadow: 0 12px 40px rgba(61, 3, 0, 0.14);
    border: 1px solid rgba(61, 3, 0, 0.07);
    overflow: hidden;
    z-index: 1100;
}

/* ─── Dropdown Header ───────────────────────────────── */
.dropdown-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.1rem 0.9rem;
    background: #3d0300;
}

.dropdown-avatar {
    font-size: 2rem;
    color: #faf9fc;
    flex-shrink: 0;
}

.dropdown-name {
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 0.9rem;
    color: #faf9fc;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 140px;
}

.dropdown-email {
    font-family: 'Inter', sans-serif;
    font-size: 0.73rem;
    color: rgba(250, 249, 252, 0.65);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 140px;
}

/* ─── Dropdown Divider ──────────────────────────────── */
.dropdown-divider {
    height: 1px;
    background: rgba(61, 3, 0, 0.08);
    margin: 0;
}

/* ─── Dropdown Items ────────────────────────────────── */
.dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.7rem 1.1rem;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 0.875rem;
    color: #3d0300;
    text-decoration: none;
    transition: background 0.2s ease, color 0.2s ease, padding-left 0.2s ease;
}

.dropdown-item i {
    font-size: 1rem;
    flex-shrink: 0;
    color: #3d0300;
    transition: color 0.2s ease;
}

.dropdown-item:hover {
    background: rgba(238, 128, 123, 0.12);
    color: #ee807b;
    padding-left: 1.4rem;
}

.dropdown-item:hover i {
    color: #ee807b;
}

.dropdown-item--logout {
    color: #c0392b;
    font-weight: 600;
}

.dropdown-item--logout i {
    color: #c0392b;
}

.dropdown-item--logout:hover {
    background: rgba(192, 57, 43, 0.08);
    color: #c0392b;
    padding-left: 1.4rem;
}

.dropdown-item--logout:hover i {
    color: #c0392b;
}

/* ─── Dropdown Transition ───────────────────────────── */
.dropdown-enter-active,
.dropdown-leave-active {
    transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-8px) scale(0.97);
}

/* ─── Mobile: compact auth links ────────────────────── */
@media (max-width: 575.98px) {
    .auth-link {
        font-size: 0.78rem;
        padding: 0.35rem 0.5rem;
    }

    .auth-link--register {
        padding-left: 0.6rem;
    }

    .profile-dropdown {
        right: -4px;
        min-width: 210px;
    }
}
</style>