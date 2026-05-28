<script setup>
import { ref, computed, watch } from 'vue';
import { updateProduct, updateStock, uploadImage, createStock, getErrorMessage } from '../services/api.js';
import { Notyf } from 'notyf';

const notyf = new Notyf({ duration: 3000, position: { x: 'right', y: 'top' } });

// ——— Props & Emits ———
const props = defineProps({
  product: { type: Object, required: true },
  currentStock: { type: [Number, String], default: 0 }
});

const emit = defineEmits(['done']);
const imageFile = ref(null);
const imagePreview = ref(null);

// ——— Form State ———
const name = ref('');
const description = ref('');
const price = ref('');
const quantity = ref('');
const loading = ref(false);
const error = ref(null);

// ——— Validation States ———
const isNameInvalid = computed(() => name.value.length > 0 && name.value.trim() === '');
const isDescInvalid = computed(() => description.value.length > 0 && description.value.trim() === '');
const isPriceInvalid = computed(() => price.value !== '' && (Number(price.value) <= 0 || isNaN(Number(price.value))));
const isQuantityInvalid = computed(() => quantity.value !== '' && (!Number.isInteger(Number(quantity.value)) || Number(quantity.value) < 0));

const isFormValid = computed(() => {
    return name.value.trim() !== '' &&
           description.value.trim() !== '' &&
           price.value !== '' && !isPriceInvalid.value &&
           quantity.value !== '' && !isQuantityInvalid.value;
});

// ——— Watchers for Prop Prefill ———
watch(() => props.product, (val) => {
  if (val) {
    name.value = val.name;
    description.value = val.description;
    price.value = val.price;
    // *** NEW: pre-fill existing image as preview ***
    imagePreview.value = val.imageUrl || null;
  }
}, { immediate: true });

watch(() => props.currentStock, (val) => {
  quantity.value = val === 'N/A' ? 0 : val;
}, { immediate: true });

function handleImageChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  imageFile.value = file;
  imagePreview.value = URL.createObjectURL(file);
}


