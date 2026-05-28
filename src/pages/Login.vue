<script setup>
import { watch, ref, computed, onBeforeMount } from "vue";
import { Notyf } from "notyf";
import { useRouter } from "vue-router";
import { useGlobalStore } from "../stores/global.js";
import { loginUser } from "../api.js";

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const isEnabled = ref(false);
const isLoggingIn = ref(false);

const notyf = new Notyf();
const router = useRouter();
const globalStore = useGlobalStore();

const isEmailInvalid = computed(() => email.value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value));
const isPasswordInvalid = computed(() => password.value.length > 0 && password.value.length < 8);

watch([email, password], () => {
    isEnabled.value = email.value.trim() !== "" && password.value.trim() !== "" && !isEmailInvalid.value;
});

async function handleSubmit() {
    if (!isEnabled.value) return;
    isLoggingIn.value = true;
    try {
        const response = await loginUser({ email: email.value, password: password.value });
        if (response.status === 200) {
            const token = response.data.access;
            localStorage.setItem("token", token);
            globalStore.user.token = token;
            notyf.success(response.data.message || "Logged in successfully!");
            await globalStore.getUserDetails(token);
            router.push(globalStore.user?.isAdmin ? "/products" : "/");
        }
    } catch (e) {
        notyf.error(e.response?.data?.message || "Login failed.");
    } finally {
        isLoggingIn.value = false;
    }
}

onBeforeMount(() => {
    if (globalStore.user?.token) router.push("/");
});
</script>

<template>
    <div class="auth-page">

        <!-- ── LEFT HERO PANEL ── -->
        <div class="hero-panel d-none d-lg-flex">
            <div class="hero-bg-circles">
                <div class="circle circle-1"></div>
                <div class="circle circle-2"></div>
                <div class="circle circle-3"></div>
            </div>

            <!-- Floating crumbs -->
            <div class="crumb crumb-1"></div>
            <div class="crumb crumb-2"></div>
            <div class="crumb crumb-3"></div>
            <div class="crumb crumb-4"></div>
            <div class="crumb crumb-5"></div>

            <div class="hero-content">
                <!-- Beverage Can SVG -->
                <!-- Replace the entire can-wrapper div in the hero-content -->
                <div class="hero-img-wrapper">
                    <img src="../assets/images/cookies-and-cream-hero.png" alt="Cookies and Cream 606 Can" class="hero-img" />
                </div>

                <!-- Hero text below can -->
                <div class="hero-tagline">
                    <p class="hero-sub">A Curated Cookies &amp; Cream Experience</p>
                </div>
            </div>
        </div>

        <!-- ── RIGHT AUTH PANEL ── -->
        <div class="auth-panel">
            <div class="auth-inner">

                <!-- Brand -->
                <RouterLink to="/" class="auth-brand">
                    <span class="brand-p">TARO</span><span class="brand-s">&nbsp;606</span>
                </RouterLink>

                <h2 class="auth-headline">Welcome back!</h2>
                <p class="auth-sub">Please enter your details to continue.</p>

                <!-- Form -->
                <form @submit.prevent="handleSubmit" class="auth-form" novalidate>

                    <!-- Email -->
                    <div class="field-group">
                        <label for="login-email" class="field-label">Email</label>
                        <input
                            id="login-email"
                            v-model="email"
                            type="email"
                            class="field-input"
                            :class="{ 'input-error': isEmailInvalid }"
                            placeholder="Enter your Email"
                            autocomplete="email"
                            required
                        />
                        <p v-if="isEmailInvalid" class="error-msg">
                            <i class="bi bi-exclamation-circle"></i> Invalid email address
                        </p>
                    </div>

                    <!-- Password -->
                    <div class="field-group">
                        <label for="login-password" class="field-label">Password</label>
                        <div class="input-eye-wrap">
                            <input
                                id="login-password"
                                v-model="password"
                                :type="showPassword ? 'text' : 'password'"
                                class="field-input"
                                :class="{ 'input-error': isPasswordInvalid }"
                                placeholder="Enter your Password"
                                autocomplete="current-password"
                                required
                            />
                            <button type="button" class="eye-btn" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Hide password' : 'Show password'">
                                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                            </button>
                        </div>
                        <p v-if="isPasswordInvalid" class="error-msg">
                            <i class="bi bi-exclamation-circle"></i> Password must be at least 8 characters
                        </p>
                    </div>

                    <!-- Forgot password -->
                    <p class="forgot-text">
                        Forgot your password?
                        <RouterLink to="/" class="forgot-link">Click here</RouterLink>
                        to reset.
                    </p>

                    <!-- Login CTA -->
                    <button
                        type="submit"
                        class="cta-btn"
                        :disabled="!isEnabled || isLoggingIn"
                    >
                        <span v-if="isLoggingIn" class="btn-spinner"></span>
                        {{ isLoggingIn ? "Logging in…" : "Login" }}
                    </button>

                    <!-- Divider -->
                    <div class="divider">
                        <span class="divider-line"></span>
                        <span class="divider-text">or login using</span>
                        <span class="divider-line"></span>
                    </div>

                    <!-- Google button -->
                    <button type="button" class="google-btn">
                        <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Sign In with Google
                    </button>
                </form>

                <!-- Register link -->
                <p class="register-cta">
                    Don't have an account yet?
                    <RouterLink to="/register" class="register-link">Sign up for free!</RouterLink>
                </p>

                <!-- Footer links -->
                <div class="auth-footer">
                    <RouterLink to="/">Privacy Policy</RouterLink>
                    <span class="footer-dot">·</span>
                    <RouterLink to="/">Terms &amp; Conditions</RouterLink>
                    <span class="footer-dot">·</span>
                    <RouterLink to="/">Need help?</RouterLink>
                </div>
                <p class="auth-copyright">© 2026 TARO606. All Rights Reserved.</p>
            </div>
        </div>

    </div>
