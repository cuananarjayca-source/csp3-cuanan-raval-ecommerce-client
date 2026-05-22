<script setup>
import { ref, watch } from 'vue';
import { updateProduct, updateStock, createStock, getErrorMessage } from '../services/api.js';

// ——— Props & Emits ———
const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  currentStock: {
    type: [Number, String],
    default: 0
  }
});

const emit = defineEmits(['done']);

// ——— Form State ———
const name = ref('');
const description = ref('');
const price = ref('');
const quantity = ref('');
const loading = ref(false);
const error = ref(null);

// ——— Pre-fill form when product prop changes ———
watch(() => props.product, (val) => {
  if (val) {
    name.value = val.name;
    description.value = val.description;
    price.value = val.price;
  }
}, { immediate: true });

// ——— Pre-fill stock when currentStock prop changes ———
watch(() => props.currentStock, (val) => {
  quantity.value = val === 'N/A' ? 0 : val;
}, { immediate: true });

// ——— Submit ———
async function handleSubmit() {
  error.value = null;
  loading.value = true;

  try {
    // *** FIX: if currentStock is 'N/A' the product has no stock record yet
    // so we createStock instead of updateStock to handle stale/old documents ***
    const stockPromise = props.currentStock === 'N/A'
      ? createStock(props.product._id, Number(quantity.value))
      : updateStock(props.product._id, Number(quantity.value));

    await Promise.all([
      updateProduct(props.product._id, {
        name: name.value,
        description: description.value,
        price: Number(price.value),
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
  <div class="row justify-content-center">
    <div class="col-12 col-md-8 col-lg-6">

      <h2 class="mb-4">Update Product</h2>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <form @submit.prevent="handleSubmit">

        <div class="mb-3">
          <label for="name" class="form-label">Product Name</label>
          <input id="name" v-model="name" type="text" class="form-control" placeholder="Product name" required />
        </div>

        <div class="mb-3">
          <label for="description" class="form-label">Description</label>
          <textarea id="description" v-model="description" class="form-control" placeholder="Product description" rows="3" required></textarea>
        </div>

        <div class="mb-3">
          <label for="price" class="form-label">Price</label>
          <div class="input-group">
            <span class="input-group-text">₱</span>
            <input id="price" v-model="price" type="number" class="form-control" placeholder="0" min="0" required />
          </div>
        </div>

        <div class="mb-4">
          <label for="quantity" class="form-label">Stock Quantity</label>
          <input id="quantity" v-model="quantity" type="number" class="form-control" placeholder="0" min="0" required />
        </div>

        <button type="submit" class="btn btn-primary w-100" :disabled="loading">
          {{ loading ? 'Updating...' : 'Update' }}
        </button>

      </form>
    </div>
  </div>
</template>