// ——— Submit ———
async function handleSubmit() {
  error.value = null;
  loading.value = true;

  try {
    // *** NEW: upload new image if admin picked one, otherwise keep existing ***
    let imageUrl = props.product.imageUrl || null;
    if (imageFile.value) {
      imageUrl = await uploadImage(imageFile.value);
    }

    const stockPromise = props.currentStock === 'N/A'
      ? createStock(props.product._id, Number(quantity.value))
      : updateStock(props.product._id, Number(quantity.value));

    await Promise.all([
      updateProduct(props.product._id, {
        name: name.value,
        description: description.value,
        price: Number(price.value),
        imageUrl
      }),
      stockPromise
    ]);

    emit('done');
  } catch (err) {
    error.value = getErrorMessage(err, 'Failed to update product');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="add-product-container">
    <div class="form-header">
        <h2 class="form-title">Update Product</h2>
        <p class="form-sub">Modify the details for {{ product.name }}.</p>
    </div>

    <div v-if="error" class="alert-box">
        <i class="bi bi-exclamation-triangle-fill"></i> {{ error }}
    </div>

    <form @submit.prevent="handleSubmit" class="taro-form" novalidate>
        <div class="field-group">
            <label for="name" class="field-label">Product Name</label>
            <input id="name" v-model="name" type="text" class="field-input" :class="{ 'input-error': isNameInvalid }" required />
            <p v-if="isNameInvalid" class="error-msg"><i class="bi bi-exclamation-circle"></i> Name cannot be blank</p>
        </div>

        <div class="field-group">
            <label for="description" class="field-label">Description</label>
            <textarea id="description" v-model="description" class="field-input textarea" :class="{ 'input-error': isDescInvalid }" rows="3" required></textarea>
            <p v-if="isDescInvalid" class="error-msg"><i class="bi bi-exclamation-circle"></i> Description cannot be blank</p>
        </div>

        <div class="row-group">
            <div class="field-group w-50">
                <label for="price" class="field-label">Price (₱)</label>
                <input id="price" v-model="price" type="number" class="field-input" :class="{ 'input-error': isPriceInvalid }" min="0" step="0.01" required />
                <p v-if="isPriceInvalid" class="error-msg"><i class="bi bi-exclamation-circle"></i> Must be greater than 0</p>
            </div>

            <div class="field-group w-50">
                <label for="quantity" class="field-label">Stock Quantity</label>
                <input id="quantity" v-model="quantity" type="number" class="field-input" :class="{ 'input-error': isQuantityInvalid }" min="0" required />
                <p v-if="isQuantityInvalid" class="error-msg"><i class="bi bi-exclamation-circle"></i> Must be a valid number</p>
            </div>
        </div>
        <div>
          <label for="image">Product Image (optional)</label>
          <input id="image" type="file" accept="image/*" @change="handleImageChange" />
        </div>

        <!-- Shows existing image or new preview -->
        <div v-if="imagePreview">
          <img :src="imagePreview" alt="Image preview" />
        </div>

        <div class="form-actions">
            <button type="button" class="btn-ghost" @click="emit('done')" :disabled="loading">Cancel</button>
            <button type="submit" class="cta-btn" :disabled="!isFormValid || loading">
                <span v-if="loading" class="btn-spinner"></span>
                {{ loading ? 'Updating...' : 'Save Changes' }}
            </button>
        </div>
    </form>
  </div>
</template>

<style scoped>
/* NOTE: These styles match the CreateProductComponent styles exactly to ensure design consistency */
.add-product-container { max-width: 600px; margin: 0 auto; width: 100%; }
.form-header { margin-bottom: 1.5rem; }
.form-title { font-family: 'Yanone Kaffeesatz', sans-serif; font-size: 2rem; font-weight: 700; color: #1a1a1a; margin: 0 0 0.25rem 0; }
.form-sub { font-family: 'Inter', sans-serif; font-size: 0.9rem; color: #6b7280; margin: 0; }
.alert-box { background: #fee2e2; color: #b91c1c; border: 1px solid #f87171; padding: 0.85rem 1rem; border-radius: 12px; font-size: 0.85rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
.taro-form { display: flex; flex-direction: column; gap: 1.25rem; }
.row-group { display: flex; gap: 1.25rem; }
.w-50 { flex: 1; }
.field-group { display: flex; flex-direction: column; gap: 0.4rem; }
.field-label { font-family: 'Inter', sans-serif; font-size: 0.8rem; font-weight: 600; color: #374151; }
.field-input { height: 52px; border: 1.5px solid #d1d5db; border-radius: 12px; padding: 0 16px; font-family: 'Inter', sans-serif; font-size: 0.9rem; color: #1a1a1a; background: #ffffff; outline: none; width: 100%; transition: all 0.2s ease; }
.field-input.textarea { height: auto; min-height: 100px; padding: 12px 16px; }
.field-input:focus { border-color: #3d0300; box-shadow: 0 0 0 3px rgba(61, 3, 0, 0.08); }
.field-input.input-error { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); }
.error-msg { font-size: 0.75rem; color: #ef4444; margin: 0.2rem 0 0; display: flex; align-items: center; gap: 0.3rem; }
.form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; padding-top: 1.5rem; border-top: 1px solid #f3f4f6; }
.cta-btn { height: 48px; background: #3d0300; color: #faf9fc; border: none; border-radius: 12px; font-weight: 600; padding: 0 1.5rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; transition: all 0.3s ease; }
.cta-btn:hover:not(:disabled) { background: #ee807b; transform: translateY(-2px); }
.cta-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-ghost { height: 48px; background: transparent; color: #374151; border: 1px solid #d1d5db; border-radius: 12px; font-weight: 600; padding: 0 1.5rem; cursor: pointer; }
.btn-ghost:hover:not(:disabled) { background: #f3f4f6; }
.btn-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>