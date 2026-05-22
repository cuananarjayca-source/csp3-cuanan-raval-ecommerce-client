<script setup>
import { ref } from 'vue';
import { createProduct, createStock, getErrorMessage } from '../services/api.js';

// ——— Emits ———
const emit = defineEmits(['done']);

// ——— Form State ———
const name = ref('');
const description = ref('');
const price = ref('');
const quantity = ref('');
const loading = ref(false);
const error = ref(null);

// ——— Submit ———
async function handleSubmit() {
  error.value = null;
  loading.value = true;

  try {
    // Step 1: Create the product
    const result = await createProduct({
      name: name.value,
      description: description.value,
      price: Number(price.value),
    });

    // Step 2: Create stock using the returned product ID
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
  <div class="row justify-content-center">
    <div class="col-12 col-md-8 col-lg-6">

      <h2 class="mb-4">Add Product</h2>

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
          <label for="quantity" class="form-label">Initial Stock Quantity</label>
          <input id="quantity" v-model="quantity" type="number" class="form-control" placeholder="0" min="0" required />
        </div>

        <button type="submit" class="btn btn-success w-100" :disabled="loading">
          {{ loading ? 'Creating...' : 'Add Product' }}
        </button>

      </form>
    </div>
  </div>
</template>