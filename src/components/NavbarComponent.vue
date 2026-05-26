<script setup>
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from "vue"; // ✅ Fixed: Added nextTick
import { RouterLink, useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useGlobalStore } from "../stores/global.js";

const globalStore = useGlobalStore();
const { user } = storeToRefs(globalStore);
const isAuthenticated = computed(() => Boolean(user.value?.token));
const router = useRouter();
const route = useRoute();

const isAuthPage = computed(() => {
    return ['/login', '/register'].includes(route.path); 
});

watch(
    () => user.value?.isAdmin,
    (isAdmin) => {
        if (isAdmin && !route.path.startsWith('/admin')) {
            router.push('/products');
        }
    },
    { immediate: true } 
);

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

// ✅ Robust SPA scroll behavior for both same-page and cross-page navigation
watch(
    () => [route.path, route.hash],
    async ([newPath, newHash]) => {
        if (newHash) {
            // Using a 100ms timeout ensures elements exist even when switching from /products back to /
            setTimeout(() => {
                const element = document.querySelector(newHash);
                if (element) {
                    const yOffset = -90; // Prevents navbar overlay
                    const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
                    
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }, 100);
        } else if (newPath === '/' && !newHash) {
            // Smooth scroll back to top when clicking Home
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },
    { immediate: true }
);
</script>

<template>
    <template v-if="!user?.isAdmin">
        
        <div
            v-if="offcanvasOpen"
            class="offcanvas-backdrop"
            @click="closeOffcanvas"
        ></div>

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
                    
                    <li><RouterLink to="/#our-story" @click="closeOffcanvas">Our Story</RouterLink></li>
                    <li><RouterLink to="/#reviews" @click="closeOffcanvas">Review</RouterLink></li>
                    <li><RouterLink to="/#contact-us" @click="closeOffcanvas">Contact Us</RouterLink></li>
                <li v-if="!isAuthenticated">
                    <RouterLink to="/login" @click="closeOffcanvas">Login</RouterLink>
                </li>
                <li v-if="!isAuthenticated">
                    <RouterLink to="/register" @click="closeOffcanvas">Register</RouterLink>
                </li>
                <li v-if="isAuthenticated">
                    <RouterLink to="/logout" @click="closeOffcanvas">Logout</RouterLink>
                </li>
            </ul>
        </div>

        <nav :class="['global-navbar', { scrolled: isScrolled }]">
            <div class="navbar-inner">

                <div class="nav-left">
                    <ul class="nav-links d-none d-lg-flex">
                        <li><RouterLink to="/">Home</RouterLink></li>
                        <li><RouterLink to="/products">Products</RouterLink></li>
                        <li><RouterLink to="/#our-story">Our Story</RouterLink></li>
                        <li><RouterLink to="/#reviews">Review</RouterLink></li>
                        <li><RouterLink to="/#contact-us">Contact Us</RouterLink></li>
                    </ul>

                    <button
                        class="hamburger-btn d-flex d-lg-none"
                        @click="toggleOffcanvas"
                        aria-label="Open menu"
                    >
                        <i class="bi bi-list"></i>
                    </button>
                </div>

                <div class="nav-center" v-if="!isAuthPage">
                    <RouterLink to="/" class="navbar-brand-link">
                        <span class="brand-primary">TARO</span>
                        <span class="brand-secondary">&nbsp;606</span>
                    </RouterLink>
                </div>

                <div class="nav-right" v-if="!isAuthPage">
                    
                    <component 
                        :is="isAuthenticated ? 'RouterLink' : 'span'" 
                        to="/cart" 
                        class="icon-btn" 
                        :class="{ 'disabled-cart': !isAuthenticated }"
                        aria-label="Cart">
                        <i class="bi bi-cart-fill"></i>
                    </component>

                    <template v-if="!isAuthenticated">
                        <RouterLink to="/login" class="auth-link">Login</RouterLink>
                        <RouterLink to="/register" class="auth-link auth-link--register">Register</RouterLink>
                    </template>

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

                            <Transition name="dropdown">
                                <div v-if="profileDropdownOpen" class="profile-dropdown">
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
                                        Account Settings
                                    </a>
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
</template>

<style scoped>
/* ==========================================================================
   1. DESIGN TOKENS (Variables)
   ========================================================================== */
:root {
    --color-primary: #3d0300;
    --color-secondary: #ee807b;
    --color-light: #faf9fc;
    --color-cream: #f8f5ef;
}

/* ==========================================================================
   2. CORE LAYOUT & STRUCTURE
   ========================================================================== */
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
    transition: background 0.4s ease, backdrop-filter 0.4s ease, box-shadow 0.4s ease, border 0.4s ease;
}

.global-navbar.scrolled {
    background: rgba(248, 245, 239, 0.35);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.navbar-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.7rem 1.2rem;
    border-radius: 18px;
}

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

/* ==========================================================================
   3. BRANDING
   ========================================================================== */
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

/* ==========================================================================
   4. UI COMPONENTS 
   ========================================================================== */

/* --- Desktop Nav Links --- */
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

/* --- Unauthenticated Auth Links --- */
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

/* --- Buttons --- */
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

.icon-btn.active {
    background: #ee807b;
}

.icon-btn.disabled-cart {
    background: rgba(61, 3, 0, 0.3);
    cursor: not-allowed;
    color: rgba(250, 249, 252, 0.7);
}

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

/* --- Profile Dropdown --- */
.profile-wrapper {
    position: relative;
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

.dropdown-divider {
    height: 1px;
    background: rgba(61, 3, 0, 0.08);
    margin: 0;
}

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

.dropdown-enter-active,
.dropdown-leave-active {
    transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-8px) scale(0.97);
}

/* ==========================================================================
   5. MOBILE NAVIGATION (Offcanvas)
   ========================================================================== */
.offcanvas-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(61, 3, 0, 0.4);
    backdrop-filter: blur(4px);
    z-index: 1040;
}

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


/* ==========================================================================
   6. RESPONSIVE TARGETS (Media Queries)
   ========================================================================== */

/* Target: Tablets (iPad Portrait, etc.) */
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

/* Target: Mobile Devices (Phones) */
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

/* Target: Narrow Mobile / Custom elements adjustments */
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

/* Target: Very Small Mobile Devices (e.g. iPhone SE, old devices) */
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
</style>