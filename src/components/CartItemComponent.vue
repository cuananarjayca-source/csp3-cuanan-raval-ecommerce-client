<script setup>
import { ref, computed, watch } from "vue";
import { updateCartQuantity } from "../api.js";

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(["updated", "remove"]);

const localQuantity = ref(props.item.quantity);
const isLoading = ref(false);

const localSubtotal = computed(() => localQuantity.value * props.item.productId.price);

watch(
  () => props.item.quantity,
  (newVal) => {
    localQuantity.value = newVal;
  }
);

const increment = async () => {
  localQuantity.value++;
  await syncQuantity();
};

const decrement = async () => {
  if (localQuantity.value <= 1) return;
  localQuantity.value--;
  await syncQuantity();
};

const syncQuantity = async () => {
  isLoading.value = true;
  try {
    await updateCartQuantity(props.item.productId._id, localQuantity.value);
    emit("updated");
  } catch (err) {
    console.error("Update failed:", err.response?.data);
    // Revert on failure
    localQuantity.value = props.item.quantity;
  } finally {
    isLoading.value = false;
  }
};

const handleRemove = () => {
  emit("remove", props.item.productId._id);
};
</script>

<template>
  <div class="card shadow-sm mb-3 p-3">
    <div class="row align-items-center g-3">

      <!-- Product Image -->
      <div class="col-3 col-md-2">
        <img
          :src="item.productId.imageUrl || 'https://placehold.co/100x100?text=No+Image'"
          :alt="item.productId.name"
          class="img-fluid rounded"
          style="object-fit: cover; height: 80px; width: 80px;"
        />
      </div>

      <!-- Product Info -->
      <div class="col-9 col-md-4">
        <h6 class="fw-bold mb-1">{{ item.productId.name }}</h6>
        <p class="text-muted mb-0 small">₱{{ item.productId.price }}</p>
      </div>

      <!-- Quantity Stepper -->
      <div class="col-6 col-md-3 d-flex align-items-center gap-2">
        <button
          class="btn btn-sm btn-outline-secondary"
          :disabled="localQuantity <= 1 || isLoading"
          @click="decrement"
        >
          <i class="bi bi-dash"></i>
        </button>
        <span class="fw-bold">{{ localQuantity }}</span>
        <button
          class="btn btn-sm btn-outline-secondary"
          :disabled="isLoading"
          @click="increment"
        >
          <i class="bi bi-plus"></i>
        </button>
      </div>

      <!-- Subtotal -->
      <div class="col-4 col-md-2 text-center">
        <p class="fw-bold mb-0">₱{{ localSubtotal }}</p>
        <p class="text-muted small mb-0">subtotal</p>
      </div>

      <!-- Remove Button -->
      <div class="col-2 col-md-1 text-end">
        <button
          class="btn btn-sm btn-outline-danger"
          :disabled="isLoading"
          @click="handleRemove"
        >
          <i class="bi bi-trash"></i>
        </button>
      </div>

    </div>
  </div>
</template>
<style scoped>

</style>
