<script setup>
import { reactive, ref, computed } from 'vue';

const form = reactive({
    fullName:     '',
    email:        '',
    mobileNumber: '',
    message:      '',
});

const isEmailInvalid = computed(() => form.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email));
const isMobileInvalid = computed(() => form.mobileNumber.length > 0 && !/^[0-9]{11}$/.test(form.mobileNumber));
const isNameInvalid = computed(() => form.fullName.length > 0 && form.fullName.trim() === '');
const isMessageInvalid = computed(() => form.message.length > 0 && form.message.trim() === '');

const isFormValid = computed(() => {
    return form.fullName.trim() !== '' && !isNameInvalid.value &&
           form.email.trim() !== '' && !isEmailInvalid.value &&
           form.mobileNumber.trim() !== '' && !isMobileInvalid.value &&
           form.message.trim() !== '' && !isMessageInvalid.value;
});

const submitted = ref(false);
const submitting = ref(false);

function handleSubmit() {
    if (!isFormValid.value) return;

    submitting.value = true;
    setTimeout(() => {
        submitting.value = false;
        submitted.value  = true;
        form.fullName     = '';
        form.email        = '';
        form.mobileNumber = '';
        form.message      = '';
        setTimeout(() => (submitted.value = false), 4000);
    }, 800);
}
</script>

<template>
    <section id= "contact-us" class="contact-section">

        <div class="contact-inner container">

            <div class="contact-header d-flex align-items-center justify-content-center gap-3">
                <span class="header-bar" aria-hidden="true"></span>
                <h2 class="contact-title">CONTACT US</h2>
                <span class="header-bar" aria-hidden="true"></span>
            </div>

            
            <div class="row g-5 align-items-center justify-content-center">

                
                <div class="col-12 col-lg-6 d-flex justify-content-center">
                    <div class="form-panel">

                        <p class="form-eyebrow">Send us a message</p>

                        <Transition name="toast">
                            <div v-if="submitted" class="success-toast">
                                <i class="bi bi-check-circle-fill"></i>
                                Message sent — we'll be in touch soon!
                            </div>
                        </Transition>

                        <form @submit.prevent="handleSubmit">

                            <div class="field-group">
                                <input
                                    v-model="form.fullName"
                                    type="text"
                                    class="contact-input"
                                    :class="{ 'input-error': isNameInvalid }"
                                    placeholder="Full Name"
                                    required
                                    autocomplete="name"
                                />
                                <p v-if="isNameInvalid" class="error-msg">Name is required</p>
                            </div>

                            <div class="field-group">
                                <input
                                    v-model="form.email"
                                    type="email"
                                    class="contact-input"
                                    :class="{ 'input-error': isEmailInvalid }"
                                    placeholder="E-mail"
                                    required
                                    autocomplete="email"
                                />
                                <p v-if="isEmailInvalid" class="error-msg">Invalid email address</p>
                            </div>

                            <div class="field-group">
                                <input
                                    v-model="form.mobileNumber"
                                    type="tel"
                                    class="contact-input"
                                    :class="{ 'input-error': isMobileInvalid }"
                                    placeholder="Mobile Number (11 Digits)"
                                    autocomplete="tel"
                                    required
                                    maxlength="11"
                                    pattern="[0-9]{11}"
                                    title="Please enter exactly 11 digits"
                                    @input="form.mobileNumber = $event.target.value.replace(/[^0-9]/g, '')"
                                />
                                <p v-if="isMobileInvalid" class="error-msg">Must be exactly 11 digits</p>
                            </div>

                            <div class="field-group">
                                <textarea
                                    v-model="form.message"
                                    class="contact-input contact-textarea"
                                    :class="{ 'input-error': isMessageInvalid }"
                                    placeholder="Message"
                                    required
                                ></textarea>
                                <p v-if="isMessageInvalid" class="error-msg">Message cannot be empty</p>
                            </div>

                            <button
                                type="submit"
                                class="submit-btn"
                                :disabled="submitting || !isFormValid"
                            >
                                <span v-if="submitting" class="submit-spinner"></span>
                                <span v-else>Submit</span>
                            </button>

                        </form>
                    </div>
                </div>

                <div class="col-12 col-lg-6 d-flex justify-content-center">
                    <div class="brand-art">
                        <span class="corner corner--tl" aria-hidden="true"></span>
                        <span class="corner corner--tr" aria-hidden="true"></span>
                        <span class="corner corner--bl" aria-hidden="true"></span>
                        <span class="corner corner--br" aria-hidden="true"></span>

                        <div class="brand-art-inner">
                            <span class="brand-the">The</span>
                            <span class="brand-name">Taro606</span>
                            <span class="brand-group">Group</span>
                            <span class="brand-subtitle">HANDCRAFTED DELIGHT</span>
                        </div>

                        <div class="art-rule art-rule--top" aria-hidden="true"></div>
                        <div class="art-rule art-rule--bottom" aria-hidden="true"></div>
                    </div>
                </div>

            </div>
        </div>
    </section>
