<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { Notyf } from 'notyf';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '../stores/global.js';
import { registerUser } from '../api.js';

const firstName = ref("");
const lastName = ref("");
const email = ref("");
const mobileNo = ref("");
const password = ref("");
const confirmPass = ref("");
const showPassword = ref(false);
const showConfirm = ref(false);
const isRegistering = ref(false);

const notyf = new Notyf();
const router = useRouter();
const globalStore = useGlobalStore();


const isEmailInvalid = computed(() => email.value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value));
const isMobileInvalid = computed(() => mobileNo.value.length > 0 && !/^[0-9]{11}$/.test(mobileNo.value));
const isPasswordInvalid = computed(() => password.value.length > 0 && password.value.length < 8);
const isConfirmInvalid = computed(() => confirmPass.value.length > 0 && confirmPass.value !== password.value);


const isEnabled = computed(() => {
    return firstName.value.trim() !== "" &&
           lastName.value.trim() !== "" &&
           email.value.trim() !== "" && !isEmailInvalid.value &&
           mobileNo.value.trim() !== "" && !isMobileInvalid.value &&
           password.value.length >= 8 &&
           confirmPass.value === password.value;
});

async function handleSubmit() {
    if (!isEnabled.value) return;
    isRegistering.value = true;
    try {
        let response = await registerUser({
            firstName: firstName.value,
            lastName: lastName.value,
            email: email.value,
            mobileNo: mobileNo.value,
            password: password.value
        });

        if (response.status === 201) {
            notyf.success(response.data.message || "Registered successfully!");
            router.push({ path: '/login' });
        } else {
            notyf.error("Registration Failed. Please contact administrator.");
        }
    } catch (e) {
        console.error(e);
        const serverMessage = e.response?.data?.message;
        notyf.error(serverMessage || "Registration Failed. Please contact administrator.");
    } finally {
        isRegistering.value = false;
    }
}

onBeforeMount(() => {
    if (globalStore.user?.token) {
        router.push({ path: '/' });
    }
});
</script>

<template>
    <div class="auth-page">

        <!-- ── LEFT AUTH PANEL ── -->
        <div class="auth-panel">
            <div class="auth-inner">

                <RouterLink to="/" class="auth-brand">
                    <span class="brand-p">TARO</span><span class="brand-s">&nbsp;606</span>
                </RouterLink>

                <h2 class="auth-headline">Create your account</h2>
                <p class="auth-sub">Fill in your details to get started.</p>

                <form @submit.prevent="handleSubmit" class="auth-form" novalidate>


                    <div class="name-row">
                        <div class="field-group">
                            <label for="reg-first" class="field-label">First Name</label>
                            <input id="reg-first" v-model="firstName" type="text" class="field-input" placeholder="First name" required />
                        </div>
                        <div class="field-group">
                            <label for="reg-last" class="field-label">Last Name</label>
                            <input id="reg-last" v-model="lastName" type="text" class="field-input" placeholder="Last name" required />
                        </div>
                    </div>

                    <!-- Email -->
                    <div class="field-group">
                        <label for="reg-email" class="field-label">Email</label>
                        <input id="reg-email" v-model="email" type="email" class="field-input" :class="{ 'input-error': isEmailInvalid }" placeholder="Enter your Email" autocomplete="email" required />
                        <p v-if="isEmailInvalid" class="error-msg">
                            <i class="bi bi-exclamation-circle"></i> Invalid email address
                        </p>
                    </div>

                    <!-- Mobile -->
                    <div class="field-group">
                        <label for="reg-mobile" class="field-label">Mobile Number</label>
                        <input id="reg-mobile" v-model="mobileNo" type="text" class="field-input" :class="{ 'input-error': isMobileInvalid }" placeholder="09XXXXXXXXX" maxlength="11" required />
                        <p v-if="isMobileInvalid" class="error-msg">
                            <i class="bi bi-exclamation-circle"></i> Must be exactly 11 digits
                        </p>
                    </div>

                    <!-- Password -->
                    <div class="field-group">
                        <label for="reg-pass" class="field-label">Password</label>
                        <div class="input-eye-wrap">
                            <input
                                id="reg-pass"
                                v-model="password"
                                :type="showPassword ? 'text' : 'password'"
                                class="field-input"
                                :class="{ 'input-error': isPasswordInvalid }"
                                placeholder="Min. 8 characters"
                                autocomplete="new-password"
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

                    <!-- Confirm password -->
                    <div class="field-group">
                        <label for="reg-confirm" class="field-label">Confirm Password</label>
                        <div class="input-eye-wrap">
                            <input
                                id="reg-confirm"
                                v-model="confirmPass"
                                :type="showConfirm ? 'text' : 'password'"
                                class="field-input"
                                :class="{ 'input-error': isConfirmInvalid }"
                                placeholder="Re-enter your password"
                                autocomplete="new-password"
                                required
                            />
                            <button type="button" class="eye-btn" @click="showConfirm = !showConfirm" :aria-label="showConfirm ? 'Hide' : 'Show'">
                                <i :class="showConfirm ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                            </button>
                        </div>
                        <p v-if="isConfirmInvalid" class="error-msg">
                            <i class="bi bi-exclamation-circle"></i> Passwords don't match
                        </p>
                    </div>

                    <!-- Submit -->
                    <button type="submit" class="cta-btn" :disabled="!isEnabled || isRegistering">
                        <span v-if="isRegistering" class="btn-spinner"></span>
                        {{ isRegistering ? "Creating account…" : "Create Account" }}
                    </button>

                </form>

                <p class="login-cta">
                    Already have an account?
                    <RouterLink to="/login" class="login-link">Login here</RouterLink>
                </p>

                <div class="auth-footer">
                    <RouterLink to="/privacy">Privacy Policy</RouterLink>
                    <span class="footer-dot">·</span>
                    <RouterLink to="/terms">Terms &amp; Conditions</RouterLink>
                    <span class="footer-dot">·</span>
                    <RouterLink to="/help">Need help?</RouterLink>
                </div>
                <p class="auth-copyright">© 2026 TARO606. All Rights Reserved.</p>

            </div>
        </div>

        <!-- ── RIGHT HERO PANEL ── -->
        <div class="hero-panel">
            <div class="hero-img-wrapper">
                <img src="../assets/images/cookies-and-cream-hero.png" alt="Cookies and Cream 606 Can" class="hero-img" />
            </div>
        </div>

    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Yanone+Kaffeesatz:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

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
.hero-panel {
    flex: 0 0 60%;
    max-width: 60%;
    background: #f8f6f6;   /* Matched to your login background */
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

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
    transform: scaleX(1);
}

