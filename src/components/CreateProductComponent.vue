<script setup>
import { ref, computed } from 'vue';
import { createProduct, createStock, uploadImage, getErrorMessage } from '../services/api.js';
import { Notyf } from 'notyf'; // 1. Import Notyf

// 2. Initialize Notyf with configuration
const notyf = new Notyf({
    duration: 3000,
    position: {
        x: 'right',
        y: 'top',
    }
});

const imageFile = ref(null);
const imagePreview = ref(null);

// ——— Emits ———
const emit = defineEmits(['done']);

// ——— Form State ———
const name = ref('');
const description = ref('');
const price = ref('');
const quantity = ref('');
const loading = ref(false);
const error = ref(null);

// ——— Real-time Validation States ———
const isNameInvalid = computed(() => name.value.length > 0 && name.value.trim() === '');
const isDescInvalid = computed(() => description.value.length > 0 && description.value.trim() === '');
const isPriceInvalid = computed(() => price.value !== '' && (Number(price.value) <= 0 || isNaN(Number(price.value))));
const isQuantityInvalid = computed(() => quantity.value !== '' && (!Number.isInteger(Number(quantity.value)) || Number(quantity.value) < 0));

// Form validity check for the submit button
const isFormValid = computed(() => {
    return name.value.trim() !== '' &&
           description.value.trim() !== '' &&
           price.value !== '' && !isPriceInvalid.value &&
           quantity.value !== '' && !isQuantityInvalid.value;
});

function handleImageChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  imageFile.value = file;
  imagePreview.value = URL.createObjectURL(file);
}