</template>

<style scoped>
/* ── Section: bg-vintage.png as background ── */
.contact-section {
    position: relative;
    min-height: 100vh;
    padding: 6rem 3rem;
    display: flex;
    align-items: center;
    background-image: url('/images/bg-vintage.png');
    background-repeat: repeat;
    background-size: auto;
    background-position: center top;
    background-color: #ffffff;
}

/* ── Inner wrapper ── */
.contact-inner {
    position: relative;
    z-index: 1;
    width: 100%;
}

/* ── Header ── */
.contact-header {
    margin-bottom: 4rem;
    flex-wrap: wrap;
}

.header-bar {
    display: block;
    width: 10px;
    height: 60px;
    background: #b74444;
    border-radius: 2px;
    flex-shrink: 0;
}

.contact-title {
    font-family: 'Canva-Sunday', serif;
    font-size: clamp(2.8rem, 6vw, 5rem);
    font-weight: 700;
    letter-spacing: 0.15rem;
    text-transform: uppercase;
    color: #511717;
    margin: 0;
    line-height: 1;
}

/* ── Glassmorphism form panel ── */
.form-panel {
    width: 100%;
    max-width: 480px;
    padding: 3rem 2rem;
    position: relative;
    background: #3d1111;
    border-radius: 20px;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.06);
}

/* Subtle top accent line */
.form-panel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 10%;
    right: 10%;
    height: 2px;
    border-radius: 0 0 2px 2px;
    background: linear-gradient(90deg, transparent, #b74444, #ee807b, #b74444, transparent);
}

.form-eyebrow {
    font-family: 'Inter', sans-serif;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(250, 249, 252, 0.55);
    text-align: center;
    margin: 0 0 1.8rem;
}

/* ── Field groups ── */
.field-group {
    margin-bottom: 1rem;
}

/* ── Inputs ── */
.contact-input {
    width: 100%;
    height: 52px;
    background: rgba(255, 255, 255, 0.08);
    border: 1.5px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    padding: 0 1rem;
    color: #faf9fc;
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;
    letter-spacing: 0.02rem;
    text-align: center;
    outline: none;
    transition: border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
    box-sizing: border-box;
    -webkit-appearance: none;
    appearance: none;
}

.contact-input::placeholder {
    color: rgba(250, 249, 252, 0.5);
    text-align: center;
}

.contact-input:focus {
    border-color: #ee807b;
    background: rgba(238, 128, 123, 0.12);
    box-shadow: 0 0 0 3px rgba(238, 128, 123, 0.2);
    color: #faf9fc;
}

.contact-input.input-error {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.error-msg { 
    font-family: 'Inter', sans-serif; 
    font-size: 0.75rem; 
    color: #ef4444; 
    margin: 0.4rem 0 0; 
    display: block; 
    text-align: center; 
}

/* Autofill — keep maroon look */
.contact-input:-webkit-autofill,
.contact-input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px #4a1515 inset;
    -webkit-text-fill-color: #faf9fc;
    transition: background-color 5000s ease-in-out 0s;
}

/* ── Textarea ── */
.contact-textarea {
    height: auto;
    min-height: 160px;
    padding-top: 1rem;
    resize: none;
    vertical-align: top;
    line-height: 1.6;
    text-align: center;
}