</template>

<style scoped>

/* ── Page shell ─────────────────────────── */
.auth-page {
    display: flex;
    min-height: 100vh;
    width: 100%;
    background: #faf9fc;
    animation: pageFadeIn 0.5s ease both;
}

@keyframes pageFadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
}

/* ── Hero panel ─────────────────────────── */
.hero-img-wrapper {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.hero-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: left center;
}

.hero-panel {
    background: #f8f6f6;   /* was #f8f5ef */
}

.circle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.07;
    background: #c4acab;
}
.circle-1 { width: 500px; height: 500px; top: -120px; left: -160px; }
.circle-2 { width: 340px; height: 340px; bottom: -80px; right: -100px; }
.circle-3 { width: 200px; height: 200px; top: 40%; left: 55%; background: #dfd9d9; opacity: 0.1; }


@keyframes floatCrumb {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-18px) rotate(20deg); }
}

.hero-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    position: relative;
    z-index: 1;
}

/* Can + splash composition */
.can-wrapper {
    position: relative;
    width: 220px;
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: floatCan 4s ease-in-out infinite;
}

@keyframes floatCan {
    0%, 100% { transform: translateY(0) rotate(-4deg); }
    50% { transform: translateY(-20px) rotate(-2deg); }
}

.can-svg {
    width: 200px;
    height: auto;
    position: relative;
    z-index: 2;
    filter: drop-shadow(0 24px 40px rgba(61,3,0,0.2));
}

.splash-svg {
    width: 260px;
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
    opacity: 0.75;
}

.hero-sub {
    font-family: 'Inter', sans-serif;
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #ebebeb;
    opacity: 0.55;
    margin: 0;
}

/* ── Auth panel ─────────────────────────── */
.auth-panel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem;
    background: #faf9fc;
}

.auth-inner {
    width: 100%;
    max-width: 420px;
    display: flex;
    flex-direction: column;
    gap: 0;
}

/* Brand */
.auth-brand {
    font-family: 'Yanone Kaffeesatz', sans-serif;
    font-size: 3rem;
    font-weight: 700;
    letter-spacing: 1px;
    text-decoration: none;
    line-height: 1;
    margin-bottom: 1.6rem;
    display: inline-block;
}