async function handleSubmit() {
  error.value = null;
  loading.value = true;

  try {
    // Step 1: Upload image to Cloudinary if a file was selected
    let imageUrl = null;
    if (imageFile.value) {
      imageUrl = await uploadImage(imageFile.value);
    }

    // Step 2: Create the product with the image URL
    const result = await createProduct({
      name: name.value,
      description: description.value,
      price: Number(price.value),
      imageUrl
    });

    // Step 3: Create stock
    await createStock(result.product._id, Number(quantity.value));

    emit('done');
  } catch (err) {
    error.value = getErrorMessage(err, 'Failed to create product');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
    <div class="add-product-container">
        
        <div class="form-header">
            <h2 class="form-title">Add New Product</h2>
            <p class="form-sub">Enter the product details and initial stock level below.</p>
        </div>

        <!-- Alert Box -->
        <div v-if="error" class="alert-box">
            <i class="bi bi-exclamation-triangle-fill"></i>
            {{ error }}
        </div>

        <!-- Main Form -->
        <form @submit.prevent="handleSubmit" class="taro-form" novalidate>

            <div class="field-group">
                <label for="name" class="field-label">Product Name</label>
                <input 
                    id="name" 
                    v-model="name" 
                    type="text" 
                    class="field-input" 
                    :class="{ 'input-error': isNameInvalid }" 
                    placeholder="e.g. Taro Milk Tea" 
                    required 
                />
                <p v-if="isNameInvalid" class="error-msg">
                    <i class="bi bi-exclamation-circle"></i> Name cannot be blank
                </p>
            </div>

            <div class="field-group">
                <label for="description" class="field-label">Description</label>
                <textarea 
                    id="description" 
                    v-model="description" 
                    class="field-input textarea" 
                    :class="{ 'input-error': isDescInvalid }" 
                    placeholder="Describe the product..." 
                    rows="3" 
                    required
                ></textarea>
                <p v-if="isDescInvalid" class="error-msg">
                    <i class="bi bi-exclamation-circle"></i> Description cannot be blank
                </p>
            </div>

            <!-- Price and Quantity Row -->
            <div class="row-group">
                <div class="field-group w-50">
                    <label for="price" class="field-label">Price (₱)</label>
                    <input 
                        id="price" 
                        v-model="price" 
                        type="number" 
                        class="field-input" 
                        :class="{ 'input-error': isPriceInvalid }" 
                        placeholder="0.00" 
                        min="0.01" 
                        step="0.01"
                        required 
                    />
                    <p v-if="isPriceInvalid" class="error-msg">
                        <i class="bi bi-exclamation-circle"></i> Must be greater than 0
                    </p>
                </div>

                <div class="field-group w-50">
                    <label for="quantity" class="field-label">Initial Stock</label>
                    <input 
                        id="quantity" 
                        v-model="quantity" 
                        type="number" 
                        class="field-input" 
                        :class="{ 'input-error': isQuantityInvalid }" 
                        placeholder="0" 
                        min="0" 
                        required 
                    />
                    <p v-if="isQuantityInvalid" class="error-msg">
                        <i class="bi bi-exclamation-circle"></i> Must be a valid whole number
                    </p>
                </div>
            </div>

            <div class="field-group">
                <label for="image" class="field-label">Product Image (optional)</label>
                <input 
                    id="image" 
                    type="file" 
                    accept="image/*" 
                    class="field-input"
                    style="padding-top: 14px;"
                    @change="handleImageChange" 
                />
            </div>

            <div v-if="imagePreview" style="margin-top: -0.5rem;">
                <img :src="imagePreview" alt="Image preview" style="max-width: 100%; border-radius: 12px; max-height: 200px; object-fit: cover;" />
            </div>

            <!-- Action Buttons -->
            <div class="form-actions">
                <button type="button" class="btn-ghost" @click="emit('done')" :disabled="loading">Cancel</button>
                <button type="submit" class="cta-btn" :disabled="!isFormValid || loading">
                    <span v-if="loading" class="btn-spinner"></span>
                    {{ loading ? 'Creating...' : 'Add Product' }}
                </button>
            </div>

        </form>
    </div>
</template>

<style scoped>
/* ─── Form Container ────────────────────────────────── */
.add-product-container {
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
}

.form-header {
    margin-bottom: 1.5rem;
}

.form-title {
    font-family: 'Yanone Kaffeesatz', sans-serif;
    font-size: 2rem;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 0.25rem 0;
}

.form-sub {
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    color: #6b7280;
    margin: 0;
}

/* ─── Alert Box ─────────────────────────────────────── */
.alert-box {
    background: #fee2e2;
    color: #b91c1c;
    border: 1px solid #f87171;
    padding: 0.85rem 1rem;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 500;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* ─── Form Inputs ───────────────────────────────────── */
.taro-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.row-group {
    display: flex;
    gap: 1.25rem;
}

.w-50 {
    flex: 1;
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
    height: 52px;
    border: 1.5px solid #d1d5db;
    border-radius: 12px;
    padding: 0 16px;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    color: #1a1a1a;
    background: #ffffff;
    outline: none;
    transition: border-color 0.25s ease, box-shadow 0.25s ease;
    width: 100%;
}

.field-input.textarea {
    height: auto;
    padding: 12px 16px;
    resize: vertical;
    min-height: 100px;
}

.field-input::placeholder { color: #9ca3af; }

.field-input:focus {
    border-color: #3d0300;
    box-shadow: 0 0 0 3px rgba(61, 3, 0, 0.08);
}

.field-input.input-error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-msg {
    font-family: 'Inter', sans-serif;
    font-size: 0.75rem;
    color: #ef4444;
    margin: 0.2rem 0 0;
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

/* ─── Buttons ───────────────────────────────────────── */
.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1.5rem;
    border-top: 1px solid #f3f4f6;
}

.cta-btn {
    height: 48px;
    background: #3d0300;
    color: #faf9fc;
    border: none;
    border-radius: 12px;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0 1.5rem;
}

.cta-btn:hover:not(:disabled) {
    background: #ee807b;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(238, 128, 123, 0.3);
}

.cta-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-ghost {
    height: 48px;
    background: transparent;
    color: #374151;
    border: 1px solid #d1d5db;
    border-radius: 12px;
    font-family: 'Inter', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0 1.5rem;
}

.btn-ghost:hover:not(:disabled) {
    background: #f3f4f6;
    color: #1a1a1a;
}

.btn-ghost:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

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

/* ─── Responsive ────────────────────────────────────── */
@media (max-width: 575.98px) {
    .row-group {
        flex-direction: column;
        gap: 1.25rem;
    }
    
    .w-50 {
        width: 100%;
    }
    
    .form-actions {
        flex-direction: column-reverse;
    }
    
    .cta-btn, .btn-ghost {
        width: 100%;
    }
}
</style>