<script setup>
import { ref, onMounted } from 'vue';
import CreateProductComponent from '../components/CreateProductComponent.vue';
import UpdateProductComponent from '../components/UpdateProductComponent.vue';

// *** UPDATED: added getAllStock to imports, merged into single import line ***
import { getAllProducts, archiveProduct, activateProduct, getAllStock, getErrorMessage } from '../services/api.js';

// ——— State ———
const products = ref([]);
const activeView = ref(null); // null | 'create' | 'update'
const selectedProduct = ref(null);

// *** NEW: stocks ref to hold all stock records ***
const stocks = ref([]);

// *** NEW: helper to match a product's stock quantity by productId ***
function getStockForProduct(productId) {
  const stock = stocks.value.find(s => s.productId._id === productId);
  return stock ? stock.quantity : 'N/A';
}

// *** UPDATED: now fetches products and stocks in parallel ***
async function loadProducts() {
  try {
    [products.value, stocks.value] = await Promise.all([
      getAllProducts(),
      getAllStock()
    ]);
  } catch (err) {
    console.error('Failed to load data:', getErrorMessage(err));
  }
}

// ——— View Switching ———
function showView(view, product = null) {
  activeView.value = view;
  selectedProduct.value = product;
}

// ——— Done handler (called when child emits 'done') ———
async function onDone() {
  showView(null);
  await loadProducts();
}

// ——— Disable / Activate ———
async function handleDisable(productId) {
  try {
    await archiveProduct(productId);
    await loadProducts();
  } catch (err) {
    console.error('Failed to disable product:', getErrorMessage(err));
  }
}

async function handleActivate(productId) {
  try {
    await activateProduct(productId);
    await loadProducts();
  } catch (err) {
    console.error('Failed to activate product:', getErrorMessage(err));
  }
}

// ——— On Mount ———
onMounted(loadProducts);
</script>

<template>
  <div class="container-fluid py-4">

    <!-- Top Action Buttons -->
    <div class="d-flex flex-wrap gap-2 mb-4">
      <button class="btn btn-success" @click="showView('create')">Add Product</button>
      <button class="btn btn-secondary">Orders</button>
    </div>

    <!-- Product Table -->
    <div v-if="activeView === null" class="table-responsive">
      <table class="table table-bordered table-hover align-middle">
        <thead class="table-dark">
          <tr>
            <th>Name</th>
            <th class="d-none d-md-table-cell">Description</th>
            <th>Price</th>
            <!-- *** NEW: Stock column header, hidden on smallest screens *** -->
            <th class="d-none d-sm-table-cell">Stock</th>
            <th class="d-none d-sm-table-cell">Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product._id">
            <td>{{ product.name }}</td>
            <td class="d-none d-md-table-cell">{{ product.description }}</td>
            <td>₱{{ product.price }}</td>
            <!-- *** NEW: Stock quantity cell matched from stocks ref *** -->
            <td class="d-none d-sm-table-cell">{{ getStockForProduct(product._id) }}</td>
            <td class="d-none d-sm-table-cell">
              <span :class="product.isActive ? 'badge bg-success' : 'badge bg-secondary'">
                {{ product.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <div class="d-flex flex-wrap gap-1">
                <button class="btn btn-primary btn-sm" @click="showView('update', product)">Update</button>
                <button v-if="product.isActive" class="btn btn-danger btn-sm" @click="handleDisable(product._id)">Disable</button>
                <button v-else class="btn btn-success btn-sm" @click="handleActivate(product._id)">Activate</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Product Component -->
    <div v-if="activeView === 'create'">
      <button class="btn btn-secondary mb-3" @click="showView(null)">Back</button>
      <CreateProductComponent @done="onDone" />
    </div>

    <!-- *** UPDATED: now passes stock quantity as prop to UpdateProductComponent *** -->
    <div v-if="activeView === 'update'">
      <button class="btn btn-secondary mb-3" @click="showView(null)">Back</button>
      <UpdateProductComponent
        :product="selectedProduct"
        :currentStock="getStockForProduct(selectedProduct._id)"
        @done="onDone"
      />
    </div>

  </div>
</template>