.brand-p { color: #3d0300; }
.brand-s { color: #ee807b; }

.auth-headline {
    font-family: 'Yanone Kaffeesatz', sans-serif;
    font-size: 1.9rem;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 0.25rem;
}

.auth-sub {
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    color: #6b7280;
    margin: 0 0 1.8rem;
}

/* Form */
.auth-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.field-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.field-label {
    font-family: 'Inter', sans-serif;
    font-size: 0.8rem;
    font-weight: 600;
    color: #374151;
    letter-spacing: 0.02em;
}

.field-input {
    height: 55px;
    border: 1.5px solid #d1d5db;
    border-radius: 14px;
    padding: 0 18px;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    color: #1a1a1a;
    background: #ffffff;
    outline: none;
    transition: border-color 0.25s ease, box-shadow 0.25s ease;
    width: 100%;
}

.field-input::placeholder { color: #9ca3af; }

.field-input:focus {
    border-color: #3d0300;
    box-shadow: 0 0 0 3px rgba(61, 3, 0, 0.08);
}

.field-input.input-error { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }

/* Password eye toggle */
.input-eye-wrap {
    position: relative;
    display: flex;
    align-items: center;
}

.input-eye-wrap .field-input {
    padding-right: 50px;
}

.eye-btn {
    position: absolute;
    right: 14px;
    background: none;
    border: none;
    cursor: pointer;
    color: #9ca3af;
    font-size: 1.05rem;
    padding: 0;
    transition: color 0.2s ease;
    display: flex;
    align-items: center;
}

.eye-btn:hover { color: #3d0300; }

.error-msg { font-family: 'Inter', sans-serif; font-size: 0.75rem; color: #ef4444; margin: 0.2rem 0 0; display: flex; align-items: center; gap: 0.3rem; }

/* Forgot password */
.forgot-text {
    font-family: 'Inter', sans-serif;
    font-size: 0.82rem;
    color: #6b7280;
    margin: -0.2rem 0 0.2rem;
}

.forgot-link {
    color: #2563eb;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.2s ease;
}
.forgot-link:hover { opacity: 0.75; }

/* CTA button */
.cta-btn {
    height: 55px;
    width: 100%;
    background: #3d0300;
    color: #faf9fc;
    border: none;
    border-radius: 14px;
    font-family: 'Inter', sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.25rem;
}

.cta-btn:hover:not(:disabled) {
    background: #ee807b;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(238, 128, 123, 0.35);
}

.cta-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

/* Spinner */
.btn-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Divider */
.divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0.25rem 0;
}

.divider-line {
    flex: 1;
    height: 1px;
    background: #d1d5db;
}

.divider-text {
    font-family: 'Inter', sans-serif;
    font-size: 0.78rem;
    color: #9ca3af;
    white-space: nowrap;
}

/* Google button */
.google-btn {
    height: 55px;
    width: 100%;
    background: #ffffff;
    border: 1.5px solid #d1d5db;
    border-radius: 14px;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.2s ease;
}

.google-btn:hover {
    border-color: #9ca3af;
    box-shadow: 0 4px 12px rgba(0,0,0,0.07);
    transform: translateY(-1px);
}

.google-icon { width: 20px; height: 20px; }

/* Register link */
.register-cta {
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
    color: #6b7280;
    text-align: center;
    margin: 1.2rem 0 1rem;
    position: relative;
    z-index:1;
}

.register-link {
    font-weight: 700;
    color: #3d0300;
    text-decoration: underline;
    text-underline-offset: 2px;
    transition: color 0.2s ease;
}
.register-link:hover { color: #ee807b; }

/* Footer */
.auth-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 0.4rem;
}

.auth-footer a {
    font-family: 'Inter', sans-serif;
    font-size: 0.78rem;
    color: #9ca3af;
    text-decoration: none;
    transition: color 0.2s ease;
}
.auth-footer a:hover { color: #3d0300; }

.footer-dot { color: #d1d5db; font-size: 0.7rem; }

.auth-copyright {
    font-family: 'Inter', sans-serif;
    font-size: 0.75rem;
    color: #d1d5db;
    text-align: center;
    margin: 0;
}

/* ── Responsive ─────────────────────────── */
@media (max-width: 991.98px) {
    .auth-page { flex-direction: column-reverse; }
    .hero-panel {
        flex: 0 0 auto;
        max-width: 100%;
        width: 100%;
        padding: 3rem 1rem 2rem;
    }
    .can-svg { width: 150px; }
    .splash-svg { width: 200px; }
    .auth-panel { padding: 2.5rem 1.5rem 1rem; }
}

@media (max-width: 575.98px) {
    .auth-brand { font-size: 2.4rem; }
    .auth-headline { font-size: 1.6rem; }
    .hero-panel { padding: 2.5rem 1rem 1.5rem; }
    .can-svg { width: 120px; }
    .splash-svg { width: 170px; }
}
</style>