.can-svg { width: 200px; height: auto; position: relative; z-index: 2; filter: drop-shadow(0 24px 40px rgba(61,3,0,0.2)); }

.splash-svg { width: 260px; position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); z-index: 1; opacity: 0.75; }

.hero-tagline { text-align: center; }

.hero-sub { font-family: 'Inter', sans-serif; font-size: 0.8rem; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: #3d0300; opacity: 0.55; margin: 0; }

/* Auth panel */
.auth-panel { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem 1.5rem; background: #faf9fc; overflow-y: auto; }

.auth-inner { width: 100%; max-width: 420px; display: flex; flex-direction: column; gap: 0; padding: 1.5rem 0; }

.auth-brand { font-family: 'Yanone Kaffeesatz', sans-serif; font-size: 3rem; font-weight: 700; letter-spacing: 1px; text-decoration: none; line-height: 1; margin-bottom: 1.2rem; display: inline-block; }
.brand-p { color: #3d0300; }
.brand-s { color: #ee807b; }

.auth-headline { font-family: 'Yanone Kaffeesatz', sans-serif; font-size: 1.9rem; font-weight: 700; color: #1a1a1a; margin: 0 0 0.25rem; }
.auth-sub { font-family: 'Inter', sans-serif; font-size: 0.9rem; color: #6b7280; margin: 0 0 1.4rem; }

.auth-form { display: flex; flex-direction: column; gap: 0.85rem; }

/* Name row */
.name-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

.field-group { display: flex; flex-direction: column; gap: 0.35rem; }

.field-label { font-family: 'Inter', sans-serif; font-size: 0.8rem; font-weight: 600; color: #374151; letter-spacing: 0.02em; }

.field-input { height: 52px; border: 1.5px solid #d1d5db; border-radius: 14px; padding: 0 18px; font-family: 'Inter', sans-serif; font-size: 0.88rem; color: #1a1a1a; background: #ffffff; outline: none; transition: border-color 0.25s ease, box-shadow 0.25s ease; width: 100%; }
.field-input::placeholder { color: #9ca3af; }
.field-input:focus { border-color: #3d0300; box-shadow: 0 0 0 3px rgba(61, 3, 0, 0.08); }
.field-input.input-error { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }

.input-eye-wrap { position: relative; display: flex; align-items: center; }
.input-eye-wrap .field-input { padding-right: 50px; }
.eye-btn { position: absolute; right: 14px; background: none; border: none; cursor: pointer; color: #9ca3af; font-size: 1.05rem; padding: 0; transition: color 0.2s ease; display: flex; align-items: center; }
.eye-btn:hover { color: #3d0300; }

.error-msg { font-family: 'Inter', sans-serif; font-size: 0.75rem; color: #ef4444; margin: 0.2rem 0 0; display: flex; align-items: center; gap: 0.3rem; }

.cta-btn { height: 55px; width: 100%; background: #3d0300; color: #faf9fc; border: none; border-radius: 14px; font-family: 'Inter', sans-serif; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-top: 0.25rem; }
.cta-btn:hover:not(:disabled) { background: #ee807b; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(238,128,123,0.35); }
.cta-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.btn-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }

.login-cta { font-family: 'Inter', sans-serif; font-size: 0.85rem; color: #6b7280; text-align: center; margin: 1rem 0 0.8rem; }
.login-link { font-weight: 700; color: #3d0300; text-decoration: underline; text-underline-offset: 2px; transition: color 0.2s ease; }
.login-link:hover { color: #ee807b; }

.auth-footer { display: flex; align-items: center; justify-content: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.4rem; }
.auth-footer a { font-family: 'Inter', sans-serif; font-size: 0.78rem; color: #9ca3af; text-decoration: none; transition: color 0.2s ease; }
.auth-footer a:hover { color: #3d0300; }
.footer-dot { color: #d1d5db; font-size: 0.7rem; }
.auth-copyright { font-family: 'Inter', sans-serif; font-size: 0.75rem; color: #d1d5db; text-align: center; margin: 0; }

/* Responsive */
@media (max-width: 991.98px) {
    .auth-page { flex-direction: column; }
    .hero-panel { flex: 0 0 auto; max-width: 100%; width: 100%; padding: 3rem 1rem 2rem; }
    .can-svg { width: 150px; }
    .splash-svg { width: 200px; }
    .auth-panel { padding: 2.5rem 1.5rem 1rem; }
}

@media (max-width: 768px) {
    /* Completely hide the background hero image module on mobile viewports */
    .hero-panel {
        display: none !important;
    }
}
</style>