/* ── Submit button ── */
.submit-btn {
    display: block;
    margin: 1.8rem auto 0;
    background: #faf9fc;
    color: #3d1111;
    border: none;
    border-radius: 999px;
    padding: 0.75rem 2.5rem;
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
    min-width: 140px;
}

.submit-btn:hover:not(:disabled) {
    background: #ee807b;
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(238, 128, 123, 0.4);
}

.submit-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
}

/* ── Spinner ── */
.submit-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(250,249,252,0.35);
    border-top-color: #faf9fc;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    vertical-align: middle;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Success toast ── */
.success-toast {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(60, 239, 105, 0.15);
    border: 1px solid rgba(0, 249, 104, 0.45);
    border-radius: 10px;
    color: #44b753;
    font-family: 'Inter', sans-serif;
    font-size: 0.78rem;
    padding: 0.7rem 1rem;
    margin-bottom: 1.2rem;
}

.toast-enter-active,
.toast-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.toast-enter-from,
.toast-leave-to     { opacity: 0; transform: translateY(-6px); }

/* ── Brand typography art ── */
.brand-art {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3.5rem 2.5rem;
    /* Lighter glass for the brand panel */
    background: rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(61, 3, 0, 0.08);
    min-width: 300px;
    max-width: 440px;
    width: 100%;
}

/* Corner bracket marks */
.corner {
    position: absolute;
    width: 22px;
    height: 22px;
    border-color: #b74444;
    border-style: solid;
}

.corner--tl { top: 10px;    left: 10px;    border-width: 2px 0 0 2px; }
.corner--tr { top: 10px;    right: 10px;   border-width: 2px 2px 0 0; }
.corner--bl { bottom: 10px; left: 10px;    border-width: 0 0 2px 2px; }
.corner--br { bottom: 10px; right: 10px;   border-width: 0 2px 2px 0; }

/* Horizontal accent rules */
.art-rule {
    position: absolute;
    left: 2.5rem;
    right: 2.5rem;
    height: 1px;
    background: linear-gradient(90deg, transparent, #b74444, transparent);
}

.art-rule--top    { top: 72px; }
.art-rule--bottom { bottom: 72px; }

/* Typography stack */
.brand-art-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 0;
}

.brand-the {
    font-family: 'Dancing Script', cursive;
    font-size: clamp(3rem, 5vw, 5rem);
    font-weight: 400;
    color: #ee807b;
    line-height: 0.9;
    display: block;
}

.brand-name {
    font-family: 'Canva-Sunday', serif;
    font-size: clamp(4rem, 8vw, 8rem);
    font-weight: 900;
    color: #3d1111;
    line-height: 0.85;
    letter-spacing: -0.05rem;
    display: block;
    -webkit-text-stroke: 1px rgba(183, 68, 68, 0.15);
}

.brand-group {
    font-family: 'Dancing Script', cursive;
    font-size: clamp(3rem, 5vw, 5rem);
    font-weight: 400;
    color: #ee807b;
    line-height: 0.9;
    display: block;
}

.brand-subtitle {
    display: block;
    font-family: 'Inter', sans-serif;
    font-size: 0.72rem;
    font-weight: 400;
    letter-spacing: 0.35rem;
    text-transform: uppercase;
    color: #555555;
    margin-top: 1.2rem;
}

/* ── Responsive ── */
@media (max-width: 991.98px) {
    .contact-section { padding: 5rem 2rem; }
    .contact-header  { margin-bottom: 3rem; }
}

@media (max-width: 767.98px) {
    .contact-section { padding: 4rem 1rem; }
    .header-bar      { height: 44px; }
    .form-panel      { padding: 2.5rem 1.5rem; }
    .brand-art       { min-width: unset; max-width: 100%; padding: 2.5rem 1.5rem; }
    .contact-header  { margin-bottom: 2.5rem; }
}

@media (max-width: 575.98px) {
    .art-rule--top    { top: 56px; }
    .art-rule--bottom { bottom: 56px; }
}
</style>